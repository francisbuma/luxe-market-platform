const { spawn } = require('child_process');
const net = require('node:net');
const path = require('path');
const { initDatabase, seedProducts, seedDemoData } = require('./backend/shared/database');
const { registerProcessErrorHandlers } = require('./backend/shared/error-handler');

registerProcessErrorHandlers('LuxeMarket Starter', { exitOnUnhandled: false });

async function tryBind(port, host) {
    return new Promise(resolve => {
        const server = net.createServer();
        server.once('error', () => {
            server.close?.();
            resolve(false);
        });
        server.once('listening', () => {
            server.close(() => resolve(true));
        });
        server.listen(port, host);
    });
}

async function isPortFree(port) {
    const ipv4Free = await tryBind(port, '127.0.0.1');
    if (!ipv4Free) {
        return false;
    }

    try {
        const ipv6Free = await tryBind(port, '::1');
        return ipv6Free;
    } catch {
        return true;
    }
}

async function isPortOccupied(port) {
    return new Promise(resolve => {
        const socket = new net.Socket();
        let resolved = false;
        socket.setTimeout(300);
        socket.once('connect', () => {
            resolved = true;
            socket.end();
            resolve(true);
        });
        socket.once('timeout', () => {
            if (!resolved) { resolved = true; socket.destroy(); resolve(false); }
        });
        socket.once('error', () => {
            if (!resolved) { resolved = true; socket.destroy(); resolve(false); }
        });
        socket.connect(port, '127.0.0.1');
    });
}

async function getAvailablePort(requestedPort, usedPorts = new Set(), maxAttempts = 100) {
    let port = requestedPort;
    for (let i = 0; i < maxAttempts; i += 1, port += 1) {
        if (usedPorts.has(port)) {
            continue;
        }
        if (await isPortFree(port)) {
            return port;
        }
    }
    throw new Error(`No available ports found starting at ${requestedPort}`);
}

console.log('\n🏪 Starting LuxeMarket E-Commerce Platform...\n');

async function startServices() {
    await initDatabase();
    await seedProducts();
    await seedDemoData();

    console.log('✅ Database initialized\n');

    const services = [
        { name: 'Auth Service', path: './backend/services/auth-service/server.js', port: 3101, envVar: 'AUTH_PORT', color: '\x1b[36m' },
        { name: 'Product Service', path: './backend/services/product-service/server.js', port: 3102, envVar: 'PRODUCT_PORT', color: '\x1b[32m' },
        { name: 'Cart Service', path: './backend/services/cart-service/server.js', port: 3103, envVar: 'CART_PORT', color: '\x1b[33m' },
        { name: 'Order Service', path: './backend/services/order-service/server.js', port: 3104, envVar: 'ORDER_PORT', color: '\x1b[35m' },
        { name: 'Customer Service', path: './backend/services/customer-service/server.js', port: 3105, envVar: 'CUSTOMER_PORT', color: '\x1b[34m' },
        { name: 'API Gateway', path: './backend/gateway/server.js', port: 8080, envVar: 'GATEWAY_PORT', color: '\x1b[31m' }
    ];

    const processes = [];
    const usedPorts = new Set();

    // Pre-flight: ensure requested default ports are free. If any are occupied, abort and ask the user
    // to stop existing processes. This avoids spawning services that immediately fail with EADDRINUSE.
    const occupied = [];
    for (const service of services) {
        const requestedPort = process.env[service.envVar] ? Number(process.env[service.envVar]) : service.port;
        /* eslint-disable no-await-in-loop */
        const occupiedNow = await isPortOccupied(requestedPort);
        const free = occupiedNow ? false : await isPortFree(requestedPort);
        /* eslint-enable no-await-in-loop */
        if (!free) occupied.push({ name: service.name, port: requestedPort });
    }

    if (occupied.length > 0) {
        console.error('\n❌ Startup aborted — the following ports are already in use:');
        occupied.forEach(o => console.error(`   • ${o.name}: ${o.port}`));
        console.error('\nPlease stop the processes using these ports or set alternative ports via environment variables (for example `AUTH_PORT=3201`) and try again.');
        process.exit(1);
    }

    for (const service of services) {
        const desiredPort = process.env[service.envVar] ? Number(process.env[service.envVar]) : service.port;
        const actualPort = await getAvailablePort(desiredPort, usedPorts);
        usedPorts.add(actualPort);
        if (actualPort !== service.port) {
            console.log(`${service.color}⚠️  Port ${service.port} is already in use. Using available port ${actualPort} for ${service.name}.\x1b[0m`);
        }
        service.port = actualPort;
    }

    services.forEach((service, index) => {
        setTimeout(() => {
            console.log(`${service.color}▶ Starting ${service.name} on port ${service.port}\x1b[0m`);

            const procEnv = { ...process.env, FORCE_COLOR: '1' };
            if (service.envVar) procEnv[service.envVar] = String(service.port);
            if (service.name && service.name.toLowerCase().includes('gateway')) {
                services.forEach(svc => {
                    if (svc.envVar) procEnv[svc.envVar] = String(svc.port);
                });
            }

            const proc = spawn('node', [service.path], {
                stdio: 'inherit',
                cwd: __dirname,
                env: procEnv
            });

            processes.push(proc);

            proc.on('error', err => {
                console.error(`❌ ${service.name} failed:`, err.message);
            });
        }, index * 1000);
    });

    process.on('SIGINT', () => {
        console.log('\n\n🛑 Shutting down LuxeMarket...');
        processes.forEach(proc => proc.kill());
        process.exit(0);
    });

    setTimeout(() => {
        const gw = services.find(s => s.name && s.name.toLowerCase().includes('gateway')) || services[services.length - 1];
        const gwPort = gw && gw.port ? gw.port : 8080;
        console.log('\n✨ All services started!');
        console.log(`🌐 Access the platform at: http://localhost:${gwPort}`);
        console.log('\n📋 Available endpoints:');
        console.log(`   • Frontend:  http://localhost:${gwPort}`);
        console.log(`   • API:       http://localhost:${gwPort}/api`);
        console.log(`   • Health:    http://localhost:${gwPort}/api/health\n`);
    }, services.length * 1000 + 2000);
}

startServices().catch(err => {
    console.error('❌ Failed to start services:', err);
    process.exit(1);
});
