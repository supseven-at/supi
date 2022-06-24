export interface Logger {
    info(...data: any);
    error(...data: any);
}

export class ConsoleLogger implements Logger {
    error(...data: any) {
        console.error(...data);
    }

    info(...data: any) {
        console.log(...data);
    }
}

export class NullLogger implements Logger {
    error(...data: any) {}

    info(...data: any) {}
}
