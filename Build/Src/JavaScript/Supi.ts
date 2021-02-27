
import { Mode, Status, SupiElement } from "./Types";
import { findAll, findOne } from "./Dom";
import { SupiOptions } from "./Options";
import { cookie } from "./Cookie";


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
    private readonly cookieNameStatus: string = 'status';

    private readonly cookieNameAllowed: string = 'allowed';

    private readonly cookieNameYoutube: string = 'yt';
    private readonly cookieNameGoogleMaps: string = 'gmaps';

    // cookie banner is placed in an overlay
    private overlay: boolean = false;

    private switch: SupiElement;

    // the body element
    private body: SupiElement;

    // the typoscript config
    private config: SupiOptions;

    // the typoscript config
    private allowed: Array<string> = [];

    private save: HTMLElement;

    // Cookie lifetime in days for allow all
    private ttlAll: number = 30;

    // Cookie lifetime in days for selected and dismiss
    private ttlReduced: number = 7;

    private allowAll: boolean = false;

    private allowYoutube: boolean = false;

    private allowMaps: boolean = false;

    private readonly writeLog: boolean = false;

    /**
     * the constructor
     */
    constructor() {
        this.root = findOne('#supi');
        this.dismiss = findOne('[data-toggle=dismiss]', this.root);
        this.choose = findOne('#supi__choose');
        this.banner = findOne('#supi__overlay') ?? findOne('#supi__banner');
        this.overlay = !!(findOne('#supi__overlay'));
        this.body = <HTMLBodyElement>document.body;
        this.switch = findOne('#supi__switchTo');
        this.save = findOne('[data-toggle=save]', this.root);
        this.writeLog = this.body.classList.contains('develop');

        this.config = JSON.parse(this.root.getAttribute('data-supi-config'));
        this.log("Loaded config %o", this.config);

        this.ttlReduced = this.config?.cookieTTL?.reduced ?? this.ttlReduced;
        this.ttlAll = this.config?.cookieTTL?.all ?? this.ttlAll;

        const data = cookie.get(this.cookieNameAllowed);

        if (Array.isArray(data) && data.length) {
            this.allowed = data;
        }

        this.config?.elements?.essential?.names.split(',').forEach((name: string) => {
            if (this.allowed.indexOf(name) === -1) {
                this.allowed.push(name);
            }
        });

        const status = cookie.get(this.cookieNameStatus) as Status;

        // check, if status cookie is set and check the status it self and react on that
        if (status == Status.All) {
            this.allowAll = true;
            this.injectJavaScripts();
            this.updateCookieTTL();
        } else if (status == Status.Selected) {
            this.injectJavaScripts();
            this.updateCookieTTL();
        } else if (!cookie.get(this.cookieNameStatus)) {
            cookie.remove(this.cookieNameStatus);

            if (findOne('[data-hide-overlay="1"]')) {
                this.log('Hides the Banner-Overlay due to the given Setting "hideOverlayOnButtonCe"', '', '');
            } else {
                this.toggleBanner();
            }
        }

        this.log('Checking for yt cookie');
        this.allowYoutube = cookie.get(this.cookieNameYoutube) as string === 'y' || this.allowAll || (status == Status.Selected && this.config?.essentialIncludesYoutube);
        this.log('Youtube cookie is "%o" resulting in %o', cookie.get(this.cookieNameYoutube), this.allowYoutube);
        this.enableYoutubeVideos();

        this.allowMaps = cookie.get(this.cookieNameGoogleMaps) === 'y' || this.allowAll || (status == Status.Selected && this.config?.essentialIncludesMaps);
        this.log('Maps cookie is "%o" resulting in %o', cookie.get(this.cookieNameGoogleMaps), this.allowMaps);
        this.enableMaps();

        // add all click handlers to the buttons
        this.addClickHandler();
        this.setDetailDefaults();
    }

    updateCookieTTL(): void {
        cookie.setLifetime(this.allowAll ? this.ttlAll : this.ttlReduced);
    }

    /**
     * adds the clickhandler to the buttons
     */
    addClickHandler(): void {
        // on click removes first all scripts and readds then
        // the scripts, after that the banner will be toggled
        findAll('[data-toggle=allow]', this.root).forEach((el: HTMLElement) => {
            this.log("Allow all on click on %o", el);
            el.addEventListener('click', (e: Event) => {
                this.log("Allow all was clicked, processing");
                this.allowAll = true;
                this.allowMaps = true;
                this.allowYoutube = true;

                this.collectAllowed(Mode.All);
                this.removeScripts();

                if (this.injectJavaScripts() === true) {
                    this.toggleBanner();
                    cookie.set(this.cookieNameStatus, Status.All);
                    cookie.set(this.cookieNameYoutube, 'y');
                    cookie.set(this.cookieNameGoogleMaps, 'y');
                }

                this.setDetailDefaults();
                this.enableMaps();
                this.enableYoutubeVideos();
                e.preventDefault();
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

                if (this.config?.essentialIncludesYoutube) {
                    this.allowYoutube = true;
                    cookie.set(this.cookieNameYoutube, 'y');
                    this.enableYoutubeVideos();
                }

                if (this.config?.essentialIncludesMaps) {
                    this.allowMaps = true;
                    cookie.set(this.cookieNameGoogleMaps, 'y');
                    this.enableMaps();
                }

                if (this.removeScripts() === true) {
                    this.toggleBanner();
                    cookie.set(this.cookieNameStatus, Status.Selected);
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
                    cookie.set(this.cookieNameStatus, Status.Selected);
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
        findAll('[data-toggle=switch]').filter((el: HTMLElement) => {
            return findOne(el.dataset.switchFrom) && findOne(el.dataset.switchTo);
        }).forEach((el: HTMLElement) => {
            el.addEventListener('click', (e: Event) => {
                findOne(el.dataset.switchFrom).classList.add('tx-supi__pane-hidden');
                findOne(el.dataset.switchTo).classList.remove('tx-supi__pane-hidden');

                if (el.dataset.inputs === 'disable' && this.allowed.length < 1) {
                    findAll('input[type=checkbox]').forEach((el: HTMLInputElement) => {
                        el.checked = (el.disabled || !!el.dataset.required);
                    });
                }

                e.preventDefault();
            });
        });

        // Simple hide/show toggle, like tabs
        findAll('[data-toggle=visibility]').filter((el: HTMLElement) => {
            return !!(findOne(el.dataset.target));
        }).forEach((el: HTMLElement) => {
            el.addEventListener('click', (e: Event) => {
                el.classList.toggle('tx-supi__pane-active')
                findOne(el.dataset.target).classList.toggle('tx-supi__pane-hidden');
                e.preventDefault();
            })
        });

        // Checkbox groups toggling
        findAll('input[data-supi-block]').filter((el: HTMLInputElement) => !el.disabled).forEach((el: HTMLInputElement) => {
            el.addEventListener('click', (e:Event) => {
                if (el.dataset.supiParent) {
                    findAll('[data-supi-block=' + el.dataset.supiBlock + ']').forEach(function (child: HTMLInputElement) {
                        if (!child.dataset.supiParent) {
                            child.checked = el.checked;
                        }
                    });
                } else {
                    const parent: HTMLInputElement = <HTMLInputElement>findOne('[data-supi-parent=' + el.dataset.supiBlock + ']');
                    const children = findAll('[data-supi-block=' + el.dataset.supiBlock + ']').filter(function (el: HTMLInputElement) {
                        return !!el.dataset.supiItem;
                    });

                    if (parent && children.length) {
                        parent.checked = children.reduce(function (prev: boolean, el: HTMLInputElement) {
                            return prev && el.checked;
                        }, true);
                    }
                }

                e.stopPropagation();
            });
        });

        // Enabling youtube videos on click
        findAll('.tx-supi__youtube').forEach((el: HTMLElement) => {
            this.log("Add listener to child of %o", el);
            el.querySelector('[data-toggle=youtube]').addEventListener('click', () => {
                this.log('Enabling all youtube elements');
                cookie.set(this.cookieNameYoutube, 'y');
                this.toggleYoutubeVideos(el);
            });

            el.querySelector('[data-toggle=youtube-once]')?.addEventListener('click', () => {
                this.log('Enabling one youtube element: %o', el);
                this.toggleYoutubeVideos(el, true);
            });
        });

        // Enabling maps on click
        findAll('.tx_supi__map').forEach((wrapper: HTMLElement) => {
            const toggle = wrapper.querySelector('[data-toggle=map]');
            this.log('Add listener to toggle %o for map %o', toggle, wrapper);
            toggle.addEventListener('click', () => {
                this.allowMaps = true;
                cookie.set(this.cookieNameGoogleMaps, 'y');
                this.enableMaps();
            });
        });
    }

    /**
     * injects the javascripts
     * always use <script type="application/supi"></script>
     * to load the correct scripts
     */
    injectJavaScripts(): boolean {
        let elements = findAll("script") as Array<HTMLScriptElement>;

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
        let elements: Array<HTMLScriptElement> = findAll('.supi-scripts') as Array<HTMLScriptElement>;

        elements.forEach(script => {
            let template = <HTMLScriptElement>document.createElement('script');
            template.type = 'application/supi';
            template.dataset.supiCookies = script.dataset.supiCookies;
            template.innerHTML = script.innerHTML;

            script.parentNode.replaceChild(template, script);
        });

        return true;
    }

    private collectAllowed(mode: Mode = Mode.Essential): boolean {
        const old = this.allowed.sort().join();
        this.allowed = [];

        switch (mode) {
            case Mode.All:
                Object.keys(this.config.elements)
                    .forEach((k: string) => {
                        this.config.elements[k]?.names?.split(",").forEach((name: string) => {
                            this.allowed.push(name);
                        })
                    });
                break;

            case Mode.Essential:
                Object.keys(this.config.elements || {})
                    .filter((k: string) => !!this.config?.elements[k]?.required)
                    .forEach((k: string) => {
                        this.config.elements[k]?.names?.split(",").forEach((name: string) => {
                            this.allowed.push(name);
                        })
                    });
                break;

            case Mode.Selected:
                findAll('input[type=checkbox]', this.root)
                    .filter((el: HTMLInputElement) => el.checked || (parseInt(el.dataset.supiRequired) || 0) > 0)
                    .forEach((el: HTMLInputElement) => {
                        if (el.dataset.supiService) {
                            switch (el.dataset.supiService) {
                                case 'googleMaps':
                                    cookie.set(this.cookieNameGoogleMaps, 'y');
                                    this.allowMaps = true;
                                    this.enableMaps();
                                    break;
                                case 'youtube':
                                    cookie.set(this.cookieNameYoutube, 'y');
                                    this.allowYoutube = true;
                                    this.enableYoutubeVideos();
                                    break;
                            }
                        } else {
                            el.value.split(',').map((e: string) => e.trim()).forEach((el: string) => {
                                if (this.allowed.indexOf(el) === -1) {
                                    this.allowed.push(el);
                                }
                            });
                        }
                    });
                break;
        }

        setTimeout(() => {
            cookie.set(this.cookieNameAllowed, this.allowed);
        }, 30);

        return this.allowed.sort().join() === old;
    }

    private setDetailDefaults(): void {
        findAll('input[data-supi-parent]').forEach((parent: HTMLInputElement) => {
            const singleItems = findAll('input[data-supi-block=' + parent.dataset.supiParent + '][data-supi-item]');

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
        if (this.writeLog) {
            console.log(...values);
        }
    }

    private enableYoutubeVideos(): void {
        if (this.allowYoutube) {
            this.log('Enabling all videos, non autostart')
            findAll('.tx-supi__youtube').forEach((el: HTMLElement) => {
                this.log('Enabling %o', el);
                this.addVideo(el, '');
            });

            // add custom event to react to (e.g. to handle classnames)
            let onYouTubeAllowedEvent = new CustomEvent("onYouTubeAllowed", {detail: 1});
            window.dispatchEvent(onYouTubeAllowedEvent);

        }
    }

    private toggleYoutubeVideos(autoplayEl: SupiElement, once: boolean = false): void {
        this.log('Enabling youtube');
        this.allowYoutube = true;
        this.log('Start video for %o', autoplayEl);
        this.addVideo(autoplayEl, '&autoplay=1');

        if (!once) {
            cookie.set(this.cookieNameYoutube, 'y');
            this.log('Enabling other videos');
            this.enableYoutubeVideos();
        } else {
            this.allowYoutube = false;
        }
    }

    private addVideo(el: HTMLElement, additionalParams: string): void
    {
        if (!this.allowYoutube) {
            this.log('Youtube not enabled');
            return;
        }

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

    private enableMaps() {
        if (this.allowMaps) {
            findAll('.tx_supi__map').forEach((wrapper: HTMLElement) => {
                const toggle: HTMLElement = wrapper.querySelector('[data-toggle=map]');
                const cbName = toggle.dataset.callback;
                wrapper.classList.add('active');
                window[cbName]();
            });
        }
    }
}

const initFunc = () => {
    (window as any).supi = new Supi();
    window.removeEventListener("load", initFunc);
};

window.addEventListener("load", initFunc);
