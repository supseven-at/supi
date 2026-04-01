/**
 * Configuration for the cookie lifetime per consent state.
 */
interface CookieLifetime {
    all: number; // TTL in days when all cookies are accepted.
    reduced: number; // TTL in days when only essential or selected cookies are accepted.
}

/**
 * A single service item configuration.
 */
interface Item {
    names: string; // Internal cookie names.
    label: string | null; // User-facing label.
    service: string | null; // Associated service identifier.
}

/**
 * Configuration for a block of services (e.g., 'Marketing', 'Essential').
 */
interface Element {
    required: boolean; // If true, the user cannot deselect this block.
    showOnLoad: boolean; // If the block should be expanded initially.
    names: string | null; // Comma-separated list of cookie names.
    label: string | null; // User-facing category label.
    items: {
        [name: string]: Item;
    };
}

/**
 * Root configuration for the Supi Consent Banner.
 * Usually provided via a data-attribute on the #supi root element.
 */
export interface SupiOptions {
    theme: string; // Theme identifier for styling.
    detailed: boolean; // If the detail view is enabled.
    cookieTTL: CookieLifetime; // TTL settings for cookies.
    cookieDomain: string; // Domain for cookie storage.
    elements: {
        [name: string]: Element; // Categories of cookies/services.
    };
    essentialIncludesYoutube: boolean; // If YouTube is considered essential (legal shortcut).
    essentialIncludesMaps: boolean; // If Google Maps is considered essential.
    debugClass: string | null; // CSS class on body to enable debug logging.
}
