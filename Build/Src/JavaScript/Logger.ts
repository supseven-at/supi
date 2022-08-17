export interface Logger {
    info(...data: any): void;
    error(...data: any): void;
}

export class ConsoleLogger implements Logger {
    error(...data: any): void {
        console.error(...data);
    }

    info(...data: any): void {
        console.log(...data);
    }
}

export class NullLogger implements Logger {
    error(..._data: any) {}

    info(..._data: any) {}
}
