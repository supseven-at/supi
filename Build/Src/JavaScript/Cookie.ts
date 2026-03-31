/**
 * Data structure for the main 'supi' cookie.
 * Contains key-value pairs of all stored consent settings.
 */
type CookieData = Record<string, unknown>;

/**
 * Modernized cookie handler for the Supseven User Privacy Interface.
 * Manages the 'supi' status cookie and provides utilities to purge unauthorized cookies.
 */
export class CookieHandler {
    private values = new Map<string, unknown>();
    private lifetime = 7;
    private persistTimeout: number | null = null;
    private domain = '';

    /**
     * Initializes the handler by reading existing cookies.
     * Parses the main 'supi' JSON cookie if present.
     */
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

    /**
     * Retrieves a value from the 'supi' consent cookie.
     * @param name Key of the value.
     * @returns The value or null.
     */
    public get<T = unknown>(name: string): T | null {
        return (this.values.get(name) as T) ?? null;
    }

    /**
     * Checks if a specific key exists in the consent cookie.
     * @param name Key of the value.
     * @returns True if key exists.
     */
    public has(name: string): boolean {
        return this.values.has(name);
    }

    /**
     * Stores a value in the consent cookie and triggers persistence.
     * @param name Key for storage.
     * @param value Value to store.
     */
    public set(name: string, value: unknown): void {
        this.values.set(name, value);
        this.persist();
    }

    /**
     * Sets the cookie expiration in days.
     * @param days TTL between 1 and 366.
     */
    public setLifetime(days: number): void {
        if (days > 0 && days < 367) {
            this.lifetime = days;
            this.persist();
        }
    }

    /**
     * Removes a key from the consent cookie.
     * @param name Key to remove.
     */
    public remove(name: string): void {
        this.values.delete(name);
        this.persist();
    }

    /**
     * Debounced persistence of the memory values back to the 'supi' cookie.
     * Ensures only one write operation happens within a short timeframe.
     */
    private persist(): void {
        if (this.persistTimeout) {
            window.clearTimeout(this.persistTimeout);
        }

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

    /**
     * Returns an array of all cookie names currently present in the browser.
     * Filters out the main 'supi' cookie itself.
     */
    public getCookieNames(): string[] {
        return document.cookie
            .split('; ')
            .map((c) => c.split('=')[0])
            .filter((c) => c !== 'supi');
    }

    /**
     * Deletes a cookie by setting its expiration date in the past.
     * @param name Name of the cookie to delete.
     */
    public purgeCookie(name: string): void {
        const expires = new Date();
        const ttl = 3600 * 24 * 1000;
        expires.setTime(expires.getTime() - ttl);
        this.setRawCookie(name, 'x', expires);
    }

    /**
     * Writes a raw cookie string to the document.
     * Enforces Path=/, SameSite=Lax and Secure (on HTTPS).
     */
    private setRawCookie(name: string, value: string, expires: Date): void {
        let cookieString = `${name}=${value}; expires=${expires.toUTCString()}; path=/`;

        if (this.domain) {
            cookieString += `; Domain=${this.domain}`;
        }

        cookieString += '; SameSite=Lax';
        if (window.location.protocol === 'https:') {
            cookieString += '; Secure';
        }

        document.cookie = cookieString;
    }

    /**
     * Configures the domain used for cookies.
     * @param domain Target domain (e.g. '.example.com').
     */
    public useDomain(domain: string): void {
        this.domain = domain;
    }
}

/**
 * Singleton instance of the cookie handler.
 */
export const cookie = new CookieHandler();
