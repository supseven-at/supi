type CookieData = Record<string, unknown>;

export class CookieHandler {
    private values = new Map<string, unknown>();
    private lifetime = 7;
    private persistTimeout: number | null = null;
    private domain = '';

    constructor() {
        document.cookie.split('; ').forEach((cookieString: string) => {
            const [name, value] = cookieString.split('=');

            if (name === 'supi' && value) {
                try {
                    const data = JSON.parse(decodeURIComponent(value)) as CookieData;
                    for (const [key, val] of Object.entries(data)) {
                        this.values.set(key, val);
                    }
                } catch (e) {
                    console.error('Supi: Failed to parse cookie data', e);
                }
            }
        });
    }

    public get<T = unknown>(name: string): T | null {
        return (this.values.get(name) as T) ?? null;
    }

    public has(name: string): boolean {
        return this.values.has(name);
    }

    public set(name: string, value: unknown): void {
        this.values.set(name, value);
        this.persist();
    }

    public setLifetime(days: number): void {
        if (days > 0 && days < 367) {
            this.lifetime = days;
            this.persist();
        }
    }

    public remove(name: string): void {
        this.values.delete(name);
        this.persist();
    }

    private persist(): void {
        if (this.persistTimeout) {
            window.clearTimeout(this.persistTimeout);
        }

        // Use short timeout to avoid many writes at once
        this.persistTimeout = window.setTimeout(() => {
            this.persistTimeout = null;
            const expires = new Date();
            const values: CookieData = {};

            for (const [key, value] of this.values.entries()) {
                values[key] = value;
            }

            const ttl = this.lifetime * 24 * 60 * 60 * 1000;
            expires.setTime(expires.getTime() + ttl);
            this.setRawCookie('supi', encodeURIComponent(JSON.stringify(values)), expires);
        }, 20);
    }

    public getCookieNames(): string[] {
        return document.cookie
            .split('; ')
            .map((c) => c.split('=')[0])
            .filter((c) => c !== 'supi');
    }

    public purgeCookie(name: string): void {
        const expires = new Date();
        const ttl = 3600 * 24 * 1000;
        expires.setTime(expires.getTime() - ttl);
        this.setRawCookie(name, 'x', expires);
    }

    private setRawCookie(name: string, value: string, expires: Date): void {
        let cookieString = `${name}=${value}; expires=${expires.toUTCString()}; path=/`;

        if (this.domain) {
            cookieString += `; Domain=${this.domain}`;
        }

        // Modern browsers: Secure and SameSite flags
        cookieString += '; SameSite=Lax';
        if (window.location.protocol === 'https:') {
            cookieString += '; Secure';
        }

        document.cookie = cookieString;
    }

    public useDomain(domain: string): void {
        this.domain = domain;
    }
}

export const cookie = new CookieHandler();
