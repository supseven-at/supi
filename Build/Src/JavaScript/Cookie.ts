
export const cookie = new class {

    private values: Map<string, any> = new Map();

    private lifetime: number = 7

    private persistTimeout: any

    constructor() {
        document.cookie.split('; ').forEach((cookie: string) => {
            let [name, value] = cookie.split("=");

            if (name == "supi") {
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

            expires.setTime(expires.getTime() + (this.lifetime * 24 * 60 * 60 * 1000));

            let c = `supi=${encodeURIComponent(JSON.stringify(values))}; expires=${expires.toUTCString()}; path=/;`;

            // @ts-ignore
            if (!window.MSInputMethodContext && !document.documentMode) {
                c += "; SameSite=Strict";

                if (location.protocol == "https:") {
                    c += "; Secure";
                }
            }

            document.cookie = c;
        }, 20);
    }

    public getCookieNames(): Array<string> {
        return document.cookie.split("; ")
            .map((c: string): string => c.split("=").shift())
            .filter((c: string): boolean => c !== "supi");
    }

    public purgeCookie(name: string): void {
        let expires = new Date();
        expires.setTime(expires.getTime() - (3600 * 60 * 1000));

        const domainParts = document.domain.split('.');
        let cookieString = `${name}=x; expires=${expires.toUTCString()}; path=/;`;
        if(domainParts.length > 1) {
            const cookieDomain = '.' + domainParts.slice(-2).join('.');
            cookieString += ` domain=${cookieDomain};`;
        }
        document.cookie = cookieString;
    }
};
