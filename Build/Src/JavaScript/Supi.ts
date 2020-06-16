
type SupiElement = HTMLElement & Node | null;

enum Mode {
    All,
    Essential,
    Selected
}

enum Status {
    Selected = 's',
    All = 'a'
}

/**
 * Supseven User Privacy Interface Class
 * for GDPR Issues
 */
class Supi {
    // Main wrapper around everything
    private root: SupiElement;

    // the dismiss button
    private dismiss: SupiElement;

    // the choose button provied by the plugin
    private choose: SupiElement;

    // the main cookie banner
    private banner: SupiElement;

    // the cookie name which will be set as a status cookie
    private cookieName: string = 'supi-status';

    private cookieAllowed: string = 'supi-allowed';

    // cookie banner is placed in an overlay
    private overlay: boolean = false;

    private switch: SupiElement;

    // the body element
    private body: SupiElement;

    // the typoscript config
    private config: object;

    // the typoscript config
    private allowed: Array<string> = [];

    private save: HTMLElement;

    // Cookie lifetime in days for allow all
    private ttlAll: number = 30;

    // Cookie lifetime in days for selected and dismiss
    private ttlReduced: number = 7;

    private allowAll: boolean = false;

    private allowYoutube: boolean = false;

    /**
     * the constructor
     */
    constructor() {
        this.root = document.getElementById('supi');
        this.dismiss = this.get('#supi__dismiss');
        this.choose = this.get('#supi__choose', true);
        this.banner = this.get('#supi__overlay') ? this.get('#supi__overlay') : this.get('#supi__banner');
        this.overlay = !!(this.get('#supi__overlay'));
        this.body = <HTMLBodyElement>document.getElementsByTagName('body')[0];
        this.config = JSON.parse(this.root.getAttribute('data-supi-config'));
        this.switch = this.get('#supi__switchTo');
        this.save = this.get('#supi__save');

        if (this.config['cookieTTL']) {
            this.ttlReduced = parseInt(this.config['cookieTTL']['reduced']) || this.ttlReduced;
            this.ttlAll = parseInt(this.config['cookieTTL']['allow']) || this.ttlAll;
        }

        try {
            const data = this.getCookie(this.cookieAllowed);

            if (data && data.length) {
                const arr = JSON.parse(data);

                if (Array.isArray(arr)) {
                    this.allowed = arr;
                }
            }
        } catch (e) {
        }

        (<string>this.config['essential']['names']).split(',').forEach((name: string) => {
            if (this.allowed.indexOf(name) === -1) {
                this.allowed.push(name);
            }
        });

        // check, if status cookie is set and check the status it self and react on that
        if (this.getCookie(this.cookieName) === Status.All || this.getCookie(this.cookieName) === '0') {
            this.allowAll = true;
            this.injectJavaScripts();
            this.updateCookieTTL();
        } else if (this.getCookie(this.cookieName) === Status.Selected || this.getCookie(this.cookieName) === '1') {
            this.injectJavaScripts();
            this.updateCookieTTL();
        } else if (this.getCookie(this.cookieName) === '') {
            this.deleteCookie(this.cookieName);

            if (this.get('[data-hide-overlay="1"]', true)) {
                this.log('Hides the Banner-Overlay due to the given Setting "hideOverlayOnButtonCe"', '', '');
            } else {
                this.toggleBanner();
            }
        }

        this.log('Checking for yt cookie');
        this.allowYoutube = this.getCookie('supi-yt') === 'y';
        this.log('Cookie is "%o" resulting in %o', this.getCookie('supi-yt'), this.allowYoutube);
        this.enableYoutubeVideos();

        // add all click handlers to the buttons
        this.addClickHandler();
        this.setDetailDefaults();
    }

    updateCookieTTL(): void {
        this.setCookie(this.cookieName, this.getCookie(this.cookieName));
        this.setCookie(this.cookieAllowed, this.getCookie(this.cookieAllowed));
    }

    /**
     * adds the clickhandler to the buttons
     */
    addClickHandler(): void {
        // on click removes first all scripts and readds then
        // the scripts, after that the banner will be toggled
        this.find('[data-toggle=allow]').forEach((el: HTMLElement) => {
            el.addEventListener('click', (e: Event) => {
                e.preventDefault();
                this.allowAll= true;
                this.collectAllowed(Mode.All);
                this.removeScripts();

                if (this.injectJavaScripts() === true) {
                    this.toggleBanner();
                    this.setCookie(this.cookieName, Status.All);
                }

                this.setDetailDefaults();
            });
        });

        // on click removes all javascripts and toggles the
        // banner
        if (this.dismiss) {
            this.dismiss.addEventListener('click', (e: Event) => {
                e.preventDefault();
                if (this.collectAllowed(Mode.Essential)) {
                    this.removeScripts();
                }

                if (this.removeScripts() === true) {
                    this.toggleBanner();
                    this.setCookie(this.cookieName, Status.Selected);
                }

                this.setDetailDefaults();
            });
        }

        if (this.save) {
            this.save.addEventListener('click', (e: Event) => {
                e.preventDefault();
                this.collectAllowed(Mode.Selected);
                this.removeScripts();

                if (this.injectJavaScripts()) {
                    this.toggleBanner();
                    this.setCookie(this.cookieName, Status.Selected);
                }
            });
        }

        // this click event simply opens the banner for
        // further interaction
        if (this.choose) {
            this.choose.addEventListener('click', (e: Event) => {
                e.preventDefault();
                this.toggleBanner();
            });
        }

        // Add click handler for switching between overview and detailview
        this.find('[data-toggle=switch]').filter((el: HTMLElement) => {
            return this.get(el.dataset.switchFrom) && this.get(el.dataset.switchTo);
        }).forEach((el: HTMLElement) => {
            el.addEventListener('click', (e: Event) => {
                this.get(el.dataset.switchFrom).classList.add('tx-supi__pane-hidden');
                this.get(el.dataset.switchTo).classList.remove('tx-supi__pane-hidden');

                if (el.dataset.inputs === 'disable' && this.allowed.length < 1) {
                    this.find('input[type=checkbox]').forEach((el: HTMLInputElement) => {
                        el.checked = (el.disabled || !!el.dataset.required);
                    });
                }

                e.preventDefault();
            });
        });

        // Simple hide/show toggle, like tabs
        this.find('[data-toggle=visibility]').filter((el: HTMLElement) => {
            return !!(this.get(el.dataset.target));
        }).forEach((el: HTMLElement) => {
            el.addEventListener('click', (e: Event) => {
                el.classList.toggle('tx-supi__pane-active')
                this.get(el.dataset.target).classList.toggle('tx-supi__pane-hidden');
                e.preventDefault();
            })
        });

        // Checkbox groups toggling
        this.find('input[data-supi-block]').filter((el: HTMLInputElement) => !el.disabled).forEach((el: HTMLInputElement) => {
            el.addEventListener('click', (e:Event) => {
                if (el.dataset.supiParent) {
                    this.find('[data-supi-block=' + el.dataset.supiBlock + ']').forEach(function (child: HTMLInputElement) {
                        if (!child.dataset.supiParent) {
                            child.checked = el.checked;
                        }
                    });
                } else {
                    const parent: HTMLInputElement = <HTMLInputElement>this.get('[data-supi-parent=' + el.dataset.supiBlock + ']');
                    const children = this.find('[data-supi-block=' + el.dataset.supiBlock + ']').filter(function (el: HTMLInputElement) {
                        return !!el.dataset.supiItem;
                    });

                    if (parent && children.length) {
                        parent.checked = children.reduce(function (prev: boolean, el: HTMLInputElement) {
                            return prev && el.checked;
                        }, true)
                    }
                }

                e.stopPropagation();
            });
        });

        // Enabling youtube videos
        this.findAll('.tx-supi__youtube').forEach((el: HTMLElement) => {
            this.log("Add listener to child of %o", el);
            el.querySelector('[data-toggle=youtube]').addEventListener('click', () => {
                this.log('Enabling all');
                this.toggleYoutubeVideos(el);
            });
        });
    }

    /**
     * injects the javascripts
     * always use <script type="application/supi"></script>
     * to load the correct scripts
     */
    injectJavaScripts(): boolean {
        let elements: Array<HTMLScriptElement> = [].slice.call(document.getElementsByTagName('script'), 0);

        elements
            .filter(el => el.type == 'application/supi')
            .filter(el => {
                let ok: boolean = this.allowAll || !!el.dataset.supiRequired;

                if (!ok && el.dataset.supiCookies) {
                    ok = el.dataset.supiCookies.split(',').reduce((prev: boolean, current: string) => {
                        return prev || this.allowed.indexOf(current) > -1;
                    }, false);
                }

                return ok;
            })
            .forEach(template => {
                const script = <HTMLScriptElement>document.createElement('script');
                script.type = 'text/javascript';
                script.className = 'supi-scripts';
                script.dataset.supiCookies = template.dataset.supiCookies;
                script.innerHTML = template.innerHTML;

                template.parentNode.replaceChild(script, template);
            });

        return true;
    }

    private find(selector: string): Array<HTMLElement & Node>
    {
        return [].slice.call(this.root.querySelectorAll(selector), 0);
    }

    private findAll(selector: string): Array<HTMLElement & Node>
    {
        return [].slice.call(document.querySelectorAll(selector), 0);
    }

    private get(selector: string, fromBody: boolean = false): SupiElement
    {
        return (fromBody ? document : this.root).querySelector(selector);
    }

    /**
     * simply toggles the banner class
     */
    toggleBanner(): void {
        if (this.overlay === true) {
            this.body.classList.toggle('tx-supi__overlay');
        }

        this.banner.classList.toggle('hide');
    }

    /**
     * removes all script tags added by supi
     * and removes all cookies we have access to and which are not
     * whitelisted by the config
     */
    removeScripts(): boolean {
        let elements: Array<HTMLScriptElement> = [].slice.call(document.getElementsByClassName('supi-scripts'), 0);

        elements.forEach(script => {
            let template = <HTMLScriptElement>document.createElement('script');
            template.type = 'application/supi';
            template.dataset.supiCookies = script.dataset.supiCookies;
            template.innerHTML = script.innerHTML;

            script.parentNode.replaceChild(template, script);
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
        const value = encodeURIComponent(val);
        const days: number = this.allowAll ? this.ttlAll : this.ttlReduced;

        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));

        document.cookie = encodeURIComponent(name)+"="+value+"; expires="+date.toUTCString()+"; path=/";
        sessionStorage.setItem(name, val);
    }

    /**
     * a get cookie method
     *
     * @param name
     */
    getCookie(name: string): string {
        if (sessionStorage.hasOwnProperty(name)) {
            return sessionStorage.getItem(name);
        }

        const value = "; " + document.cookie;
        const parts = value.split("; " + encodeURIComponent(name) + "=");

        if (parts.length == 2) {
            const result = parts.pop().split(";").shift();
            return decodeURIComponent(result);
        }

        return '';
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
        sessionStorage.removeItem(name);
    }

    /**
     * deletes all but the whitelisted cookies
     */
    deleteAllCookies() {
        if (!this.allowAll) {
            const cookies = document.cookie.split('; ');
            cookies.forEach((cookie: string) => {
                const cookieName: string = cookie.split('=').shift();

                if (this.allowed.indexOf(cookieName) === -1) {
                    this.deleteCookie(cookieName);
                    sessionStorage.removeItem(cookieName);
                }
            });
        }
    }

    private collectAllowed(mode: Mode = Mode.Essential): boolean {
        const old = this.allowed.sort().join();
        this.allowed = [];

        switch (mode) {
            case Mode.All:
                Object.keys(this.config)
                    .forEach((k: string) => {
                        this.config[k]?.names.split().forEach((name: string) => {
                            this.allowed.push(name);
                        })
                    });
                break;

            case Mode.Essential:
                Object.keys(this.config)
                    .filter((k: string) => !!this.config[k]['required'])
                    .forEach((k: string) => {
                        this.config[k]?.names.split().forEach((name: string) => {
                            this.allowed.push(name);
                        })
                    });
                break;

            case Mode.Selected:
                this.find('input[type=checkbox]')
                    .filter((el: HTMLInputElement) => el.checked || (parseInt(el.dataset.supiRequired) || 0) > 0)
                    .map((el: HTMLInputElement) => el.value)
                    .forEach((list: string) => {
                        list.split(',').map((e: string) => e.trim()).forEach((el: string) => {
                            if (this.allowed.indexOf(el) === -1) {
                                this.allowed.push(el);
                            }
                        })
                    });
                break;
        }

        setTimeout(() => {
            this.setCookie(this.cookieAllowed, JSON.stringify(this.allowed));
        }, 300);

        return this.allowed.sort().join() === old;
    }

    private setDetailDefaults(): void {
        this.find('input[data-supi-parent]').forEach((parent: HTMLInputElement) => {
            const singleItems = this.find('input[data-supi-block=' + parent.dataset.supiParent + '][data-supi-item]');

            if (singleItems.length) {
                parent.checked = true;
                singleItems.forEach((el: HTMLInputElement) => {
                    el.checked = el.disabled || this.allowAll || el.value.split(',').reduce((prev: boolean, val: string): boolean => {
                        return prev && this.allowed.indexOf(val) > -1;
                    }, true);
                });

                parent.checked = singleItems.reduce((prev: boolean, item: HTMLInputElement): boolean => prev && item.checked, true);
                this.log('Set parent %o to %o', parent, parent.checked);
            } else {
                this.log('Check if all of parent values %s', parent.value, this.allowed);
                parent.checked = parent.disabled || this.allowAll || parent.value.split(',').reduce((prev: boolean, val: string) => {
                    this.log('Checking value %s with prev of %o', val, prev);

                    if (prev) {
                        val = val.replace(/\s+/g, '');
                        this.log('Prev still true, checking if value %s is in %o', val, this.allowed);

                        if (val !== '' && this.allowed.indexOf(val) === -1) {
                            this.log('Value %s is not in %o, setting to false', val, this.allowed);
                            prev = false;
                        }
                    }

                    return prev;
                }, true);
            }
        });
    }

    private log(...values: any[]): void {
        if (this.body.classList.contains('develop')) {
            console.log(...values);
        }
    }

    private enableYoutubeVideos() {
        if (this.allowAll || this.allowYoutube) {
            this.log('Enabling all videos, non autostart')
            this.findAll('.tx-supi__youtube').forEach((el: HTMLElement) => {
                this.log('Enabling %o', el);
                this.addVideo(el, '');
            });
        }
    }

    private toggleYoutubeVideos(autoplayEl) {
        this.log('Enabling youtube');
        this.allowYoutube = true;
        this.setCookie('supi-yt', 'y');
        this.log('Start video for %o', autoplayEl);
        this.addVideo(autoplayEl, '&autoplay=1');
        this.log('Enabling other videos');
        this.enableYoutubeVideos();
    }

    private addVideo(el: HTMLElement, additionalParams: string)
    {
        const size = el.querySelector('.tx-supi__youtube-preview-image').getBoundingClientRect();
        const youtubeId = el.dataset.youtubeId;
        const youtubeUrl = 'https://www.youtube-nocookie.com/embed/' + youtubeId + '?rel=0&modestbranding=1' + additionalParams;
        const iframe: HTMLIFrameElement = document.createElement('iframe');
        iframe.src = youtubeUrl;
        iframe.frameBorder = "0";
        iframe.style.border = '0';
        iframe.width = size.width + "";
        iframe.height = size.height + "";
        el.parentNode.replaceChild(iframe, el);
    }
}

// instanciate the class on load.
window.onload = () => {
    if (document.getElementById('supi')){
        new Supi();
    }
};
