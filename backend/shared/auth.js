const jwt = require('jsonwebtoken');
const { db } = require('./database');

const JWT_SECRET = process.env.JWT_SECRET || 'luxe-market-secret-key-2026';
const JWT_EXPIRES_IN = '24h';

function generateToken(userId) {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

function verifyToken(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const token = authHeader.substring(7);

    try {
        const decoded = jwt.verify(token, JWT_SECRET);

        try {
            const stmt = db.prepare("SELECT * FROM sessions WHERE token = ? AND expires_at > datetime('now')");
            const session = stmt.get(token);

            if (!session) {
                // Auto-register session if token was signed with valid JWT secret
                try {
                    const insertStmt = db.prepare("INSERT INTO sessions (user_id, token, expires_at) VALUES (?, ?, datetime('now', '+24 hours'))");
                    insertStmt.run(decoded.userId, token);
                } catch (e) {}
            }

            req.userId = decoded.userId;
            req.token = token;
            next();
        } catch (dbError) {
            console.error('Session lookup error:', dbError);
            req.userId = decoded.userId;
            req.token = token;
            next();
        }
    } catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
    }
}

module.exports = { generateToken, verifyToken, JWT_SECRET };
