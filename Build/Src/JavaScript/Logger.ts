export interface Logger {
    info(...data: unknown[]): void;
    error(...data: unknown[]): void;
}

export class ConsoleLogger implements Logger {
    error(...data: unknown[]): void {
        console.error(...data);
    }

    info(...data: unknown[]): void {
        console.log(...data);
    }
}

export class NullLogger implements Logger {
    error(..._data: unknown[]): void {}

    info(..._data: unknown[]): void {}
}
