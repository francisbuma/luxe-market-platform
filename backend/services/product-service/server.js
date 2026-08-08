const express = require('express');
const cors = require('cors');
const { db } = require('../../shared/database');
const { registerProcessErrorHandlers, bindServerErrorHandlers } = require('../../shared/error-handler');

registerProcessErrorHandlers('Product Service');

const app = express();
const PORT = process.env.PRODUCT_PORT || 3002;

app.use(cors());
app.use(express.json());

function toProductResponse(product) {
    return {
        id: product.id,
        name: product.name,
        category: product.category,
        price: product.price,
        originalPrice: product.original_price,
        badge: product.badge,
        icon: product.icon,
        description: product.description,
        imageUrl: product.image_url,
        stock: product.stock
    };
}

// Get all products with optional filtering
app.get('/api/products', (req, res) => {
    const { category, search, minPrice, maxPrice, badge } = req.query;
    let query = "SELECT * FROM products WHERE 1=1";
    const params = [];

    if (category && category !== 'all') {
        query += " AND LOWER(category) = LOWER(?)";
        params.push(category);
    }
    if (search) {
        query += " AND (LOWER(name) LIKE LOWER(?) OR LOWER(description) LIKE LOWER(?))";
        params.push(`%${search}%`, `%${search}%`);
    }
    if (minPrice) {
        query += " AND price >= ?";
        params.push(parseFloat(minPrice));
    }
    if (maxPrice) {
        query += " AND price <= ?";
        params.push(parseFloat(maxPrice));
    }
    if (badge) {
        query += " AND LOWER(badge) = LOWER(?)";
        params.push(badge);
    }

    query += " ORDER BY created_at DESC";

    try {
        const stmt = db.prepare(query);
        const products = stmt.all(...params);

        res.json(products.map(toProductResponse));
    } catch (err) {
        console.error('Products error:', err);
        res.status(500).json({ error: 'Database error' });
    }
});

// Get single product
app.get('/api/products/:id', (req, res) => {
    try {
        const stmt = db.prepare("SELECT * FROM products WHERE id = ?");
        const product = stmt.get(req.params.id);

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json(toProductResponse(product));
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
});

// Get categories
app.get('/api/products/categories/all', (req, res) => {
    try {
        const stmt = db.prepare("SELECT DISTINCT category FROM products ORDER BY category");
        const rows = stmt.all();
        res.json(rows.map(r => r.category));
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
});

// Admin: Add product
app.post('/api/products', (req, res) => {
    const { name, category, price, originalPrice, badge, icon, description, imageUrl, stock } = req.body;

    try {
        const stmt = db.prepare(
            "INSERT INTO products (name, category, price, original_price, badge, icon, description, image_url, stock) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
        );
        const result = stmt.run(name, category, price, originalPrice, badge, icon, description, imageUrl, stock || 100);

        res.status(201).json({ id: result.lastInsertRowid, message: 'Product added' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to add product' });
    }
});

// Admin: Update stock
app.patch('/api/products/:id/stock', (req, res) => {
    const { stock } = req.body;
    try {
        const stmt = db.prepare("UPDATE products SET stock = ? WHERE id = ?");
        stmt.run(stock, req.params.id);
        res.json({ message: 'Stock updated' });
    } catch (err) {
        res.status(500).json({ error: 'Update failed' });
    }
});

// Admin: Update product
app.put('/api/products/:id', (req, res) => {
    const { id } = req.params;
    const { name, category, price, originalPrice, badge, icon, description, imageUrl, stock } = req.body;

    try {
        const checkStmt = db.prepare("SELECT id FROM products WHERE id = ?");
        const existing = checkStmt.get(id);
        if (!existing) {
            return res.status(404).json({ error: 'Product not found' });
        }

        const stmt = db.prepare(
            "UPDATE products SET name = ?, category = ?, price = ?, original_price = ?, badge = ?, icon = ?, description = ?, image_url = ?, stock = ? WHERE id = ?"
        );
        stmt.run(name, category, price, originalPrice, badge, icon, description, imageUrl, stock || 100, id);

        res.json({ message: 'Product updated', id });
    } catch (err) {
        res.status(500).json({ error: 'Update failed' });
    }
});

// Admin: Delete product
app.delete('/api/products/:id', (req, res) => {
    const { id } = req.params;
    try {
        const stmt = db.prepare("DELETE FROM products WHERE id = ?");
        const result = stmt.run(id);
        if (result.changes === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json({ message: 'Product deleted', id });
    } catch (err) {
        res.status(500).json({ error: 'Delete failed' });
    }
});

const server = app.listen(PORT, () => {
    console.log(`Product Service running on port ${PORT}`);
});

bindServerErrorHandlers(server, 'Product Service', PORT);

module.exports = app;

