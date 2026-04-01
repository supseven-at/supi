import { Mode, Status, SupiElement } from './Types';
import { findAll, findOne } from './Dom';
import { SupiOptions } from './Options';
import { cookie } from './Cookie';
import { ConsoleLogger, Logger, NullLogger } from './Logger';

/**
 * Supseven User Privacy Interface Class
 *
 * Main controller for the GDPR-compliant consent banner.
 * Handles configuration parsing, service initialization, script injection,
 * and user interactions within the banner UI.
 */
export class Supi {
    private logger: Logger = new NullLogger();

    /** Main wrapper element (#supi) */
    private root: SupiElement = null;

    /** Button to dismiss the banner with essential settings only */
    private dismiss: SupiElement = null;

    /** Button to open the banner manually (e.g. from footer) */
    private choose: SupiElement = null;

    /** The native HTML <dialog> element for the banner */
    private banner: HTMLDialogElement | null = null;

    /** Internal cookie keys */
    private readonly cookieNameStatus = 'status';
    private readonly cookieNameAllowed = 'allowed';
    private readonly cookieNameYoutube = 'yt';
    private readonly cookieNameGoogleMaps = 'gmaps';

    /** Current configuration object */
    private config: SupiOptions = {} as SupiOptions;

    /** List of currently allowed/accepted service identifiers */
    private allowed: string[] = [];

    /** Button to save custom selections in detail view */
    private save: SupiElement = null;

    /** Default cookie lifetimes in days */
    private ttlAll = 30;
    private ttlReduced = 7;

    /** State flags for global consent */
    private allowAll = false;
    private allowYoutube = false;
    private allowMaps = false;

    /** List of all available service names found in config */
    private services: string[] = [];

    /**
     * Constructor initializes the banner by:
     * 1. Finding required DOM elements
     * 2. Parsing JSON configuration from data-attributes
     * 3. Initializing the logger and services
     * 4. Restoring consent state from cookies
     */
    constructor() {
        this.root = findOne('#supi');

        if (!this.root) {
            return;
        }

        this.initElements();
        this.initOptions();
        this.initLogger();
        this.initServices();
        this.initConsentStatus();

        this.preventClosingDialogOnEscape();
        this.addHandlers();
        this.setDetailDefaults();

        this.toggleAllServices();

        // Delay initial event to allow other scripts to register listeners
        setTimeout(() => {
            this.trigger('supiInitEnd', document.body, {});
        }, 180);
    }

    /**
     * Maps internal UI variables to their respective DOM elements.
     */
    private initElements(): void {
        this.dismiss = findOne('[data-toggle=dismiss]', this.root);
        this.choose = findOne('#supi__choose');
        this.banner = findOne('#supi__banner') as HTMLDialogElement;
        this.save = findOne('[data-toggle=save]', this.root);
    }

    /**
     * Parses the JSON configuration provided by the TYPO3 backend.
     * Sets TTL values and cookie domains accordingly.
     */
    private initOptions(): void {
        const configSrc = this.root?.getAttribute('data-supi-config');
        if (configSrc) {
            try {
                this.config = JSON.parse(configSrc) as SupiOptions;
            } catch (e) {
                console.error('Supi: Failed to parse config', e);
                this.config = {} as SupiOptions;
            }
        }

        this.ttlReduced = this.config?.cookieTTL?.reduced ?? this.ttlReduced;
        this.ttlAll = this.config?.cookieTTL?.all ?? this.ttlAll;

        if (this.config.cookieDomain) {
            cookie.useDomain(this.config.cookieDomain);
        }
    }

    /**
     * Initializes the logger. Enables ConsoleLogger if a specific debug class
     * is found on the body element.
     */
    private initLogger(): void {
        this.logger = document.body.classList.contains(this.config?.debugClass ?? 'develop')
            ? new ConsoleLogger()
            : new NullLogger();

        this.logger.info('Loaded config %o', this.config);
    }

    /**
     * Collects all services defined in the configuration and
     * automatically adds 'essential' services to the allowed list.
     */
    private initServices(): void {
        const data = cookie.get<string[]>(this.cookieNameAllowed);

        if (Array.isArray(data) && data.length) {
            this.allowed = data;
        }

        const essentialNames = this.config?.elements?.essential?.names?.split(',') ?? [];
        essentialNames.forEach((name) => {
            const trimmed = name.trim();
            if (trimmed && !this.allowed.includes(trimmed)) {
                this.allowed.push(trimmed);
            }
        });

        for (const element of Object.values(this.config.elements || {})) {
            for (const item of Object.values(element.items || {})) {
                const serviceName = item?.service;
                if (serviceName) {
                    this.services.push(serviceName);
                }
            }
        }

        this.trigger('supiInitStart', document.body, {});
        this.logger.info('Collected services %o', this.services);
    }

    /**
     * Restores the consent status from previous sessions.
     * If no status is set, it might show the banner overlay.
     */
    private initConsentStatus(): void {
        const status = cookie.get<Status>(this.cookieNameStatus);

        if (status === Status.All || status === Status.Selected) {
            this.allowAll = status === Status.All;
            this.injectJavaScripts();
            this.updateCookieTTL();
            this.removeNotAllowedCookies();
        } else if (!cookie.has(this.cookieNameStatus)) {
            cookie.remove(this.cookieNameStatus);

            if (findOne('[data-hide-overlay="1"]')) {
                this.logger.info('Hides the Banner-Overlay due to the given Setting "hideOverlayOnButtonCe"');
            } else {
                this.toggleBanner();
            }
        }

        this.initExternalServicesStatus(status);
        this.updateGoogleConsentMode();
    }

    /**
     * Updates Google Consent Mode v2 flags based on the current consent state.
     * Maps the 'marketing' category to Google's consent flags.
     */
    private updateGoogleConsentMode(): void {
        // @ts-ignore
        if (typeof window.gtag !== 'function') {
            return;
        }

        const isMarketingAllowed = this.allowAll || this.isCategoryAllowed('marketing');
        const isAnalyticsAllowed =
            isMarketingAllowed || this.isCategoryAllowed('analytics') || this.isCategoryAllowed('statistics');

        const consent = {
            ad_storage: isMarketingAllowed ? 'granted' : 'denied',
            ad_user_data: isMarketingAllowed ? 'granted' : 'denied',
            ad_personalization: isMarketingAllowed ? 'granted' : 'denied',
            analytics_storage: isAnalyticsAllowed ? 'granted' : 'denied',
        };

        this.logger.info('Updating Google Consent Mode: %o', consent);
        // @ts-ignore
        window.gtag('consent', 'update', consent);
    }

    /**
     * Helper to check if a specific category (e.g. 'marketing') is currently allowed.
     */
    private isCategoryAllowed(category: string): boolean {
        const element = this.config.elements[category];
        if (!element) {
            return false;
        }

        const names = element.names?.split(',') ?? [];
        return names.every((name) => this.allowed.includes(name.trim()));
    }

    /**
     * Handles specialized status for major external services like YouTube and Google Maps.
     */
    private initExternalServicesStatus(status: Status | null): void {
        this.allowYoutube =
            cookie.get<string>(this.cookieNameYoutube) === 'y' ||
            this.allowAll ||
            (status === Status.Selected && !!this.config?.essentialIncludesYoutube);

        this.logger.info('Checking YouTube status: %o', this.allowYoutube);
        this.enableYoutubeVideos();

        this.allowMaps =
            cookie.get<string>(this.cookieNameGoogleMaps) === 'y' ||
            this.allowAll ||
            (status === Status.Selected && !!this.config?.essentialIncludesMaps);

        this.logger.info('Checking Google Maps status: %o', this.allowMaps);
        this.enableMaps();
    }

    /**
     * Master handler for all UI interactions.
     */
    private addHandlers(): void {
        this.addBannerActionHandlers();
        this.addToggleHandlers();
        this.addExternalServiceHandlers();
    }

    /**
     * Registers click events for primary banner buttons (Allow All, Dismiss, Save).
     */
    private addBannerActionHandlers(): void {
        findAll('[data-toggle=allow]', this.root).forEach((el) => {
            el.addEventListener('click', (e) => {
                this.logger.info('Allow all clicked');
                this.allowAll = true;
                this.allowMaps = true;
                this.allowYoutube = true;

                this.collectAllowed(Mode.All);
                this.removeScripts();

                if (this.injectJavaScripts()) {
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

        this.dismiss?.addEventListener('click', (e) => {
            this.logger.info('Dismiss clicked');
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

            if (this.removeScripts()) {
                this.toggleBanner();
                cookie.set(this.cookieNameStatus, Status.Selected);
            }

            this.toggleAllServices();
            this.setDetailDefaults();
            this.removeNotAllowedCookies();
            e.preventDefault();
        });

        this.save?.addEventListener('click', (e) => {
            this.logger.info('Save selection clicked');
            this.allowAll = false;
            this.collectAllowed(Mode.Selected);
            this.removeScripts();

            if (this.injectJavaScripts()) {
                this.toggleBanner();
                cookie.set(this.cookieNameStatus, Status.Selected);
            }

            this.toggleAllServices();
            this.removeNotAllowedCookies();
            e.preventDefault();
        });

        this.choose?.addEventListener('click', (e) => {
            e.preventDefault();
            this.toggleBanner();
        });

        findAll('a[href="#supi-choose"], button[href="#supi-choose"]').forEach((el) => {
            el.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleBanner();
            });
        });
    }

    /**
     * Handles view switching (overview vs detail) and checkbox group logic (select all in category).
     */
    private addToggleHandlers(): void {
        // Switch between overview and detail view
        findAll('[data-toggle=switch]').forEach((el) => {
            const from = findOne(el.dataset.switchFrom ?? '');
            const to = findOne(el.dataset.switchTo ?? '');

            if (from && to) {
                el.addEventListener('click', (e) => {
                    from.classList.add('tx-supi__pane-hidden');
                    from.setAttribute('hidden', '');
                    to.classList.remove('tx-supi__pane-hidden');
                    to.removeAttribute('hidden');

                    if (el.dataset.inputs === 'disable' && this.allowed.length < 1) {
                        findAll<HTMLInputElement>('input[type=checkbox]').forEach((cb) => {
                            cb.checked = cb.disabled || !!cb.dataset.required;
                        });
                    }
                    e.preventDefault();
                });
            }
        });

        // Checkbox group logic
        findAll<HTMLInputElement>('input[data-supi-block]').forEach((el) => {
            if (el.disabled) return;

            el.addEventListener('click', (e) => {
                const blockId = el.dataset.supiBlock;
                if (el.dataset.supiParent) {
                    findAll<HTMLInputElement>(`[data-supi-block="${blockId}"]`).forEach((child) => {
                        if (!child.dataset.supiParent) {
                            child.checked = el.checked;
                        }
                    });
                } else {
                    const parent = findOne(`[data-supi-parent="${blockId}"]`) as HTMLInputElement;
                    const children = findAll<HTMLInputElement>(`[data-supi-block="${blockId}"]`).filter(
                        (c) => !!c.dataset.supiItem,
                    );

                    if (parent && children.length) {
                        parent.checked = children.every((c) => c.checked);
                    }
                }
                e.stopPropagation();
            });
        });
    }

    /**
     * Registers click handlers for 'Enable once' and 'Enable always' on
     * specific content blocks (YouTube previews, Map placeholders).
     */
    private addExternalServiceHandlers(): void {
        // YouTube
        findAll('.tx-supi__youtube').forEach((el) => {
            el.querySelector('[data-toggle=youtube]')?.addEventListener('click', () => {
                cookie.set(this.cookieNameYoutube, 'y');
                this.toggleYoutubeVideos(el);
            });

            el.querySelector('[data-toggle=youtube-once]')?.addEventListener('click', () => {
                this.toggleYoutubeVideos(el, true);
            });
        });

        // Google Maps
        findAll('.tx_supi__map').forEach((wrapper) => {
            wrapper.querySelector('[data-toggle=map]')?.addEventListener('click', () => {
                this.allowMaps = true;
                cookie.set(this.cookieNameGoogleMaps, 'y');
                this.enableMaps();
            });
        });

        // Simple Maps
        findAll('.tx-supi__simpleMaps').forEach((el) => {
            el.querySelector('[data-toggle=simpleMaps]')?.addEventListener('click', () => {
                cookie.set(this.cookieNameGoogleMaps, 'y');
                this.toggleSimpleMaps(el);
            });

            el.querySelector('[data-toggle=simpleMaps-once]')?.addEventListener('click', () => {
                this.toggleSimpleMaps(el, true);
            });
        });

        // Custom Service Containers
        findAll('[data-supi-service-container]').forEach((el) => {
            const serviceName = el.dataset.supiServiceContainer;
            if (serviceName) {
                el.querySelector('[data-toggle=supiServiceContainer]')?.addEventListener('click', () => {
                    cookie.set(serviceName, 'y');
                    this.toggleService(serviceName);
                });
            }
        });
    }

    /**
     * Finds <script type="application/supi"> templates and replaces them with
     * real <script> tags if the required consent has been given.
     *
     * @returns Always true to indicate processing finished.
     */
    public injectJavaScripts(): boolean {
        findAll<HTMLScriptElement>('script')
            .filter((el) => el.type === 'application/supi')
            .filter((el) => {
                const cookies = el.dataset.supiCookies?.split(',') ?? [];
                return this.allowAll || !!el.dataset.supiRequired || cookies.some((c) => this.allowed.includes(c));
            })
            .forEach((template) => {
                const script = document.createElement('script');
                script.className = 'supi-scripts';
                if (template.dataset.type) script.type = template.dataset.type;
                script.dataset.supiCookies = template.dataset.supiCookies;
                script.innerHTML = template.innerHTML;

                template.replaceWith(script);
                this.trigger('injectScript', script, null);
            });

        return true;
    }

    /**
     * Toggles the visibility of the native banner dialog.
     * Also updates all toggle switches within the banner to match the current state.
     */
    public toggleBanner(): void {
        if (!this.banner || typeof this.banner.showModal !== 'function') {
            this.logger.error('Banner element not found or browser support missing.');
            return;
        }

        if (this.banner.open) {
            this.banner.close();
            this.trigger('bannerHide', this.banner, null);
        } else {
            try {
                this.banner.showModal();
                this.trigger('bannerShow', this.banner, null);
            } catch (e) {
                this.logger.error('Failed to show banner: %o', e);
            }
        }

        this.updateTogglesInBanner();
    }

    /**
     * Synchronizes the checked state of all checkboxes in the banner with the
     * internal consent flags (YouTube, Maps, custom services).
     */
    private updateTogglesInBanner(): void {
        let allowAllServices = true;

        const mapsToggle = findOne('[data-supi-service=googleMaps]', this.root) as HTMLInputElement;
        if (mapsToggle) {
            mapsToggle.checked = this.allowMaps;
            allowAllServices &&= this.allowMaps;
        }

        const youtubeToggle = findOne('[data-supi-service=youtube]', this.root) as HTMLInputElement;
        if (youtubeToggle) {
            youtubeToggle.checked = this.allowYoutube;
            allowAllServices &&= this.allowYoutube;
        }

        findAll<HTMLInputElement>('[data-supi-service]', this.root).forEach((el) => {
            if (!el.dataset.supiParent && !['youtube', 'googleMaps'].includes(el.dataset.supiService ?? '')) {
                const allowed = this.allowAll || cookie.get(el.dataset.supiService ?? '') === 'y';
                el.checked = allowed;
                allowAllServices &&= allowed;
            }
        });

        const mediaToggle = findOne('[data-supi-parent=media]', this.root) as HTMLInputElement;
        if (mediaToggle) {
            mediaToggle.checked = allowAllServices;
        }
    }

    /**
     * Reverts all previously injected scripts back to templates.
     * Useful when the user changes consent mid-session.
     *
     * @returns Always true.
     */
    public removeScripts(): boolean {
        findAll<HTMLScriptElement>('.supi-scripts').forEach((script) => {
            const template = document.createElement('script');
            template.type = 'application/supi';
            template.dataset.supiCookies = script.dataset.supiCookies;
            if (script.hasAttribute('type')) {
                template.dataset.type = script.getAttribute('type') ?? '';
            }
            template.innerHTML = script.innerHTML;

            script.replaceWith(template);
        });

        return true;
    }

    /**
     * Calculates the list of allowed cookie names based on the selected mode.
     *
     * @param mode All, Essential, or Selected.
     * @returns True if the selection is identical to the previous one.
     */
    private collectAllowed(mode: Mode = Mode.Essential): boolean {
        const old = this.allowed.sort().join();
        this.allowed = [];

        switch (mode) {
            case Mode.All:
                this.trigger('allowAll', document.body, null);
                for (const element of Object.values(this.config.elements)) {
                    element.names?.split(',').forEach((name) => {
                        const trimmed = name.trim();
                        if (trimmed && !this.allowed.includes(trimmed)) this.allowed.push(trimmed);
                    });
                }
                break;

            case Mode.Essential:
                this.trigger('allowEssential', document.body, null);
                this.setExternalConsent(false);
                for (const element of Object.values(this.config.elements || {})) {
                    if (element.required) {
                        element.names?.split(',').forEach((name) => {
                            const trimmed = name.trim();
                            if (trimmed && !this.allowed.includes(trimmed)) this.allowed.push(trimmed);
                        });
                    }
                }
                break;

            case Mode.Selected:
                this.trigger('allowSelected', document.body, null);
                this.setExternalConsent(false);
                findAll<HTMLInputElement>('input[type=checkbox]', this.root)
                    .filter((el) => el.checked || !!parseInt(el.dataset.supiRequired ?? '0'))
                    .forEach((el) => {
                        const serviceName = el.dataset.supiService;
                        if (serviceName) {
                            switch (serviceName) {
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
                                    cookie.set(serviceName, 'y');
                                    this.toggleAllServices();
                            }
                        } else {
                            el.value.split(',').forEach((val) => {
                                const trimmed = val.trim();
                                if (trimmed && !this.allowed.includes(trimmed)) this.allowed.push(trimmed);
                            });
                        }
                    });
                break;
        }

        cookie.set(this.cookieNameAllowed, this.allowed);
        this.updateGoogleConsentMode();
        return this.allowed.sort().join() === old;
    }

    /**
     * Helper to set consent flags for major external services.
     */
    private setExternalConsent(allowed: boolean): void {
        const val = allowed ? 'y' : 'n';
        cookie.set(this.cookieNameGoogleMaps, val);
        cookie.set(this.cookieNameYoutube, val);
        this.allowMaps = allowed;
        this.allowYoutube = allowed;
        this.services.forEach((s) => cookie.set(s, val));
    }

    /**
     * Removes all cookies from the browser that are not in the 'allowed' list.
     */
    private removeNotAllowedCookies(): void {
        this.logger.info('Purging not allowed cookies. Allowed: %o', this.allowed);
        cookie.getCookieNames().forEach((name) => {
            if (!this.allowAll && !this.allowed.includes(name)) {
                this.logger.info('Removing cookie: %s', name);
                cookie.purgeCookie(name);
                this.trigger('cookieDeleted', document.body, { name });
            }
        });
        cookie.set(this.cookieNameAllowed, this.allowed);
    }

    /**
     * Initializes the checkbox states in the detail view based on current consent.
     */
    private setDetailDefaults(): void {
        findAll<HTMLInputElement>('input[data-supi-parent]').forEach((parent) => {
            const blockId = parent.dataset.supiParent;
            const items = findAll<HTMLInputElement>(`input[data-supi-block="${blockId}"][data-supi-item]`);

            if (items.length) {
                items.forEach((item) => {
                    item.checked =
                        item.disabled ||
                        this.allowAll ||
                        item.value.split(',').every((val) => this.allowed.includes(val.trim()));
                });
                parent.checked = items.every((item) => item.checked);
            } else {
                parent.checked =
                    parent.disabled ||
                    this.allowAll ||
                    parent.value.split(',').every((val) => {
                        const trimmed = val.trim();
                        return !trimmed || this.allowed.includes(trimmed);
                    });
            }
        });
    }

    /**
     * Finds all YouTube preview elements and replaces them with iframes if allowed.
     */
    private enableYoutubeVideos(): void {
        if (this.allowYoutube) {
            this.trigger('youTubeAllowedGlobal', document.documentElement, {});
            findAll('.tx-supi__youtube').forEach((el) => this.addVideo(el, ''));
        }
    }

    /**
     * Specialized toggler for YouTube. Supports 'once' mode which doesn't persist the choice.
     */
    private toggleYoutubeVideos(autoplayEl: HTMLElement, once = false): void {
        this.allowYoutube = true;
        this.addVideo(autoplayEl, '&autoplay=1&mute=1');

        if (!once) {
            cookie.set(this.cookieNameYoutube, 'y');
            this.enableYoutubeVideos();
        } else {
            this.allowYoutube = false;
        }
    }

    /**
     * Replaces a preview element with a YouTube iframe.
     */
    private addVideo(el: HTMLElement, params: string): void {
        if (!this.allowYoutube) return;

        const size = el.querySelector('.tx-supi__youtube-preview-image')?.getBoundingClientRect();
        const youtubeId = el.dataset.youtubeId;
        const iframe = document.createElement('iframe');

        iframe.src = `https://www.youtube-nocookie.com/embed/${youtubeId}?rel=0&modestbranding=1${params}`;
        iframe.frameBorder = '0';
        iframe.style.border = '0';
        if (size) {
            iframe.width = `${size.width}`;
            iframe.height = `${size.height}`;
        }
        iframe.setAttribute('autoplay', 'true');
        iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');

        el.replaceWith(iframe);
        this.trigger('youTubeAllowed', iframe, { iframe, dataset: el.dataset });
    }

    /**
     * Initializes Google Maps placeholders. Supports custom callback functions
     * for specialized map implementations (e.g. Leaflet, OpenLayers).
     */
    private enableMaps(): void {
        if (!this.allowMaps) return;

        findAll('.tx_supi__map').forEach((wrapper) => {
            const toggle = wrapper.querySelector('[data-toggle=map]') as HTMLElement;
            if (toggle?.dataset.callback) {
                wrapper.classList.add('active');
                // @ts-ignore
                window[toggle.dataset.callback]();
                this.trigger('customMapAllowed', wrapper, { wrapper, callback: toggle.dataset.callback });
            }
        });
        this.enableSimpleMaps();
    }

    /**
     * Finds all simple iframe map placeholders and replaces them.
     */
    private enableSimpleMaps(): void {
        if (this.allowMaps) {
            findAll('.tx-supi__simpleMaps').forEach((el) => this.addSimpleMap(el));
        }
    }

    /**
     * Specialized toggler for Google Maps.
     */
    private toggleSimpleMaps(el: HTMLElement, once = false): void {
        this.allowMaps = true;
        this.addSimpleMap(el);

        if (!once) {
            cookie.set(this.cookieNameGoogleMaps, 'y');
            this.enableSimpleMaps();
        } else {
            this.allowMaps = false;
        }
    }

    /**
     * Replaces a map placeholder with a Google Maps iframe.
     */
    private addSimpleMap(el: HTMLElement): void {
        if (!this.allowMaps) return;

        const { mapAddress: address, mapZoom: zoom = '15' } = el.dataset;
        const iframe = document.createElement('iframe');

        iframe.src = `https://maps.google.com/maps?q=${address}&t=&z=${zoom}&ie=UTF8&iwloc=&output=embed`;
        iframe.frameBorder = '0';
        iframe.style.border = '0';
        iframe.width = '800';
        iframe.height = '600';

        el.replaceWith(iframe);
        this.trigger('simpleMapAllowed', iframe, { iframe, data: el.dataset });
    }

    /**
     * Generic toggler for custom services defined via data-supi-service-container.
     * Supports 'callback', 'script', 'img', and 'iframe' types.
     */
    private toggleService(name: string): void {
        if (cookie.get(name) !== 'y' && !this.allowAll) return;

        findAll(`[data-supi-service-container="${name}"]`).forEach((el) => {
            const parent = el.parentElement as HTMLElement;
            if (el.dataset.supiServiceType === 'callback') {
                const func = el.dataset.supiServiceCallback;
                if (!func) return;
                setTimeout(() => {
                    try {
                        // @ts-ignore
                        window[func](el);
                        this.trigger('serviceCallback', parent, { service: name });
                    } catch (e) {
                        this.logger.error('Callback error: %o', e);
                    }
                }, 10);
                return;
            }

            let newEl: HTMLElement;
            switch (el.dataset.supiServiceType) {
                case 'script':
                    newEl = document.createElement('script');
                    (newEl as HTMLScriptElement).async = true;
                    (newEl as HTMLScriptElement).defer = true;
                    break;
                case 'img':
                    newEl = document.createElement('img');
                    (newEl as HTMLImageElement).alt = '';
                    break;
                default:
                    newEl = document.createElement('iframe');
                    (newEl as HTMLIFrameElement).frameBorder = '0';
                    (newEl as HTMLIFrameElement).referrerPolicy = 'no-referrer';
            }

            if (el.dataset.supiServiceAttr) {
                try {
                    Object.entries(JSON.parse(el.dataset.supiServiceAttr)).forEach(([k, v]) => {
                        newEl.setAttribute(k, String(v));
                    });
                } catch (e) {
                    this.logger.error('Attr parse error: %o', e);
                }
            }

            el.replaceWith(newEl);
            this.trigger('serviceEmbeded', parent, { newEl, service: name });
        });
    }

    /**
     * Triggers all active service containers.
     */
    private toggleAllServices(): void {
        this.services.forEach((s) => this.toggleService(s));
    }

    /**
     * Updates the TTL of the 'supi' cookie based on the user's choices.
     */
    private updateCookieTTL(): void {
        cookie.setLifetime(this.allowAll ? this.ttlAll : this.ttlReduced);
    }

    /**
     * Prevents the banner from being closed by the Escape key or Backdrop clicks
     * to ensure the user makes an explicit choice.
     */
    private preventClosingDialogOnEscape(): void {
        if (this.banner) {
            this.banner.addEventListener('cancel', (e) => e.preventDefault());
            this.banner.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') e.preventDefault();
            });
        }
    }

    /**
     * Helper to dispatch custom events.
     * Enriches every event with current consent state details.
     */
    private trigger(name: string, el: HTMLElement, detail: Record<string, unknown> | null): void {
        el.dispatchEvent(
            new CustomEvent(name, {
                bubbles: true,
                cancelable: true,
                detail: this.addDetailsForEvents(detail),
            }),
        );
    }

    /**
     * Collects current consent state flags to be included in event payloads.
     */
    private addDetailsForEvents(detail: Record<string, unknown> | null): Record<string, unknown> {
        const result = { ...(detail ?? {}) };
        findAll('[data-supi-service-container]').forEach((e) => {
            const serviceName = e.dataset.supiServiceContainer;
            if (serviceName) {
                const val = cookie.get(serviceName);
                if (val) result[serviceName] = this.allowAll ? 'y' : val;
            }
        });
        return { ...result, allowAll: this.allowAll, allowMaps: this.allowMaps, allowYoutube: this.allowYoutube };
    }
}
