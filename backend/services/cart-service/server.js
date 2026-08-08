const express = require('express');
const cors = require('cors');
const { db } = require('../../shared/database');
const { verifyToken } = require('../../shared/auth');
const { registerProcessErrorHandlers, bindServerErrorHandlers } = require('../../shared/error-handler');

registerProcessErrorHandlers('Cart Service');

const app = express();
const PORT = process.env.CART_PORT || 3003;

app.use(cors());
app.use(express.json());

// Get cart items
app.get('/api/cart', verifyToken, (req, res) => {
    const userId = req.userId;
    try {
        const stmt = db.prepare(`
            SELECT c.id, c.product_id, c.quantity, p.name, p.price, p.original_price, p.icon, p.image_url, p.category, p.stock
            FROM cart_items c
            JOIN products p ON c.product_id = p.id
            WHERE c.user_id = ?
        `);
        const items = stmt.all(userId);

        const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

        res.json({
            items: items.map(item => ({
                id: item.id,
                productId: item.product_id,
                name: item.name,
                price: item.price,
                originalPrice: item.original_price,
                icon: item.icon,
                imageUrl: item.image_url,
                category: item.category,
                quantity: item.quantity,
                stock: item.stock,
                totalPrice: item.price * item.quantity
            })),
            total,
            itemCount
        });
    } catch (err) {
        console.error('Cart error:', err);
        res.status(500).json({ error: 'Database error' });
    }
});

// Add item to cart
app.post('/api/cart/items', verifyToken, (req, res) => {
    const userId = req.userId;
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
        return res.status(400).json({ error: 'Product ID required' });
    }

    try {
        // Check product exists and has stock
        const productStmt = db.prepare("SELECT stock FROM products WHERE id = ?");
        const product = productStmt.get(productId);

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        const existingStmt = db.prepare("SELECT quantity FROM cart_items WHERE user_id = ? AND product_id = ?");
        const existing = existingStmt.get(userId, productId);

        const newQuantity = existing ? existing.quantity + quantity : quantity;

        if (newQuantity > product.stock) {
            return res.status(400).json({ error: 'Not enough stock available' });
        }

        if (existing) {
            const updateStmt = db.prepare(
                "UPDATE cart_items SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ? AND product_id = ?"
            );
            updateStmt.run(newQuantity, userId, productId);
            res.json({ message: 'Cart updated', quantity: newQuantity });
        } else {
            const insertStmt = db.prepare(
                "INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)"
            );
            insertStmt.run(userId, productId, quantity);
            res.status(201).json({ message: 'Item added to cart', quantity });
        }
    } catch (err) {
        console.error('Add to cart error:', err);
        res.status(500).json({ error: 'Database error' });
    }
});

// Update quantity
app.put('/api/cart/items/:productId', verifyToken, (req, res) => {
    const userId = req.userId;
    const { productId } = req.params;
    const { quantity } = req.body;

    if (quantity < 1) {
        return res.status(400).json({ error: 'Quantity must be at least 1' });
    }

    try {
        const productStmt = db.prepare("SELECT stock FROM products WHERE id = ?");
        const product = productStmt.get(productId);

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        if (quantity > product.stock) {
            return res.status(400).json({ error: 'Not enough stock' });
        }

        const stmt = db.prepare(
            "UPDATE cart_items SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ? AND product_id = ?"
        );
        stmt.run(quantity, userId, productId);
        res.json({ message: 'Quantity updated' });
    } catch (err) {
        res.status(500).json({ error: 'Update failed' });
    }
});

// Remove item from cart
app.delete('/api/cart/items/:productId', verifyToken, (req, res) => {
    const userId = req.userId;
    const { productId } = req.params;

    try {
        const stmt = db.prepare("DELETE FROM cart_items WHERE user_id = ? AND product_id = ?");
        stmt.run(userId, productId);
        res.json({ message: 'Item removed from cart' });
    } catch (err) {
        res.status(500).json({ error: 'Delete failed' });
    }
});

// Clear cart
app.delete('/api/cart', verifyToken, (req, res) => {
    const userId = req.userId;
    try {
        const stmt = db.prepare("DELETE FROM cart_items WHERE user_id = ?");
        stmt.run(userId);
        res.json({ message: 'Cart cleared' });
    } catch (err) {
        res.status(500).json({ error: 'Clear failed' });
    }
});

// Sync guest cart (after login)
app.post('/api/cart/sync', verifyToken, (req, res) => {
    const userId = req.userId;
    const { items } = req.body;

    if (!items || !Array.isArray(items)) {
        return res.status(400).json({ error: 'Items array required' });
    }

    try {
        items.forEach(item => {
            const existingStmt = db.prepare("SELECT quantity FROM cart_items WHERE user_id = ? AND product_id = ?");
            const existing = existingStmt.get(userId, item.productId);

            if (existing) {
                const updateStmt = db.prepare(
                    "UPDATE cart_items SET quantity = quantity + ? WHERE user_id = ? AND product_id = ?"
                );
                updateStmt.run(item.quantity, userId, item.productId);
            } else {
                const insertStmt = db.prepare(
                    "INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)"
                );
                insertStmt.run(userId, item.productId, item.quantity);
            }
        });
        res.json({ message: 'Cart synced successfully' });
    } catch (err) {
        console.error('Sync error:', err);
        res.status(500).json({ error: 'Sync failed' });
    }
});

const server = app.listen(PORT, () => {
    console.log(`Cart Service running on port ${PORT}`);
});

bindServerErrorHandlers(server, 'Cart Service', PORT);

module.exports = app;

