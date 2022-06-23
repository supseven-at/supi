import { Mode, Status, SupiElement } from './Types';
import { findAll, findOne } from './Dom';
import { SupiOptions } from './Options';
import { cookie } from './Cookie';

/**
 * Supseven User Privacy Interface Class
 * for GDPR Issues
 */
export class Supi {
    // Main wrapper around everything
    private root: SupiElement = null;

    // the dismiss button
    private dismiss: SupiElement = null;

    // the choose button provied by the plugin
    private choose: SupiElement = null;

    // the main cookie banner
    private banner: SupiElement = null;

    // the dialog modal
    private modal: SupiElement = null;

    private readonly focusTrapEventHandler: (event: KeyboardEvent) => void = (): void => {};

    private focusTrapElements?: SupiElement[];

    private preFocusTrapActiveElement?: SupiElement;

    // the cookie name which will be set as a status cookie
    private readonly cookieNameStatus: string = 'status';

    private readonly cookieNameAllowed: string = 'allowed';

    private readonly cookieNameYoutube: string = 'yt';
    private readonly cookieNameGoogleMaps: string = 'gmaps';

    // cookie banner is placed in an overlay
    private overlay: boolean = false;

    // the body element
    private body: SupiElement = null;

    // the html element
    private html: SupiElement = null;

    // the typoscript config
    private config: SupiOptions = <SupiOptions>{};

    // the typoscript config
    private allowed: Array<string> = [];

    private save: SupiElement = null;

    // Cookie lifetime in days for allow all
    private ttlAll: number = 30;

    // Cookie lifetime in days for selected and dismiss
    private ttlReduced: number = 7;

    private allowAll: boolean = false;

    private allowYoutube: boolean = false;

    private allowMaps: boolean = false;

    private readonly writeLog: boolean = false;

    private services: Array<string> = [];

    /**
     * the constructor
     */
    constructor() {
        this.root = findOne('#supi');

        if (!this.root) {
            return;
        }

        this.dismiss = findOne('[data-toggle=dismiss]', this.root);
        this.choose = findOne('#supi__choose');
        this.banner = findOne('#supi__overlay') ?? findOne('#supi__banner');
        this.modal = findOne('#supi__banner');
        this.focusTrapEventHandler = this.focusTrapNavigator.bind(this);
        this.overlay = !!findOne('#supi__overlay');
        this.html = findOne('html');
        this.body = <HTMLBodyElement>document.body;
        this.save = findOne('[data-toggle=save]', this.root);

        const configSrc = this.root.getAttribute('data-supi-config');
        if (configSrc) {
            this.config = <SupiOptions>JSON.parse(configSrc);
        } else {
            this.config = <SupiOptions>{};
        }

        this.writeLog = this.body.classList.contains(this.config?.debugClass ?? 'develop');

        this.log('Loaded config %o', this.config);

        this.ttlReduced = this.config?.cookieTTL?.reduced ?? this.ttlReduced;
        this.ttlAll = this.config?.cookieTTL?.all ?? this.ttlAll;

        if (this.config.cookieDomain) {
            cookie.useDomain(this.config.cookieDomain);
        }

        const data = cookie.get(this.cookieNameAllowed);

        if (Array.isArray(data) && data.length) {
            this.allowed = data;
        }

        this.config?.elements?.essential?.names?.split(',').forEach((name: string) => {
            name = (name + '').trim();

            if (name !== '' && this.allowed.indexOf(name) === -1) {
                this.allowed.push(name);
            }
        });

        Object.keys(this.config.elements).forEach((element: string) => {
            Object.keys(this.config.elements[element].items).forEach((item: string) => {
                const serviceName = this.config?.elements[element]?.items[item]?.service ?? '';
                if (serviceName) {
                    this.services.push(serviceName);
                }
            });
        });

        this.log('Collected services %o', this.services);

        const status = cookie.get(this.cookieNameStatus) as Status;

        // check, if status cookie is set and check the status it self and react on that
        if (status == Status.All) {
            this.allowAll = true;
            this.injectJavaScripts();
            this.updateCookieTTL();
            this.removeNotAllowedCookies();
        } else if (status == Status.Selected) {
            this.injectJavaScripts();
            this.updateCookieTTL();
            this.removeNotAllowedCookies();
        } else if (!cookie.get(this.cookieNameStatus)) {
            cookie.remove(this.cookieNameStatus);

            if (findOne('[data-hide-overlay="1"]')) {
                this.log('Hides the Banner-Overlay due to the given Setting "hideOverlayOnButtonCe"', '', '');
            } else {
                this.toggleBanner();
            }
        }

        this.log('Checking for yt cookie');
        this.allowYoutube =
            (cookie.get(this.cookieNameYoutube) as string) === 'y' ||
            this.allowAll ||
            (status == Status.Selected && this.config?.essentialIncludesYoutube);
        this.log('Youtube cookie is "%o" resulting in %o', cookie.get(this.cookieNameYoutube), this.allowYoutube);
        this.enableYoutubeVideos();

        this.allowMaps =
            cookie.get(this.cookieNameGoogleMaps) === 'y' ||
            this.allowAll ||
            (status == Status.Selected && this.config?.essentialIncludesMaps);
        this.log('Maps cookie is "%o" resulting in %o', cookie.get(this.cookieNameGoogleMaps), this.allowMaps);
        this.enableMaps();

        // add all click handlers to the buttons
        this.addClickHandler();
        this.setDetailDefaults();

        this.toggleAllServices();
    }

    private toggleAllServices(): void {
        this.services.forEach((service: string) => this.toggleService(service));
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
        findAll('[data-toggle=allow]', this.root).forEach((el: SupiElement) => {
            this.log('Allow all on click on %o', el);
            el?.addEventListener('click', (e: Event) => {
                this.log('Allow all was clicked, processing');
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
                this.removeNotAllowedCookies();
                this.toggleAllServices();
                e.preventDefault();
            });
        });

        // on click removes all javascripts and toggles the
        // banner
        if (this.dismiss) {
            this.dismiss.addEventListener('click', (e: Event) => {
                e.preventDefault();
                this.allowAll = false;

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

                this.toggleAllServices();
                this.setDetailDefaults();
                this.removeNotAllowedCookies();
            });
        }

        if (this.save) {
            this.save.addEventListener('click', (e: Event) => {
                e.preventDefault();
                this.allowAll = false;
                this.collectAllowed(Mode.Selected);
                this.removeScripts();

                if (this.injectJavaScripts()) {
                    this.toggleBanner();
                    cookie.set(this.cookieNameStatus, Status.Selected);
                }

                this.toggleAllServices();
                this.removeNotAllowedCookies();
            });
        }

        // this click event simply opens the banner for
        // further interaction
        if (this.choose) {
            this.log('Add main choose toggle to %o', this.choose);
            this.choose.addEventListener('click', (e: Event) => {
                e.preventDefault();
                this.toggleBanner();
            });
        }

        findAll('a, button')
            .filter((el: SupiElement) => el?.getAttribute('href') == '#supi-choose')
            .forEach((el: SupiElement) => {
                this.log('Add choose toggle to %o', el);

                el?.addEventListener('click', (e: Event) => {
                    e.preventDefault();
                    this.toggleBanner();
                });
            });

        // Add click handler for switching between overview and detailview
        findAll('[data-toggle=switch]')
            .filter((el: SupiElement) => {
                return findOne(el?.dataset.switchFrom ?? '') && findOne(el?.dataset.switchTo ?? '');
            })
            .forEach((el: SupiElement) => {
                el?.addEventListener('click', (e: Event) => {
                    findOne(el?.dataset.switchFrom ?? '')?.classList.add('tx-supi__pane-hidden');
                    findOne(el?.dataset.switchFrom ?? '')?.setAttribute('hidden', '');
                    findOne(el?.dataset.switchTo ?? '')?.classList.remove('tx-supi__pane-hidden');
                    findOne(el?.dataset.switchTo ?? '')?.removeAttribute('hidden');

                    if (el.dataset.inputs === 'disable' && this.allowed.length < 1) {
                        findAll('input[type=checkbox]').forEach((e: SupiElement) => {
                            const el = e as HTMLInputElement;
                            el.checked = el.disabled || !!el.dataset.required;
                        });
                    }

                    this.focusTrapElements = this.getFocusTrapElements();

                    e.preventDefault();
                });
            });

        // Simple hide/show toggle, like tabs
        findAll('[data-toggle=visibility]')
            .filter((el: SupiElement) => {
                return !!findOne(el?.dataset.target ?? '');
            })
            .forEach((el: SupiElement) => {
                el?.addEventListener('click', (e: Event) => {
                    el?.classList.toggle('tx-supi__pane-active');
                    let expanded = el.getAttribute('aria-expanded');
                    if (expanded === 'false') {
                        el?.setAttribute('aria-expanded', 'true');
                        this.focusTrapElements = this.getFocusTrapElements();
                    } else {
                        el?.setAttribute('aria-expanded', 'false');
                    }
                    let target = findOne(el?.dataset.target ?? '');
                    target?.classList.toggle('tx-supi__pane-hidden');
                    if (!target?.classList.contains('tx-supi__pane-hidden')) {
                        this.focusTrapElements = this.getFocusTrapElements();
                    }
                    target?.toggleAttribute('hidden');
                    e.preventDefault();
                });
            });

        // Checkbox groups toggling
        findAll('input[data-supi-block]')
            .filter((el: SupiElement) => !(el as HTMLInputElement).disabled)
            .forEach((el: SupiElement) => {
                el?.addEventListener('click', (e: Event) => {
                    if (el?.dataset.supiParent) {
                        findAll('[data-supi-block=' + el.dataset.supiBlock + ']').forEach(function (
                            child: SupiElement
                        ) {
                            if (!child?.dataset.supiParent) {
                                (child as HTMLInputElement).checked = (el as HTMLInputElement).checked;
                            }
                        });
                    } else {
                        const parent: HTMLInputElement = <HTMLInputElement>(
                            findOne('[data-supi-parent=' + el.dataset.supiBlock + ']')
                        );
                        const children = findAll('[data-supi-block=' + el.dataset.supiBlock + ']').filter(function (
                            el: SupiElement
                        ) {
                            return !!el?.dataset.supiItem;
                        }) as Array<HTMLInputElement>;

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
        findAll('.tx-supi__youtube').forEach((el: SupiElement) => {
            this.log('Add listener to child of %o', el);

            el?.querySelector('[data-toggle=youtube]')?.addEventListener('click', () => {
                this.log('Enabling all youtube elements');
                cookie.set(this.cookieNameYoutube, 'y');
                this.toggleYoutubeVideos(el);
            });

            el?.querySelector('[data-toggle=youtube-once]')?.addEventListener('click', () => {
                this.log('Enabling one youtube element: %o', el);
                this.toggleYoutubeVideos(el, true);
            });
        });

        // Enabling maps on click
        findAll('.tx_supi__map').forEach((wrapper: SupiElement) => {
            const toggle = wrapper?.querySelector('[data-toggle=map]') as SupiElement;
            this.log('Add listener to toggle %o for map %o', toggle, wrapper);
            toggle?.addEventListener('click', () => {
                this.allowMaps = true;
                cookie.set(this.cookieNameGoogleMaps, 'y');
                this.enableMaps();
            });
        });

        // Enabling simpleMaps on click
        findAll('.tx-supi__simpleMaps').forEach((el: SupiElement) => {
            this.log('Add listener to for simpleMap %o', el);

            el?.querySelector('[data-toggle=simpleMaps]')?.addEventListener('click', () => {
                this.log('Enabling all simple google maps elements');
                cookie.set(this.cookieNameGoogleMaps, 'y');
                this.toggleSimpleMaps(el);
            });

            el?.querySelector('[data-toggle=simpleMaps-once]')?.addEventListener('click', () => {
                this.log('Enabling onr simple google maps elements');
                this.toggleSimpleMaps(el, true);
            });
        });

        // Enable services
        findAll('[data-supi-service-container]').forEach((el: SupiElement) => {
            let serviceName = el?.dataset.supiServiceContainer || '';

            if (serviceName) {
                el?.querySelector('[data-toggle=supiServiceContainer]')?.addEventListener('click', () => {
                    this.log('Enabling service ' + serviceName);
                    cookie.set(serviceName, 'y');
                    this.toggleService(serviceName);
                });
            }
        });

        // Details accordion in banner overlay
        findAll('[data-toggle=supiDetails]').forEach((el: SupiElement) => {
            el?.addEventListener('click', (ev: Event) => {
                const target = findOne(el?.dataset.target ?? '');

                if (target) {
                    const exp = el?.getAttribute('aria-expanded') ?? '';
                    this.log('aria-expanded before: ' + exp);
                    this.log('hidden before: ' + target?.hasAttribute('hidden'));
                    exp === 'false'
                        ? el.setAttribute('aria-expanded', 'true')
                        : el.setAttribute('aria-expanded', 'false');
                    target.hasAttribute('hidden')
                        ? target.removeAttribute('hidden')
                        : target.setAttribute('hidden', '');
                    this.log('aria-expanded after: ' + el?.getAttribute('aria-expanded') ?? '');
                    this.log('hidden after: ' + target.hasAttribute('hidden'));
                }

                ev.preventDefault();
            });
        });
    }

    /**
     * injects the javascripts
     * always use <script type="application/supi"></script>
     * to load the correct scripts
     */
    injectJavaScripts(): boolean {
        let elements = findAll('script') as Array<HTMLScriptElement>;

        elements
            .filter((el) => el.type == 'application/supi')
            .filter((el) => {
                let ok: boolean = this.allowAll || !!el.dataset.supiRequired;

                if (!ok && el.dataset.supiCookies) {
                    ok = el.dataset.supiCookies.split(',').reduce((prev: boolean, current: string) => {
                        return prev || this.allowed.indexOf(current) > -1;
                    }, false);
                }

                return ok;
            })
            .forEach((template) => {
                const script = <HTMLScriptElement>document.createElement('script');
                script.type = 'text/javascript';
                script.className = 'supi-scripts';
                script.dataset.supiCookies = template.dataset.supiCookies;
                script.innerHTML = template.innerHTML;

                template.parentNode?.replaceChild(script, template);

                this.trigger('injectScript', script as HTMLElement, null);
            });

        return true;
    }

    /**
     * simply toggles the banner class
     */
    toggleBanner(): void {
        if (this.overlay == true) {
            this.body?.classList.toggle('tx-supi__overlay');
            this.html?.classList.toggle('tx-supi__overlay');
        }

        this.banner?.classList.toggle('hide');

        if (this.banner?.classList.contains('hide')) {
            this.trigger('bannerHide', this.banner as HTMLElement, null);
            this.disableFocusTrap();
        } else {
            this.trigger('bannerShow', this.banner as HTMLElement, null);
            requestAnimationFrame(() => {
                this.modal?.focus();
            });
            this.enableFocusTrap();
        }

        let allowAllServices = true;
        let mapsToggle = findOne('[data-supi-service=googleMaps]', this.root);

        if (mapsToggle) {
            allowAllServices = this.allowMaps && allowAllServices;
            (mapsToggle as HTMLInputElement).checked = this.allowMaps;
        }

        let youtubeToggle = findOne('[data-supi-service=youtube]', this.root);

        if (youtubeToggle) {
            allowAllServices = this.allowYoutube && allowAllServices;
            (youtubeToggle as HTMLInputElement).checked = this.allowYoutube;
        }

        findAll('[data-supi-service]', this.root).forEach((el: SupiElement) => {
            if (
                !el?.dataset.supiParent &&
                el?.dataset.supiService != 'youtube' &&
                el?.dataset.supiService != 'googleMaps'
            ) {
                let allowed = this.allowAll || cookie.get(el?.dataset.supiService ?? '') == 'y';
                (el as HTMLInputElement).checked = allowed;
                allowAllServices = allowed && allowAllServices;
            }
        });

        let mediaToggle = findOne('[data-supi-parent=media]', this.root);

        if (mediaToggle) {
            (mediaToggle as HTMLInputElement).checked = allowAllServices;
        }
    }

    /**
     * removes all script tags added by supi
     * and removes all cookies we have access to and which are not
     * whitelisted by the config
     */
    removeScripts(): boolean {
        let elements: Array<HTMLScriptElement> = findAll('.supi-scripts') as Array<HTMLScriptElement>;

        elements.forEach((script) => {
            let template = <HTMLScriptElement>document.createElement('script');
            template.type = 'application/supi';
            template.dataset.supiCookies = script.dataset.supiCookies;
            template.innerHTML = script.innerHTML;

            script.parentNode?.replaceChild(template, script);
        });

        return true;
    }

    private collectAllowed(mode: Mode = Mode.Essential): boolean {
        const old = this.allowed.sort().join();
        this.allowed = [];

        switch (mode) {
            case Mode.All:
                this.trigger('allowAll', document.body, null);
                Object.keys(this.config.elements).forEach((k: string) => {
                    this.config.elements[k]?.names?.split(',').forEach((name: string) => {
                        name = (name + '').trim();

                        if (name !== '' && this.allowed.indexOf(name) === -1) {
                            this.allowed.push(name);
                        }
                    });
                });
                break;

            case Mode.Essential:
                this.trigger('allowEssential', document.body, null);
                cookie.set(this.cookieNameGoogleMaps, 'n');
                this.allowMaps = false;
                cookie.set(this.cookieNameYoutube, 'n');
                this.allowYoutube = false;
                this.services.forEach((serviceName: string) => cookie.set(serviceName, 'n'));

                Object.keys(this.config.elements || {})
                    .filter((k: string) => !!this.config?.elements[k]?.required)
                    .forEach((k: string) => {
                        this.config.elements[k]?.names?.split(',').forEach((name: string) => {
                            name = (name + '').trim();

                            if (name !== '' && this.allowed.indexOf(name) === -1) {
                                this.allowed.push(name);
                            }
                        });
                    });
                break;

            case Mode.Selected:
                this.trigger('allowSelected', document.body, null);
                cookie.set(this.cookieNameGoogleMaps, 'n');
                this.allowMaps = false;
                cookie.set(this.cookieNameYoutube, 'n');
                this.allowYoutube = false;

                this.services.forEach((serviceName: string) => cookie.set(serviceName, 'n'));

                findAll('input[type=checkbox]', this.root)
                    .filter(
                        (el: SupiElement) =>
                            (el as HTMLInputElement).checked || (parseInt(el?.dataset.supiRequired ?? '0') || 0) > 0
                    )
                    .forEach((el: SupiElement) => {
                        if (el != null && el.dataset.supiService) {
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
                                default:
                                    cookie.set(el.dataset.supiService, 'y');
                                    this.toggleAllServices();
                            }
                        } else {
                            (el as HTMLInputElement).value
                                .split(',')
                                .map((e: string) => e.trim())
                                .forEach((el: string) => {
                                    if (el !== '' && this.allowed.indexOf(el) === -1) {
                                        this.allowed.push(el);
                                    }
                                });
                        }
                    });
                break;
        }

        cookie.set(this.cookieNameAllowed, this.allowed);

        return this.allowed.sort().join() === old;
    }

    private enableFocusTrap(): void {
        this.preFocusTrapActiveElement = undefined;
        if (document.activeElement instanceof HTMLElement) {
            this.preFocusTrapActiveElement = document.activeElement;
            document.activeElement.blur();
        }
        document.addEventListener('keydown', this.focusTrapEventHandler);
    }

    private disableFocusTrap(): void {
        document.removeEventListener('keydown', this.focusTrapEventHandler);
        if (this.preFocusTrapActiveElement instanceof HTMLElement) {
            this.preFocusTrapActiveElement.focus();
        }
    }

    private focusTrapNavigator(event: KeyboardEvent) {
        if (event.key !== 'Tab') {
            return;
        }
        event.preventDefault();
        this.focusTrapElements = this.getFocusTrapElements();
        const currentlyFocusedElementIndex = this.focusTrapElements.indexOf(document.activeElement as HTMLElement);
        let nextFocusElementIndex = currentlyFocusedElementIndex + (event.shiftKey ? -1 : 1);
        if (nextFocusElementIndex < 0) {
            nextFocusElementIndex = this.focusTrapElements.length - 1;
        } else if (nextFocusElementIndex >= this.focusTrapElements.length) {
            nextFocusElementIndex = 0;
        }
        this.focusTrapElements[nextFocusElementIndex]?.focus();
    }

    private getFocusTrapElements(): SupiElement[] {
        return findAll('a, button, *[tabindex], input[type=checkbox]:not([disabled])', this.banner).filter(
            (element) => {
                return (
                    element != null &&
                    (element.offsetWidth > 0 || element.offsetHeight > 0 || element.getClientRects().length > 0)
                );
            }
        );
    }

    private removeNotAllowedCookies(): void {
        // Remove previously set cookies
        this.log(
            'Comparing currently set cookies %o with allowed %o, allow all is %o',
            cookie.getCookieNames(),
            this.allowed,
            this.allowAll
        );

        cookie.getCookieNames().forEach((cookieName: string) => {
            if (!this.allowAll && this.allowed.indexOf(cookieName) === -1) {
                this.log('Removing cookie ' + cookieName);
                cookie.purgeCookie(cookieName);
                this.trigger('cookieDeleted', document.body, {
                    name: cookieName,
                });
            }
        });

        cookie.set(this.cookieNameAllowed, this.allowed);
    }

    private setDetailDefaults(): void {
        findAll('input[data-supi-parent]').forEach((p: SupiElement): void => {
            const parent = p as HTMLInputElement;
            const singleItems = findAll('input[data-supi-block=' + parent.dataset.supiParent + '][data-supi-item]');

            if (singleItems.length) {
                parent.checked = true;
                singleItems.forEach((e: SupiElement) => {
                    const el = e as HTMLInputElement;
                    el.checked =
                        el.disabled ||
                        this.allowAll ||
                        el.value.split(',').reduce((prev: boolean, val: string): boolean => {
                            return prev && this.allowed.indexOf(val) > -1;
                        }, true);
                });

                singleItems.forEach((e: SupiElement) => {
                    if (!(e as HTMLInputElement).checked) {
                        parent.checked = false;
                    }
                });
                this.log('Set parent %o to %o', parent, parent.checked);
            } else {
                this.log('Check if all of parent values %s', parent.value, this.allowed);
                parent.checked =
                    parent.disabled ||
                    this.allowAll ||
                    parent.value.split(',').reduce((prev: boolean, val: string) => {
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
            this.log('Enabling all videos, non autostart');
            findAll('.tx-supi__youtube').forEach((el: SupiElement) => {
                this.log('Enabling %o', el);
                this.addVideo(el as HTMLElement, '');
            });
        }
    }

    private toggleYoutubeVideos(autoplayEl: SupiElement, once: boolean = false): void {
        this.log('Enabling youtube');
        this.allowYoutube = true;
        this.log('Start video for %o', autoplayEl);
        this.addVideo(autoplayEl as HTMLElement, '&autoplay=1&mute=1');

        if (!once) {
            cookie.set(this.cookieNameYoutube, 'y');
            this.log('Enabling other videos');
            this.enableYoutubeVideos();
        } else {
            this.allowYoutube = false;
        }
    }

    private addVideo(el: HTMLElement, additionalParams: string): void {
        if (!this.allowYoutube) {
            this.log('Youtube not enabled');
            return;
        }

        const size = el.querySelector('.tx-supi__youtube-preview-image')?.getBoundingClientRect();
        const youtubeId = el.dataset.youtubeId;
        const youtubeUrl =
            'https://www.youtube-nocookie.com/embed/' + youtubeId + '?rel=0&modestbranding=1' + additionalParams;
        const iframe: HTMLIFrameElement = document.createElement('iframe');
        iframe.src = youtubeUrl;
        iframe.frameBorder = '0';
        iframe.style.border = '0';
        iframe.width = size?.width + '';
        iframe.height = size?.height + '';
        iframe.setAttribute('autoplay', 'true');
        el.parentNode?.replaceChild(iframe, el);

        // add custom event to react to (e.g. to handle classnames)
        this.trigger('youTubeAllowed', iframe, {
            iframe: iframe,
            datset: el.dataset,
        });
    }

    private enableMaps() {
        if (this.allowMaps) {
            findAll('.tx_supi__map').forEach((w: SupiElement) => {
                const wrapper = w as HTMLElement;
                const toggle: HTMLElement = wrapper?.querySelector('[data-toggle=map]') as HTMLElement;

                if (toggle != null) {
                    const cbName = toggle.dataset.callback;
                    wrapper.classList.add('active');
                    // @ts-ignore
                    window[cbName]();

                    this.trigger('customMapAllowed', wrapper, {
                        wrapper: wrapper,
                        callback: cbName,
                    });
                }
            });

            this.enableSimpleMaps();
        }
    }

    // simple iframe maps implementation
    private enableSimpleMaps() {
        this.log('Enabling all simple maps implementations');
        findAll('.tx-supi__simpleMaps').forEach((e: SupiElement) => {
            const el = e as HTMLElement;
            this.log('Enabling %o', el);
            this.addSimpleMap(el);
        });
    }

    private toggleSimpleMaps(el: SupiElement, once: boolean = false): void {
        this.log('Enabling Simple Maps');
        this.allowMaps = true;
        this.addSimpleMap(el as HTMLElement);

        if (!once) {
            cookie.set(this.cookieNameGoogleMaps, 'y');
            this.log('Enabling all maps');
            this.enableSimpleMaps();
        } else {
            this.allowMaps = false;
        }
    }

    private addSimpleMap(el: HTMLElement): void {
        if (!this.allowMaps) {
            this.log('Google Maps not enabled');
            return;
        }

        const address = el.dataset.mapAddress;
        const zoom = el.dataset?.mapZoom ? el.dataset?.mapZoom : 15;
        const simpleMapsUrl =
            'https://maps.google.com/maps?q=' + address + '&t=&z=' + zoom + '&ie=UTF8&iwloc=&output=embed';
        const iframe: HTMLIFrameElement = document.createElement('iframe');
        iframe.src = simpleMapsUrl;
        iframe.frameBorder = '0';
        iframe.style.border = '0';
        iframe.width = '800';
        iframe.height = '600';
        el.parentNode?.replaceChild(iframe, el);

        // add custom event to react to (e.g. to handle classnames)
        this.trigger('simpleMapAllowed', iframe, {
            iframe: iframe,
            data: el.dataset,
        });
    }

    private toggleService(serviceName: string): void {
        if (cookie.get(serviceName) == 'y' || this.allowAll) {
            this.log('Enabling service %o', serviceName);

            findAll('[data-supi-service-container=' + serviceName + ']').forEach((e: SupiElement): void => {
                const el = e as HTMLElement;
                const parent = el.parentNode;
                let newEl: HTMLElement;
                const attr = el.dataset.supiServiceAttr;

                if (el.dataset.supiServiceType === 'callback') {
                    this.log('Executing service %s callback %s', serviceName, el.dataset.supiServiceCallback);
                    setTimeout(() => {
                        try {
                            const func = el.dataset.supiServiceCallback;
                            // @ts-ignore
                            window[func](el);
                            this.trigger('serviceCallback', parent as HTMLElement, {
                                newEl: newEl,
                                service: serviceName,
                            });
                        } catch (e) {
                            this.log('Cannot call service callback %s: %s', el.dataset.supiServiceCallback, e);
                            this.trigger('serviceCallbackError', parent as HTMLElement, {
                                newEl: newEl,
                                service: serviceName,
                                func: el.dataset.supiServiceCallback,
                                error: e,
                            });
                        }
                    }, 10);

                    return;
                }

                this.log('Enable element %o of service %o', el, serviceName);

                switch (el.dataset.supiServiceType) {
                    case 'script':
                        newEl = document.createElement('script');
                        (newEl as HTMLScriptElement).type = 'text/javascript';
                        (newEl as HTMLScriptElement).async = true;
                        (newEl as HTMLScriptElement).defer = true;
                        break;

                    case 'img':
                        newEl = document.createElement('img');
                        (newEl as HTMLImageElement).alt = '';
                        (newEl as HTMLImageElement).border = '0';
                        break;

                    default:
                        newEl = document.createElement('iframe');
                        (newEl as HTMLIFrameElement).frameBorder = '0';
                        (newEl as HTMLIFrameElement).referrerPolicy = 'no-referrer';
                        newEl.style.border = '0';
                }

                if (attr) {
                    try {
                        for (const [name, value] of Object.entries(JSON.parse(attr))) {
                            newEl.setAttribute(name, value + '');
                            this.log('Setting property %s to %s', name, value);
                        }
                    } catch (e) {
                        this.log(e);
                    }
                }

                this.log('Replacing %o with %o', el, newEl);

                parent?.replaceChild(newEl, el);

                this.trigger('serviceEmbeded', parent as HTMLElement, {
                    newEl: newEl,
                    service: serviceName,
                });
            });
        }
    }

    private trigger(name: string, el: HTMLElement, detail: Object | null): void {
        this.log('Trigger event %s on element %o', name, el);
        let event = new CustomEvent(name, {
            bubbles: true,
            cancelable: true,
            detail: detail || {},
        });
        el.dispatchEvent(event);
    }
}
