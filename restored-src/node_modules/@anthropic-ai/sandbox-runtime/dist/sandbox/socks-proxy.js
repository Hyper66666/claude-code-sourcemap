import { createServer } from '@pondwader/socks5-server';
import { logForDebugging } from '../utils/debug.js';
export function createSocksProxyServer(options) {
    const socksServer = createServer();
    socksServer.setRulesetValidator(async (conn) => {
        try {
            const hostname = conn.destAddress;
            const port = conn.destPort;
            logForDebugging(`Connection request to ${hostname}:${port}`);
            const allowed = await options.filter(port, hostname);
            if (!allowed) {
                logForDebugging(`Connection blocked to ${hostname}:${port}`, {
                    level: 'error',
                });
                return false;
            }
            logForDebugging(`Connection allowed to ${hostname}:${port}`);
            return true;
        }
        catch (error) {
            logForDebugging(`Error validating connection: ${error}`, {
                level: 'error',
            });
            return false;
        }
    });
    return {
        server: socksServer,
        getPort() {
            // Access the internal server to get the port
            // We need to use type assertion here as the server property is private
            try {
                const serverInternal = socksServer?.server;
                if (serverInternal && typeof serverInternal?.address === 'function') {
                    const address = serverInternal.address();
                    if (address && typeof address === 'object' && 'port' in address) {
                        return address.port;
                    }
                }
            }
            catch (error) {
                // Server might not be listening yet or property access failed
                logForDebugging(`Error getting port: ${error}`, { level: 'error' });
            }
            return undefined;
        },
        listen(port, hostname) {
            return new Promise((resolve, reject) => {
                const listeningCallback = () => {
                    const actualPort = this.getPort();
                    if (actualPort) {
                        logForDebugging(`SOCKS proxy listening on ${hostname}:${actualPort}`);
                        resolve(actualPort);
                    }
                    else {
                        reject(new Error('Failed to get SOCKS proxy server port'));
                    }
                };
                socksServer.listen(port, hostname, listeningCallback);
            });
        },
        async close() {
            return new Promise((resolve, reject) => {
                socksServer.close(error => {
                    if (error) {
                        // Only reject for actual errors, not for "already closed" states
                        // Check for common "already closed" error patterns
                        const errorMessage = error.message?.toLowerCase() || '';
                        const isAlreadyClosed = errorMessage.includes('not running') ||
                            errorMessage.includes('already closed') ||
                            errorMessage.includes('not listening');
                        if (!isAlreadyClosed) {
                            reject(error);
                            return;
                        }
                    }
                    resolve();
                });
            });
        },
        unref() {
            // Access the internal server to call unref
            try {
                const serverInternal = socksServer?.server;
                if (serverInternal && typeof serverInternal?.unref === 'function') {
                    serverInternal.unref();
                }
            }
            catch (error) {
                logForDebugging(`Error calling unref: ${error}`, { level: 'error' });
            }
        },
    };
}
//# sourceMappingURL=socks-proxy.js.map