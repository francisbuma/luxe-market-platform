const express = require('express');
const cors = require('cors');
const { db } = require('../../shared/database');
const { verifyToken } = require('../../shared/auth');
const { registerProcessErrorHandlers, bindServerErrorHandlers } = require('../../shared/error-handler');

registerProcessErrorHandlers('Order Service');

const app = express();
const PORT = process.env.ORDER_PORT || 3004;

app.use(cors());
app.use(express.json());

function generateOrderNumber() {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `LM-${timestamp}-${random}`;
}

// Create order
app.post('/api/orders', verifyToken, (req, res) => {
    const userId = req.userId;
    const { items, shippingAddress, paymentMethod = 'card', totalAmount } = req.body;

    if (!items || !items.length || !shippingAddress) {
        return res.status(400).json({ error: 'Items and shipping address required' });
    }

    const orderNumber = generateOrderNumber();

    try {
        db.exec('BEGIN TRANSACTION');

        const orderStmt = db.prepare(
            "INSERT INTO orders (user_id, order_number, total_amount, shipping_address, payment_method) VALUES (?, ?, ?, ?, ?)"
        );
        const orderResult = orderStmt.run(userId, orderNumber, totalAmount, JSON.stringify(shippingAddress), paymentMethod);

        const orderId = orderResult.lastInsertRowid;

        // Insert order items
        const itemStmt = db.prepare(`INSERT INTO order_items 
            (order_id, product_id, product_name, quantity, unit_price, total_price) 
            VALUES (?, ?, ?, ?, ?, ?)`);

        items.forEach(item => {
            itemStmt.run(orderId, item.productId, item.name, item.quantity, item.price, item.price * item.quantity);
        });

        // Update stock
        items.forEach(item => {
            const stockStmt = db.prepare("UPDATE products SET stock = stock - ? WHERE id = ?");
            stockStmt.run(item.quantity, item.productId);
        });

        // Clear cart
        const clearStmt = db.prepare("DELETE FROM cart_items WHERE user_id = ?");
        clearStmt.run(userId);

        db.exec('COMMIT');

        res.status(201).json({
            message: 'Order placed successfully',
            orderId,
            orderNumber,
            totalAmount
        });
    } catch (err) {
        console.error('Order error:', err);
        try { db.exec('ROLLBACK'); } catch (e) {}
        res.status(500).json({ error: 'Order creation failed' });
    }
});

// Get user orders
app.get('/api/orders', verifyToken, (req, res) => {
    const userId = req.userId;

    try {
        const stmt = db.prepare(
            "SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC"
        );
        const orders = stmt.all(userId);

        res.json(orders.map(o => ({
            id: o.id,
            orderNumber: o.order_number,
            status: o.status,
            totalAmount: o.total_amount,
            shippingAddress: JSON.parse(o.shipping_address),
            paymentMethod: o.payment_method,
            createdAt: o.created_at,
            updatedAt: o.updated_at
        })));
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
});

// Get order details
app.get('/api/orders/:orderId', verifyToken, (req, res) => {
    const userId = req.userId;
    const { orderId } = req.params;

    try {
        const orderStmt = db.prepare(
            "SELECT * FROM orders WHERE id = ? AND user_id = ?"
        );
        const order = orderStmt.get(orderId, userId);

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        const itemsStmt = db.prepare(
            "SELECT * FROM order_items WHERE order_id = ?"
        );
        const items = itemsStmt.all(orderId);

        res.json({
            ...order,
            shippingAddress: JSON.parse(order.shipping_address),
            items: items.map(i => ({
                id: i.id,
                productId: i.product_id,
                productName: i.product_name,
                quantity: i.quantity,
                unitPrice: i.unit_price,
                totalPrice: i.total_price
            }))
        });
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
});

// Cancel order
app.patch('/api/orders/:orderId/cancel', verifyToken, (req, res) => {
    const userId = req.userId;
    const { orderId } = req.params;

    try {
        const checkStmt = db.prepare("SELECT status FROM orders WHERE id = ? AND user_id = ?");
        const order = checkStmt.get(orderId, userId);

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }
        if (order.status !== 'pending') {
            return res.status(400).json({ error: 'Only pending orders can be cancelled' });
        }

        const stmt = db.prepare(
            "UPDATE orders SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP WHERE id = ?"
        );
        stmt.run(orderId);

        res.json({ message: 'Order cancelled' });
    } catch (err) {
        res.status(500).json({ error: 'Cancel failed' });
    }
});

const server = app.listen(PORT, () => {
    console.log(`Order Service running on port ${PORT}`);
});

bindServerErrorHandlers(server, 'Order Service', PORT);

module.exports = app;

