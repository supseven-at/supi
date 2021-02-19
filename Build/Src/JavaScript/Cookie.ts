
export const cookie = new class {

    private values: Map<string, any> = new Map();

    private lifetime: number = 7

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
        let expires = new Date();
        let secureFlag = (location.protocol == "https:" ? "; Secure" : "");
        let values = {};

        for (let [key, value] of this.values) {
            values[key] = value;
        }

        expires.setTime(expires.getTime() + (this.lifetime * 24 * 60 * 60 * 1000));

        document.cookie = `supi=${encodeURIComponent(JSON.stringify(values))}; expires=${expires.toUTCString()}; path=/; SameSite=Strict${secureFlag}`;
    }
};
