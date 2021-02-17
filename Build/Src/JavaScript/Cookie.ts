
export const cookie = new class {

    private elements: { [name: string]: string }

    private lifetime: number = 30

    constructor() {
        document.cookie.split('; ').forEach(cookie => {
            let [name, value] = cookie.split("=")

            if (name == "supi") {
                this.elements = JSON.parse(decodeURIComponent(value))
            }
        });
    }

    get(name: string): any {
        if (this.has(name)) {
            return this.elements[name];
        }

        return null;
    }

    public has(name: string): boolean {
        return this.elements.hasOwnProperty(name);
    }

    set(name: string, value: any): void {
        this.elements[name] = value;
        this.persist();
    }

    setLifetime(days: number): void {
        if (days > 1 && days < 367) {
            this.lifetime = days;
            this.persist();
        }
    }

    private persist() {
        let expires: Date = new Date();
        let value: string = JSON.stringify(this.elements);

        expires.setTime(expires.getTime() + (this.lifetime * 24 * 60 * 60 * 1000))

        document.cookie = `supi=${encodeURIComponent(value)}; expires=${expires.toUTCString()}; path=/; SameSite=Strict`;
    }

    remove(name: string): void {
        delete this.elements[name];
        this.persist();
    }
};
