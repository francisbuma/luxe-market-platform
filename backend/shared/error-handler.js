const { inspect } = require('node:util');

function formatError(error) {
    if (error instanceof Error) {
        return error.stack || error.message;
    }

    return inspect(error, { depth: 3, breakLength: 80 });
}

function registerProcessErrorHandlers(serviceName, options = {}) {
    const { exitOnUnhandled = false } = options;

    const handleUncaughtException = (error) => {
        console.error(`[${serviceName}] Uncaught exception:`, formatError(error));
        if (exitOnUnhandled) {
            process.exit(1);
        }
    };

    const handleUnhandledRejection = (reason) => {
        console.error(`[${serviceName}] Unhandled rejection:`, formatError(reason));
        if (exitOnUnhandled) {
            process.exit(1);
        }
    };

    process.on('uncaughtException', handleUncaughtException);
    process.on('unhandledRejection', handleUnhandledRejection);

    return { handleUncaughtException, handleUnhandledRejection };
}

function bindServerErrorHandlers(server, serviceName, port) {
    server.on('error', (error) => {
        if (error && error.code === 'EADDRINUSE') {
            console.error(`[${serviceName}] Port ${port} is already in use. Please stop the existing process or change the configured port.`);
        } else {
            console.error(`[${serviceName}] Server failed to start:`, formatError(error));
        }
        process.exitCode = 1;
    });
}

module.exports = {
    registerProcessErrorHandlers,
    bindServerErrorHandlers
};
