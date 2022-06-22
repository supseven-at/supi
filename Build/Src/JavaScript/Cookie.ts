export const cookie = new (class {
    private values: Map<string, any> = new Map();

    private lifetime: number = 7;

    private persistTimeout: any;
    private domain: string;

    constructor() {
        document.cookie.split('; ').forEach((cookie: string) => {
            let [name, value] = cookie.split('=');

            if (name == 'supi') {
                let data = JSON.parse(decodeURIComponent(value));

                for (let key of Object.keys(data)) {
                    this.values.set(key, data[key]);
                }
            }
        });
    }

    public get(name: string): any {
        if (this.values.has(name)) {
            return this.values.get(name);
        }

        return null;
    }

    public has(name: string): boolean {
        return this.values.has(name);
    }

    public set(name: string, value: any): void {
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
            clearTimeout(this.persistTimeout);
        }

        // Use short timeout to avoid many writes at once
        this.persistTimeout = setTimeout(() => {
            this.persistTimeout = null;
            let expires = new Date();
            let values = {};

            this.values.forEach((value, key) => {
                values[key] = value;
            });

            const ttl = this.lifetime * 24 * 60 * 60 * 1000;
            expires.setTime(expires.getTime() + ttl);

            let c = `supi=${encodeURIComponent(JSON.stringify(values))}; expires=${expires.toUTCString()}; path=/`;

            if (this.domain) {
                c += `; Domain=${this.domain}`;
            }

            // @ts-ignore
            if (!window.MSInputMethodContext && !document.documentMode) {
                c += '; SameSite=Lax';

                if (location.protocol == 'https:') {
                    c += '; Secure';
                }
            }

            document.cookie = c;
        }, 20);
    }

    public getCookieNames(): Array<string> {
        return document.cookie
            .split('; ')
            .map((c: string): string => c.split('=').shift())
            .filter((c: string): boolean => c !== 'supi');
    }

    public purgeCookie(name: string): void {
        let expires = new Date();
        const ttl = 3600 * 24 * 1000;
        expires.setTime(expires.getTime() - ttl);
        document.cookie = `${name}=x; expires=${expires.toUTCString()}; path=/; SameSite=Strict`;
    }

    useDomain(domain: string) {
        this.domain = domain;
    }
})();
