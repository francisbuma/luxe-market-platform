const express = require('express');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const { db } = require('../../shared/database');
const { generateToken } = require('../../shared/auth');
const { registerProcessErrorHandlers, bindServerErrorHandlers } = require('../../shared/error-handler');

registerProcessErrorHandlers('Auth Service');

const app = express();
const PORT = process.env.AUTH_PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Register
app.post('/api/auth/register', async (req, res) => {
    try {
        const { email, password, firstName, lastName, phone, avatar } = req.body;

        if (!email || !password || !firstName || !lastName) {
            return res.status(400).json({ error: 'All required fields must be provided' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }

        // Check if user exists using node:sqlite
        const checkStmt = db.prepare("SELECT id FROM users WHERE email = ?");
        const existingUser = checkStmt.get(email);

        if (existingUser) {
            return res.status(409).json({ error: 'Email already registered' });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const insertStmt = db.prepare(
            "INSERT INTO users (email, password_hash, first_name, last_name, phone, avatar_url) VALUES (?, ?, ?, ?, ?, ?)"
        );
        const result = insertStmt.run(email, passwordHash, firstName, lastName, phone || null, avatar || null);

        const userId = result.lastInsertRowid;
        const token = generateToken(userId);

        // Store session
        const sessionStmt = db.prepare(
            "INSERT INTO sessions (user_id, token, expires_at) VALUES (?, ?, datetime('now', '+24 hours'))"
        );
        sessionStmt.run(userId, token);

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                id: userId,
                email,
                firstName,
                lastName,
                phone: phone || null,
                avatar: avatar || null
            }
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password required' });
        }

        const stmt = db.prepare(
            "SELECT id, email, password_hash, first_name, last_name, phone, avatar_url, created_at FROM users WHERE email = ? AND is_active = 1"
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

        // Store session using native node:sqlite syntax
        const sessionStmt = db.prepare(
            "INSERT INTO sessions (user_id, token, expires_at) VALUES (?, ?, datetime('now', '+24 hours'))"
        );
        sessionStmt.run(user.id, token);

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
    
// Logout

app.post('/api/auth/logout', async (req, res) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        
        // node:sqlite uses db.prepare().run() synchronously or asynchronously depending on driver setup.
        // It uses named or positional parameters. Here, we pass the token directly to run().
        const stmt = db.prepare("DELETE FROM sessions WHERE token = ?");
        stmt.run(token);
    }
    res.json({ message: 'Logged out successfully' });
});

// Verify token
app.get('/api/auth/verify', async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);

    try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'luxe-market-secret-key-2026');

        // node:sqlite DatabaseSync uses synchronous prepare().get()
        const sessionStmt = db.prepare(
            "SELECT * FROM sessions WHERE token = ? AND expires_at > datetime('now')"
        );
        const session = sessionStmt.get(token);

        if (!session) {
            return res.status(401).json({ error: 'Invalid session' });
        }
        res.json({ valid: true, userId: decoded.userId });
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
});

// Get user profile
app.get('/api/auth/profile', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);
    const jwt = require('jsonwebtoken');

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'luxe-market-secret-key-2026');

        const stmt = db.prepare(
            "SELECT id, email, first_name, last_name, phone, avatar_url, created_at FROM users WHERE id = ?"
        );
        const user = stmt.get(decoded.userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({
            id: user.id,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
            phone: user.phone,
            avatar: user.avatar_url,
            createdAt: user.created_at
        });
    } catch {
        res.status(401).json({ error: 'Invalid token' });
    }
});

// Update profile
app.put('/api/auth/profile', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);
    const jwt = require('jsonwebtoken');

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'luxe-market-secret-key-2026');
        const { firstName, lastName, phone, avatar } = req.body;

        const stmt = db.prepare(
            "UPDATE users SET first_name = ?, last_name = ?, phone = ?, avatar_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
        );
        stmt.run(firstName, lastName, phone, avatar || null, decoded.userId);

        res.json({ message: 'Profile updated successfully' });
    } catch {
        res.status(401).json({ error: 'Invalid token' });
    }
});

const server = app.listen(PORT, () => {
    console.log(`Auth Service running on port ${PORT}`);
});

bindServerErrorHandlers(server, 'Auth Service', PORT);

module.exports = app;
