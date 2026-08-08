const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const path = require('path');
const { db } = require('../shared/database');
const { generateToken } = require('../shared/auth');
const { registerProcessErrorHandlers, bindServerErrorHandlers } = require('../shared/error-handler');

registerProcessErrorHandlers('API Gateway');

const app = express();
const PORT = process.env.GATEWAY_PORT || 8080;

// Custom SQLite Session Store (based on app.js pattern)
const MongoStoreLike = session.Store;

class CustomSQLiteStore extends MongoStoreLike {
    constructor() {
        super();
    }

    get(sid, callback) {
        try {
            const stmt = db.prepare('SELECT sess FROM gateway_sessions WHERE sid = ? AND expired > ?');
            const row = stmt.get(sid, Date.now());
            if (!row) return callback(null, null);
            callback(null, JSON.parse(row.sess));
        } catch (err) { callback(err); }
    }

    set(sid, sess, callback) {
        try {
            const expired = Date.now() + (sess.cookie.maxAge || 86400000);
            const stmt = db.prepare(`
                INSERT INTO gateway_sessions (sid, expired, sess) VALUES (?, ?, ?)
                ON CONFLICT(sid) DO UPDATE SET expired=excluded.expired, sess=excluded.sess
            `);
            stmt.run(sid, expired, JSON.stringify(sess));
            callback(null);
        } catch (err) { callback(err); }
    }

    destroy(sid, callback) {
        try {
            const stmt = db.prepare('DELETE FROM gateway_sessions WHERE sid = ?');
            stmt.run(sid);
            callback(null);
        } catch (err) { callback(err); }
    }
}

app.use(cors({
    origin: function (origin, callback) {
        const allowedOrigins = ['http://localhost:8080', 'http://127.0.0.1:8080', 'http://localhost:3000', 'http://127.0.0.1:3000', 'null'];
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(null, false);
        }
    },
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Express-Session with Custom SQLite Store for Multisession support
app.use(session({
    store: new CustomSQLiteStore(),
    secret: process.env.SESSION_SECRET || 'luxe-market-session-secret-2026',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: 'auto',
        sameSite: 'auto',
        maxAge: 1000 * 60 * 60 * 24,
        httpOnly: true
    },
    name: 'sid'
}));

// Service URLs
const SERVICES = {
    auth: process.env.AUTH_SERVICE_URL || `http://localhost:${process.env.AUTH_PORT || 3001}`,
    products: process.env.PRODUCT_SERVICE_URL || `http://localhost:${process.env.PRODUCT_PORT || 3002}`,
    cart: process.env.CART_SERVICE_URL || `http://localhost:${process.env.CART_PORT || 3003}`,
    orders: process.env.ORDER_SERVICE_URL || `http://localhost:${process.env.ORDER_PORT || 3004}`,
    customer: process.env.CUSTOMER_SERVICE_URL || `http://localhost:${process.env.CUSTOMER_PORT || 3005}`
};

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        gateway: 'running',
        session: req.session.user ? 'active' : 'none',
        services: SERVICES,
        timestamp: new Date().toISOString()
    });
});

// Session-based Authentication (multisession pattern from app.js)
app.post('/api/session/register', async (req, res) => {
    const { email, password, firstName, lastName, phone } = req.body;

    if (!email || !password || !firstName || !lastName) {
        return res.status(400).json({ error: 'All required fields must be provided' });
    }
    if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    try {
        const checkStmt = db.prepare('SELECT id FROM users WHERE email = ?');
        const existingUser = checkStmt.get(email);
        if (existingUser) {
            return res.status(409).json({ error: 'Email already registered' });
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const insertStmt = db.prepare(
            'INSERT INTO users (email, password_hash, first_name, last_name, phone) VALUES (?, ?, ?, ?, ?)'
        );
        const result = insertStmt.run(email, passwordHash, firstName, lastName, phone || null);
        const userId = result.lastInsertRowid;

        const token = generateToken(userId);
        try {
            const sessionStmt = db.prepare(
                "INSERT INTO sessions (user_id, token, expires_at) VALUES (?, ?, datetime('now', '+24 hours'))"
            );
            sessionStmt.run(userId, token);
        } catch (e) {}

        // Auto-login after registration → dashboard
        req.session.user = {
            id: userId,
            email,
            firstName,
            lastName
        };
        req.session.token = token;

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: { id: userId, email, firstName, lastName, phone: phone || null }
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/session/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password required' });
    }

    try {
        const stmt = db.prepare(
            'SELECT id, email, password_hash, first_name, last_name, phone, avatar_url, created_at FROM users WHERE email = ? AND is_active = 1'
        );
        const user = stmt.get(email);

        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const token = generateToken(user.id);
        try {
            const sessionStmt = db.prepare(
                "INSERT INTO sessions (user_id, token, expires_at) VALUES (?, ?, datetime('now', '+24 hours'))"
            );
            sessionStmt.run(user.id, token);
        } catch (e) {}

        // Multisession: every login creates a new session in the store
        req.session.user = {
            id: user.id,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name
        };
        req.session.token = token;

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.first_name,
                lastName: user.last_name,
                phone: user.phone,
                avatar: user.avatar_url,
                createdAt: user.created_at
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

app.get('/api/session/me', (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: 'Not logged in' });
    }
    try {
        const stmt = db.prepare(
            'SELECT id, email, first_name, last_name, phone, avatar_url, created_at FROM users WHERE id = ?'
        );
        const user = stmt.get(req.session.user.id);
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json({
            id: user.id,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
            phone: user.phone,
            avatar: user.avatar_url,
            createdAt: user.created_at
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/session/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) return res.status(500).json({ error: 'Logout failed' });
        res.json({ message: 'Logged out successfully' });
    });
});

function handleProxyAuth(proxyReq, req) {
    if (!req.headers.authorization && (req.session?.token || req.session?.user?.id)) {
        let token = req.session.token;
        if (!token && req.session.user?.id) {
            token = generateToken(req.session.user.id);
            req.session.token = token;
            try {
                const sessionStmt = db.prepare(
                    "INSERT INTO sessions (user_id, token, expires_at) VALUES (?, ?, datetime('now', '+24 hours'))"
                );
                sessionStmt.run(req.session.user.id, token);
            } catch (e) {}
        }
        if (token) {
            proxyReq.setHeader('Authorization', `Bearer ${token}`);
        }
    }
}

async function proxyRequest(req, res, targetBase) {
    try {
        const targetUrl = new URL(req.originalUrl, targetBase);
        const headers = {};
        Object.entries(req.headers).forEach(([key, value]) => {
            if (!value || ['host', 'connection'].includes(key.toLowerCase())) return;
            headers[key] = Array.isArray(value) ? value[0] : value;
        });

        const options = {
            method: req.method,
            headers,
            redirect: 'manual'
        };

        if (req.method !== 'GET' && req.method !== 'HEAD' && req.body !== undefined) {
            options.body = JSON.stringify(req.body);
            if (!headers['content-type']) {
                headers['content-type'] = 'application/json';
            }
        }

        const response = await fetch(targetUrl, options);
        const payload = await response.text();

        res.status(response.status);
        response.headers.forEach((value, key) => {
            if (!['content-length', 'transfer-encoding', 'connection'].includes(key.toLowerCase())) {
                res.setHeader(key, value);
            }
        });
        res.send(payload);
    } catch (error) {
        console.error('[Gateway] Product proxy error:', error.message);
        res.status(502).json({ error: 'Products service unavailable', message: error.message });
    }
}

// Proxy routes (JWT-based microservices remain available)
app.use('/api/auth', createProxyMiddleware({
    target: SERVICES.auth,
    changeOrigin: true
}));

app.use('/api/products', async (req, res, next) => {
    await proxyRequest(req, res, SERVICES.products);
});

app.use('/api/cart', createProxyMiddleware({
    target: SERVICES.cart,
    changeOrigin: true,
    onProxyReq: handleProxyAuth
}));

app.use('/api/orders', createProxyMiddleware({
    target: SERVICES.orders,
    changeOrigin: true,
    onProxyReq: handleProxyAuth
}));

app.use('/api/customer', createProxyMiddleware({
    target: SERVICES.customer,
    changeOrigin: true,
    timeout: 30000,
    proxyTimeout: 30000,
    onProxyReq: handleProxyAuth,
    onError: (err, req, res) => {
        console.error(`[Gateway] Customer proxy error: ${err.message}`);
        res.status(504).json({ error: 'Gateway timeout', message: 'Customer service unavailable' });
    }
}));

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../../frontend')));

// Redirect direct service-port-like paths to the storefront
app.get('/3102', (req, res) => {
    res.redirect(302, '/pages/products.html');
});
app.get('/3102/*', (req, res) => {
    res.redirect(302, '/pages/products.html');
});

// SPA fallback
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/index.html'));
});

const server = app.listen(PORT, () => {
    console.log(`\n╔════════════════════════════════════════════════╗`);
    console.log(`║     LuxeMarket API Gateway                     ║`);
    console.log(`║     Running on http://localhost:${PORT}            ║`);
    console.log(`╠════════════════════════════════════════════════╣`);
    console.log(`║  Session-based auth (multisession):            ║`);
    console.log(`║    POST /api/session/login                     ║`);
    console.log(`║    POST /api/session/register                  ║`);
    console.log(`║    GET  /api/session/me                        ║`);
    console.log(`║    POST /api/session/logout                    ║`);
    console.log(`╠════════════════════════════════════════════════╣`);
    console.log(`║  Services:                                     ║`);
    console.log(`║    • Auth:      ${SERVICES.auth.padEnd(35)}║`);
    console.log(`║    • Products:  ${SERVICES.products.padEnd(35)}║`);
    console.log(`║    • Cart:      ${SERVICES.cart.padEnd(35)}║`);
    console.log(`║    • Orders:    ${SERVICES.orders.padEnd(35)}║`);
    console.log(`║    • Customer:  ${SERVICES.customer.padEnd(35)}║`);
    console.log(`╚════════════════════════════════════════════════╝\n`);
});

bindServerErrorHandlers(server, 'API Gateway', PORT);

module.exports = app;
