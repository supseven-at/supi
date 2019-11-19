/**
 * Supseven User Privacy Interface Class
 * for GDPR Issues
 */
class Supi {
    // the allow button
    allow: any;

    // the dismiss button
    dismiss: any;

    // the choose button provied by the plugin
    choose: any;

    // the main cookie banner
    banner: any;

    // the cookie name which will be set as a status cookie
    cookieName: any = 'supi-status';

    // the typoscript config
    config: any;

    /**
     * the constructor
     */
    constructor() {
        this.allow = <HTMLAnchorElement>document.getElementById('supi:allow');
        this.dismiss = <HTMLAnchorElement>document.getElementById('supi:dismiss');
        this.choose = <HTMLAnchorElement>document.getElementById('supi:choose');
        this.banner = <HTMLDivElement>document.getElementById('supi:banner');
        this.config = JSON.parse(document.getElementById('supi:script').getAttribute('data-supi-config'));

        // check, if status cookie is set and check the status it self and react on that
        if (parseInt(this.getCookie(this.cookieName)) === 1) {
            this.injectJavaScripts();
        } else if (parseInt(this.getCookie(this.cookieName)) === 0) {
            // do nothing at this point
        } else {
            this.toggleBanner();
        }

        // add all click handlers to the buttons
        this.addClickHandler();
    }

    /**
     * adds the clickhandler to the buttons
     */
    addClickHandler(): void {
        let that = this;

        // on click removes first all scripts and readds then
        // the scripts, after that the banner will be toggled
        this.allow.addEventListener('click', function(e: any){
            e.preventDefault();

            that.removeScripts();

            if (that.injectJavaScripts() === true) {
                that.toggleBanner();
                that.setCookie(that.cookieName, '1');
            }
        });

        // on click removes all javascripts and toggles the
        // banner
        this.dismiss.addEventListener('click', function(e: any){
            e.preventDefault();
            if (that.removeScripts() === true) {
                that.toggleBanner();
                that.setCookie(that.cookieName, '0');
            }
        });

        // this click event simply opens the banner for
        // further interaction
        if (this.choose) {
            this.choose.addEventListener('click', (e: any) => {
                e.preventDefault();
                this.toggleBanner();
            });
        }
    }

    /**
     * injects the javascripts
     * always use <script type="application/supi"></script>
     * to load the correct scripts
     */
    injectJavaScripts(): boolean {
        let elements: Array<HTMLScriptElement> = [].slice.call(document.getElementsByTagName('script'), 0);

        elements.forEach(script => {
            let element = <HTMLScriptElement>document.createElement('script');
            element.type = 'text/javascript';
            element.className = 'supi-scripts';
            element.innerHTML = script.innerHTML;

            script.parentNode.replaceChild(element, script);
        });

        return true;
    }

    /**
     * simply toggles the banner class
     */
    toggleBanner(): void {
        this.banner.classList.toggle('hidden');
    }

    /**
     * removes all script tags added by supi
     * and removes all cookies we have access to and which are not
     * whitelisted by the config
     */
    removeScripts(): boolean {
        let elements: Array<HTMLScriptElement> = [].slice.call(document.getElementsByClassName('supi-scripts'), 0);

        elements.forEach(el => {
            el.parentNode.removeChild(el);
        });

        this.deleteAllCookies();

        return true;
    }

    /**
     * a set cookie method
     *
     * @param name
     * @param val
     */
    setCookie(name: string, val: string): void {
        const date = new Date();
        const value = val;

        date.setTime(date.getTime() + (7 * 24 * 60 * 60 * 1000));

        document.cookie = name+"="+value+"; expires="+date.toUTCString()+"; path=/";
    }

    /**
     * a get cookie method
     *
     * @param name
     */
    getCookie(name: string): any {
        const value = "; " + document.cookie;
        const parts = value.split("; " + name + "=");

        if (parts.length == 2) {
            return parts.pop().split(";").shift();
        }
    }

    /**
     * a delete cookie method
     *
     * @param name
     */
    deleteCookie(name: string) {
        const date = new Date();
        date.setTime(date.getTime() + (-1 * 24 * 60 * 60 * 1000));
        document.cookie = name+"=; expires="+date.toUTCString()+"; path=/";
    }

    /**
     * deletes all but the whitelisted cookies
     */
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

// instanciate the class on load.
window.onload = () => {
    let supi = new Supi();
};
