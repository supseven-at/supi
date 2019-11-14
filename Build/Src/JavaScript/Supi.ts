class Supi {
    allow: any;
    dismiss: any;
    choose: any;
    banner: any;
    cookieName: any = 'supi-status';
    config: any;

    constructor() {
        this.allow = document.getElementById('supi:allow');
        this.dismiss = document.getElementById('supi:dismiss');
        this.choose = document.getElementById('supi:choose');
        this.banner = <HTMLDivElement>document.getElementById('supi:banner');
        this.config = JSON.parse(document.getElementById('supi:script').getAttribute('data-supi-config'));

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

        this.choose.addEventListener('click', function(e: any){
            e.preventDefault();
            that.toggleBanner();
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

        this.deleteAllCookies();

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

    deleteCookie(name: string) {
        const date = new Date();
        date.setTime(date.getTime() + (-1 * 24 * 60 * 60 * 1000));
        document.cookie = name+"=; expires="+date.toUTCString()+"; path=/";
    }

    deleteAllCookies() {
        const cookies = document.cookie.split('; ');
        let that = this,
            doNotDelete = this.config['essential']['names'].split(',');

        cookies.forEach(function(cookie){
           let cookieName = cookie.split('=')[0];

           if (doNotDelete.indexOf(cookieName) === -1) {
               that.deleteCookie(cookieName);
           }
        });
    }
}

window.onload = () => {
    let supi = new Supi();
};