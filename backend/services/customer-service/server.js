const express = require('express');
const cors = require('cors');
const { db } = require('../../shared/database');
const { verifyToken } = require('../../shared/auth');
const { registerProcessErrorHandlers, bindServerErrorHandlers } = require('../../shared/error-handler');

registerProcessErrorHandlers('Customer Service');

const app = express();
const PORT = process.env.CUSTOMER_PORT || 3005;

app.use(cors());
app.use(express.json());

// Get user profile with stats
app.get('/api/customer/profile', verifyToken, (req, res) => {
    const userId = req.userId;

    try {
        const userStmt = db.prepare(
            "SELECT id, email, first_name, last_name, phone, avatar_url, created_at FROM users WHERE id = ?"
        );
        const user = userStmt.get(userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Get order stats
        const statsStmt = db.prepare(
            "SELECT COUNT(*) as orderCount, COALESCE(SUM(total_amount), 0) as totalSpent FROM orders WHERE user_id = ?"
        );
        const stats = statsStmt.get(userId);

        // Get address count
        const addrStmt = db.prepare(
            "SELECT COUNT(*) as addressCount FROM addresses WHERE user_id = ?"
        );
        const addrStats = addrStmt.get(userId);

        res.json({
            id: user.id,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
            phone: user.phone,
            avatar: user.avatar_url,
            createdAt: user.created_at,
            stats: {
                orderCount: stats.orderCount,
                totalSpent: stats.totalSpent,
                addressCount: addrStats.addressCount
            }
        });
    } catch (err) {
        console.error('Profile error:', err);
        res.status(500).json({ error: 'Database error' });
    }
});

// Update profile
app.put('/api/customer/profile', verifyToken, (req, res) => {
    const userId = req.userId;
    const { firstName, lastName, phone, avatar } = req.body;

    try {
        const stmt = db.prepare(
            "UPDATE users SET first_name = ?, last_name = ?, phone = ?, avatar_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
        );
        stmt.run(firstName, lastName, phone, avatar || null, userId);
        res.json({ message: 'Profile updated successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Update failed' });
    }
});

// Get addresses
app.get('/api/customer/addresses', verifyToken, (req, res) => {
    const userId = req.userId;

    try {
        const stmt = db.prepare(
            "SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC"
        );
        const addresses = stmt.all(userId);

        res.json(addresses.map(a => ({
            id: a.id,
            label: a.label,
            street: a.street,
            city: a.city,
            state: a.state,
            zipCode: a.zip_code,
            country: a.country,
            isDefault: a.is_default === 1
        })));
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
});

// Add address
app.post('/api/customer/addresses', verifyToken, (req, res) => {
    const userId = req.userId;
    const { label, street, city, state, zipCode, country, isDefault } = req.body;

    if (!street || !city || !zipCode) {
        return res.status(400).json({ error: 'Street, city and ZIP code required' });
    }

    try {
        if (isDefault) {
            const resetStmt = db.prepare("UPDATE addresses SET is_default = 0 WHERE user_id = ?");
            resetStmt.run(userId);
        }

        const stmt = db.prepare(
            "INSERT INTO addresses (user_id, label, street, city, state, zip_code, country, is_default) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
        );
        const result = stmt.run(userId, label || 'Home', street, city, state || '', zipCode, country || 'DE', isDefault ? 1 : 0);

        res.status(201).json({ id: result.lastInsertRowid, message: 'Address added' });
    } catch (err) {
        console.error('Add address error:', err);
        res.status(500).json({ error: 'Failed to add address' });
    }
});

// Update address
app.put('/api/customer/addresses/:id', verifyToken, (req, res) => {
    const userId = req.userId;
    const { id } = req.params;
    const { label, street, city, state, zipCode, country, isDefault } = req.body;

    try {
        if (isDefault) {
            const resetStmt = db.prepare("UPDATE addresses SET is_default = 0 WHERE user_id = ?");
            resetStmt.run(userId);
        }

        const stmt = db.prepare(
            "UPDATE addresses SET label = ?, street = ?, city = ?, state = ?, zip_code = ?, country = ?, is_default = ? WHERE id = ? AND user_id = ?"
        );
        const result = stmt.run(label, street, city, state, zipCode, country, isDefault ? 1 : 0, id, userId);

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Address not found' });
        }
        res.json({ message: 'Address updated' });
    } catch (err) {
        res.status(500).json({ error: 'Update failed' });
    }
});

// Delete address
app.delete('/api/customer/addresses/:id', verifyToken, (req, res) => {
    const userId = req.userId;
    const { id } = req.params;

    try {
        const stmt = db.prepare("DELETE FROM addresses WHERE id = ? AND user_id = ?");
        const result = stmt.run(id, userId);

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Address not found' });
        }
        res.json({ message: 'Address deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Delete failed' });
    }
});

// Get order history with details
app.get('/api/customer/orders', verifyToken, (req, res) => {
    const userId = req.userId;

    try {
        const ordersStmt = db.prepare(
            "SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC"
        );
        const orders = ordersStmt.all(userId);

        const fullOrders = orders.map(order => {
            const itemsStmt = db.prepare("SELECT * FROM order_items WHERE order_id = ?");
            const items = itemsStmt.all(order.id);
            let shippingAddress = {};

            try {
                shippingAddress = order.shipping_address ? JSON.parse(order.shipping_address) : {};
            } catch (parseError) {
                console.warn('Invalid shipping address payload for order', order.id, parseError.message);
            }

            return {
                ...order,
                shippingAddress,
                items: items.map(i => ({
                    productId: i.product_id,
                    productName: i.product_name,
                    quantity: i.quantity,
                    unitPrice: i.unit_price,
                    totalPrice: i.total_price
                }))
            };
        });

        res.json(fullOrders);
    } catch (err) {
        console.error('Orders error:', err);
        res.status(500).json({ error: 'Failed to load order details' });
    }
});

// Get dashboard stats
app.get('/api/customer/dashboard', verifyToken, (req, res) => {
    const userId = req.userId;

    try {
        const ordersStmt = db.prepare("SELECT COUNT(*) as count FROM orders WHERE user_id = ?");
        const totalOrders = ordersStmt.get(userId);

        const spentStmt = db.prepare("SELECT COALESCE(SUM(total_amount), 0) as total FROM orders WHERE user_id = ? AND status != 'cancelled'");
        const totalSpent = spentStmt.get(userId);

        const addrStmt = db.prepare("SELECT COUNT(*) as count FROM addresses WHERE user_id = ?");
        const addressCount = addrStmt.get(userId);

        const cartStmt = db.prepare("SELECT COUNT(*) as count FROM cart_items WHERE user_id = ?");
        const cartItems = cartStmt.get(userId);

        const lastStmt = db.prepare("SELECT created_at FROM orders WHERE user_id = ? ORDER BY created_at DESC LIMIT 1");
        const lastOrder = lastStmt.get(userId);

        res.json({
            totalOrders: totalOrders.count,
            totalSpent: totalSpent.total,
            addressCount: addressCount.count,
            cartItems: cartItems.count,
            lastOrderDate: lastOrder ? lastOrder.created_at : null
        });
    } catch (err) {
        console.error('Dashboard error:', err);
        res.status(500).json({ error: 'Stats error' });
    }
});

const server = app.listen(PORT, () => {
    console.log(`Customer Service running on port ${PORT}`);
});

bindServerErrorHandlers(server, 'Customer Service', PORT);

module.exports = app;

