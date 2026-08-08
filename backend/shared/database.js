const { DatabaseSync } = require('node:sqlite');   // Keine externen sqlite3 Bindings nötig
const path = require('path');
const fs = require('fs');

const DB_DIR = path.join(__dirname, '../../database');
const DB_PATH = path.join(DB_DIR, 'luxe-market.db');

if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
}

const db = new DatabaseSync(DB_PATH);
// Enable WAL mode for concurrent access across microservices
// Also enable foreign keys for data integrity
db.exec('PRAGMA journal_mode = WAL');
db.exec('PRAGMA foreign_keys = ON');


async function initDatabase() {
    try {
        db.exec('PRAGMA foreign_keys = ON;');

        // 2. Users Table
        db.exec(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            first_name TEXT NOT NULL,
            last_name TEXT NOT NULL,
            phone TEXT,
            avatar_url TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            is_active INTEGER DEFAULT 1
        );`);

        // 3. Addresses Table
        db.exec(`CREATE TABLE IF NOT EXISTS addresses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            label TEXT DEFAULT 'Home',
            street TEXT NOT NULL,
            city TEXT NOT NULL,
            state TEXT,
            zip_code TEXT NOT NULL,
            country TEXT DEFAULT 'DE',
            is_default INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );`);

        // 4. Products Table
        db.exec(`CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            category TEXT NOT NULL,
            price REAL NOT NULL,
            original_price REAL,
            badge TEXT,
            icon TEXT,
            description TEXT,
            image_url TEXT,
            stock INTEGER DEFAULT 100,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );`);

        // 5. Orders Table
        db.exec(`CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            order_number TEXT UNIQUE NOT NULL,
            status TEXT DEFAULT 'pending',
            total_amount REAL NOT NULL DEFAULT 0,
            shipping_address TEXT NOT NULL DEFAULT '{}',
            payment_method TEXT DEFAULT 'card',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );`);

        // 5a. Migrate: add total_amount and shipping_address to orders if missing
        const orderColumns = ['total_amount', 'shipping_address'];
        for (const column of orderColumns) {
            try {
                db.prepare(`SELECT ${column} FROM orders LIMIT 1`).get();
            } catch (e) {
                const definition = column === 'total_amount'
                    ? 'REAL NOT NULL DEFAULT 0'
                    : "TEXT NOT NULL DEFAULT '{}'";
                console.log(`Migrating: adding ${column} column to orders...`);
                db.exec(`ALTER TABLE orders ADD COLUMN ${column} ${definition}`);
            }
        }

        // 5b. Order Items Table
        db.exec(`CREATE TABLE IF NOT EXISTS order_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id INTEGER NOT NULL,
            product_id INTEGER NOT NULL,
            product_name TEXT NOT NULL,
            quantity INTEGER NOT NULL,
            unit_price REAL NOT NULL,
            total_price REAL NOT NULL,
            FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
        );`);

        // 5c. Cart Items Table
        db.exec(`CREATE TABLE IF NOT EXISTS cart_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            product_id INTEGER NOT NULL,
            quantity INTEGER NOT NULL DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            UNIQUE(user_id, product_id)
        );`);

        // 6. Sessions Table (for JWT-based auth-service)
        db.exec(`CREATE TABLE IF NOT EXISTS sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            token TEXT NOT NULL,
            expires_at DATETIME NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );`);

        // 6a. Gateway Sessions Table (for express-session multisession store)
        db.exec(`CREATE TABLE IF NOT EXISTS gateway_sessions (
            sid TEXT PRIMARY KEY,
            expired INTEGER NOT NULL,
            sess TEXT NOT NULL
        );`);

        console.log("Database initialized successfully.");
    } catch (error) {
        console.error("Failed to initialize database:", error);
        throw error;
    }
}

// import { DatabaseSync } from 'node:sqlite';
// const db = new DatabaseSync('your_database.db');

async function seedProducts() {
    const products = [
        { name: "Wireless Headphones Pro", category: "electronics", price: 299.99, original_price: 399.99, badge: "sale", icon: "🎧", description: "Premium noise-cancelling wireless headphones with 30h battery life", image_url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80", stock: 45 },
        { name: "Smart Watch Ultra", category: "electronics", price: 449.99, original_price: null, badge: "new", icon: "⌚", description: "Advanced fitness tracking and health monitoring smartwatch", image_url: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400&q=80", stock: 12 },
        { name: "Premium Leather Jacket", category: "fashion", price: 189.99, original_price: 249.99, badge: "sale", icon: "🧥", description: "Genuine Italian leather jacket with modern slim fit", image_url: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&q=80", stock: 8 },
        { name: "Minimalist Backpack", category: "fashion", price: 79.99, original_price: null, badge: null, icon: "🎒", description: "Water-resistant urban backpack with laptop compartment", image_url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&q=80", stock: 25 },
        { name: "Smart Home Hub", category: "electronics", price: 129.99, original_price: 159.99, badge: "sale", icon: "🏠", description: "Central control for all your smart home devices", image_url: "https://images.unsplash.com/photo-1558002038-1055907df827?w=400&q=80", stock: 30 },
        { name: "Ceramic Coffee Set", category: "home", price: 59.99, original_price: null, badge: "new", icon: "☕", description: "Handcrafted ceramic coffee set for 4 people", image_url: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&q=80", stock: 40 },
        { name: "Ergonomic Office Chair", category: "home", price: 349.99, original_price: 499.99, badge: "sale", icon: "🪑", description: "Fully adjustable ergonomic chair with lumbar support", image_url: "https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?w=400&q=80", stock: 5 },
        { name: "Running Shoes Elite", category: "fashion", price: 159.99, original_price: null, badge: null, icon: "👟", description: "Professional running shoes with carbon fiber plate", image_url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80", stock: 18 },
        { name: "4K Monitor 27\"", category: "electronics", price: 499.99, original_price: 599.99, badge: "sale", icon: "🖥️", description: "Ultra-sharp 4K display with HDR support", image_url: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400&q=80", stock: 15 },
        { name: "Designer Sunglasses", category: "fashion", price: 129.99, original_price: null, badge: "new", icon: "🕶️", description: "UV400 protection with polarized lenses", image_url: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&q=80", stock: 22 },
        { name: "Smart Thermostat", category: "home", price: 199.99, original_price: null, badge: null, icon: "🌡️", description: "AI-powered climate control with app integration", image_url: "https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=400&q=80", stock: 60 },
        { name: "Wireless Charger Pad", category: "electronics", price: 39.99, original_price: 59.99, badge: "sale", icon: "🔋", description: "Fast 15W wireless charging for all Qi devices", image_url: "https://images.unsplash.com/photo-1622434641406-a158123450f9?w=400&q=80", stock: 3 },
        { name: "Mechanical Keyboard RGB", category: "electronics", price: 149.99, original_price: null, badge: "new", icon: "⌨️", description: "Hot-swappable mechanical switches with per-key RGB lighting", image_url: "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=400&q=80", stock: 20 },
        { name: "Denim Jacket Vintage", category: "fashion", price: 89.99, original_price: 119.99, badge: "sale", icon: "🧥", description: "Classic vintage-wash denim jacket with button closure", image_url: "https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=400&q=80", stock: 14 },
        { name: "Slim Fit Chinos", category: "fashion", price: 59.99, original_price: null, badge: null, icon: "👖", description: "Stretch cotton chinos in modern slim fit", image_url: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400&q=80", stock: 35 },
        { name: "Cotton Crewneck T-Shirt", category: "fashion", price: 29.99, original_price: null, badge: null, icon: "👕", description: "Premium 100% organic cotton crewneck tee", image_url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&q=80", stock: 50 },
        { name: "Wireless Earbuds Sport", category: "electronics", price: 89.99, original_price: 129.99, badge: "sale", icon: "🎧", description: "Sweat-resistant sport earbuds with 24h case battery", image_url: "https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=400&q=80", stock: 28 },
        { name: "Smart Ring Fitness", category: "electronics", price: 199.99, original_price: null, badge: "new", icon: "💍", description: "Titanium smart ring tracking sleep, heart rate, and stress", image_url: "https://images.unsplash.com/photo-1616353071588-708dcff912e2?w=400&q=80", stock: 7 },
        { name: "Linen Summer Shirt", category: "fashion", price: 69.99, original_price: null, badge: null, icon: "👔", description: "Breathable 100% linen button-down shirt", image_url: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400&q=80", stock: 19 },
        { name: "Smart Light Bulb Kit", category: "home", price: 49.99, original_price: null, badge: null, icon: "💡", description: "WiFi color smart bulbs with voice control support", image_url: "https://images.unsplash.com/photo-1550985616-10810253b84d?w=400&q=80", stock: 42 }
    ];

    try {
        const countStmt = db.prepare("SELECT COUNT(*) as count FROM products");
        const rows = countStmt.all();

        try {
            db.prepare("SELECT image_url FROM products LIMIT 1").all();
        } catch (e) {
            console.log('Migrating: adding image_url column...');
            db.exec("ALTER TABLE products ADD COLUMN image_url TEXT;");
        }

        const existingProducts = db.prepare("SELECT id, name FROM products").all();
        const existingNames = new Set(existingProducts.map(product => product.name));
        const insertStmt = db.prepare(`
            INSERT INTO products (name, category, price, original_price, badge, icon, description, image_url, stock)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        const updateStmt = db.prepare(`
            UPDATE products
            SET category = ?, price = ?, original_price = ?, badge = ?, icon = ?, description = ?, image_url = ?, stock = ?
            WHERE name = ?
        `);

        for (const product of products) {
            if (existingNames.has(product.name)) {
                updateStmt.run(product.category, product.price, product.original_price, product.badge, product.icon, product.description, product.image_url, product.stock, product.name);
            } else {
                insertStmt.run(product.name, product.category, product.price, product.original_price, product.badge, product.icon, product.description, product.image_url, product.stock);
            }
        }

        const finalCount = db.prepare("SELECT COUNT(*) as count FROM products").get().count;
        console.log(`Products seeded or synchronized successfully (${finalCount} products available)`);
    } catch (err) {
        console.error("Seeding failed:", err);
        throw err;
    }
}

// This function create a fully populated demo account on first boot
async function seedDemoData() {
    try {
        const bcrypt = require('bcryptjs');
        const userStmt = db.prepare("SELECT id FROM users WHERE email = ?");
        const existing = userStmt.get('demo@luxemarket.com');

        let userId;
        if (!existing) {
            const passwordHash = await bcrypt.hash('demo123', 10);
            const insertUser = db.prepare(
                "INSERT INTO users (email, password_hash, first_name, last_name, phone, avatar_url, created_at) VALUES (?, ?, ?, ?, ?, ?, datetime('now', '-30 days'))"
            );
            const result = insertUser.run('demo@luxemarket.com', passwordHash, 'Alex', 'Demo', '+1 555 0199', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&q=80');
            userId = result.lastInsertRowid;
            console.log('Demo user created');
        } else {
            userId = existing.id;
        }

        // Seed demo addresses
        const addrCount = db.prepare("SELECT COUNT(*) as c FROM addresses WHERE user_id = ?").get(userId);
        if (addrCount.c === 0) {
            const insertAddr = db.prepare(
                "INSERT INTO addresses (user_id, label, street, city, state, zip_code, country, is_default) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
            );
            insertAddr.run(userId, 'Home', '123 Commerce Street, Apt 4B', 'New York', 'NY', '10001', 'US', 1);
            insertAddr.run(userId, 'Office', '456 Business Plaza, Floor 12', 'San Francisco', 'CA', '94105', 'US', 0);
            insertAddr.run(userId, 'Parents', 'Musterstraße 7', 'Berlin', 'Berlin', '10115', 'DE', 0);
            console.log('Demo addresses seeded');
        }

        // Seed demo orders
        const orderCount = db.prepare("SELECT COUNT(*) as c FROM orders WHERE user_id = ?").get(userId);
        if (orderCount.c === 0) {
            const insertOrder = db.prepare(
                "INSERT INTO orders (user_id, order_number, status, total_amount, shipping_address, payment_method, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
            );
            const insertItem = db.prepare(
                "INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price, total_price) VALUES (?, ?, ?, ?, ?, ?)"
            );

            const orders = [
                { num: 'LM-ABC123-XYZ', status: 'delivered', total: 539.98, items: [
                    { pid: 1, name: 'Wireless Headphones Pro', qty: 1, price: 299.99 },
                    { pid: 4, name: 'Minimalist Backpack', qty: 1, price: 79.99 },
                    { pid: 12, name: 'Wireless Charger Pad', qty: 2, price: 39.99 }
                ], addr: { label: 'Home', street: '123 Commerce Street, Apt 4B', city: 'New York', zipCode: '10001', country: 'US' }, date: '2025-05-15' },
                { num: 'LM-DEF456-UVW', status: 'shipped', total: 189.99, items: [
                    { pid: 3, name: 'Premium Leather Jacket', qty: 1, price: 189.99 }
                ], addr: { label: 'Office', street: '456 Business Plaza, Floor 12', city: 'San Francisco', zipCode: '94105', country: 'US' }, date: '2025-06-01' },
                { num: 'LM-GHI789-RST', status: 'processing', total: 449.99, items: [
                    { pid: 2, name: 'Smart Watch Ultra', qty: 1, price: 449.99 }
                ], addr: { label: 'Home', street: '123 Commerce Street, Apt 4B', city: 'New York', zipCode: '10001', country: 'US' }, date: '2025-06-10' },
                { num: 'LM-JKL012-MNO', status: 'pending', total: 349.99, items: [
                    { pid: 7, name: 'Ergonomic Office Chair', qty: 1, price: 349.99 }
                ], addr: { label: 'Parents', street: 'Musterstraße 7', city: 'Berlin', zipCode: '10115', country: 'DE' }, date: '2025-06-12' },
                { num: 'LM-MNO345-PQR', status: 'cancelled', total: 129.99, items: [
                    { pid: 10, name: 'Designer Sunglasses', qty: 1, price: 129.99 }
                ], addr: { label: 'Home', street: '123 Commerce Street, Apt 4B', city: 'New York', zipCode: '10001', country: 'US' }, date: '2025-05-20' }
            ];

            for (const o of orders) {
                const orderResult = insertOrder.run(userId, o.num, o.status, o.total, JSON.stringify(o.addr), 'card', o.date + ' 14:30:00', o.date + ' 14:30:00');
                const orderId = orderResult.lastInsertRowid;
                for (const item of o.items) {
                    insertItem.run(orderId, item.pid, item.name, item.qty, item.price, item.price * item.qty);
                }
            }
            console.log('Demo orders seeded');
        }

        // Seed demo cart items
        const cartCount = db.prepare("SELECT COUNT(*) as c FROM cart_items WHERE user_id = ?").get(userId);
        if (cartCount.c === 0) {
            const insertCart = db.prepare(
                "INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)"
            );
            insertCart.run(userId, 18, 1); // Wireless Earbuds Sport
            insertCart.run(userId, 20, 2); // Linen Summer Shirt
            console.log('Demo cart items seeded');
        }
    } catch (err) {
        console.error('Demo data seeding failed:', err);
    }
}

module.exports = { db, initDatabase, seedProducts, seedDemoData };
