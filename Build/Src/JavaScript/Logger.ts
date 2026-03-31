/**
 * Generic logger interface for Supi.
 * Supports different implementations like ConsoleLogger or NullLogger.
 */
export interface Logger {
    /**
     * Logs informational messages.
     * @param data Arbitrary data or format strings.
     */
    info(...data: unknown[]): void;

    /**
     * Logs error messages.
     * @param data Arbitrary data or error objects.
     */
    error(...data: unknown[]): void;
}

/**
 * Active logger that outputs to the browser's developer console.
 * Typically used in 'develop' or 'debug' mode.
 */
export class ConsoleLogger implements Logger {
    error(...data: unknown[]): void {
        console.error(...data);
    }

    info(...data: unknown[]): void {
        console.log(...data);
    }
}

/**
 * Silent logger that ignores all log calls.
 * Used in production to minimize console noise.
 */
export class NullLogger implements Logger {
    error(..._data: unknown[]): void {}

    info(..._data: unknown[]): void {}
}
