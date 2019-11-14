class Supi {
    allow: any;
    dismiss: any;
    banner: any;
    cookieName: any = 'supi-status';

    constructor() {
        this.allow = document.getElementById('supi:allow');
        this.dismiss = document.getElementById('supi:dismiss');
        this.banner = <HTMLDivElement>document.getElementById('supi:banner');

        this.addClickHandler();

        if (parseInt(this.getCookie(this.cookieName)) === 1) {
            this.injectJavaScripts();
        } else if (parseInt(this.getCookie(this.cookieName)) === 0) {
            // do nothing at this point
        } else {
            this.toggleBanner();
        }
    }

    addClickHandler(): void {
        let that = this;

        this.allow.addEventListener('click', function(e: any){
            e.preventDefault();

            that.removeScripts();

            if (that.injectJavaScripts() === true) {
                that.toggleBanner();
                that.setCookie(that.cookieName, '1');
            }
        });

        this.dismiss.addEventListener('click', function(e: any){
            e.preventDefault();
            if (that.removeScripts() === true) {
                that.toggleBanner();
                that.setCookie(that.cookieName, '0');
            }
        });
    }

    injectJavaScripts(): boolean {
        let elements: any = document.getElementsByTagName('script'),
            scripts = [];

        for(let el of elements) {
            if (el.type === 'application/supi') {
                scripts.push(el);
            }
        }

        let element = <HTMLScriptElement>document.createElement('script');
        element.type = 'text/javascript';
        element.className = 'supi-scripts';

        scripts.forEach(function(script){
            element.innerHTML += script.innerHTML;
        });

        document.head.appendChild(element);

        return true;
    }

    toggleBanner(): void {
        this.banner.classList.toggle('hidden');
    }

    removeScripts(): boolean {
        let elements: any = document.getElementsByClassName('supi-scripts');

        for (let el of elements) {
            document.head.removeChild(el);
        }

        return true;
    }

    setCookie(name: string, val: string): void {
        const date = new Date();
        const value = val;

        date.setTime(date.getTime() + (7 * 24 * 60 * 60 * 1000));

        document.cookie = name+"="+value+"; expires="+date.toUTCString()+"; path=/";
    }

    getCookie(name: string): any {
        const value = "; " + document.cookie;
        const parts = value.split("; " + name + "=");

        if (parts.length == 2) {
            return parts.pop().split(";").shift();
        }
    }
}

window.onload = () => {
    let supi = new Supi();
};