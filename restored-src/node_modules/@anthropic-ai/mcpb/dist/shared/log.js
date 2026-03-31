export function getLogger({ silent = false } = {}) {
    return {
        log: (...args) => {
            if (!silent) {
                console.log(...args);
            }
        },
        error: (...args) => {
            if (!silent) {
                console.error(...args);
            }
        },
        warn: (...args) => {
            if (!silent) {
                console.warn(...args);
            }
        },
        info: (...args) => {
            if (!silent) {
                console.info(...args);
            }
        },
        debug: (...args) => {
            if (!silent) {
                console.debug(...args);
            }
        },
    };
}
