/**
 * The status indicates how the user interacted with the banner.
 */
export enum Status {
    None, // Initial state, no choice made yet.
    All, // User accepted all cookies and services.
    Selected, // User made a custom selection of services.
}

/**
 * Consent modes for internal logic and event handling.
 */
export enum Mode {
    All, // Everything is allowed.
    Essential, // Only technically required services are allowed.
    Selected, // Custom selection from the detail view.
}

/**
 * Represents a DOM element managed by the Supi interface.
 * Can be null if the element was not found in the current page context.
 */
export type SupiElement = (HTMLElement & Node) | null;
