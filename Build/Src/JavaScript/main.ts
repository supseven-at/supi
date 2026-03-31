import { Supi } from './Supi';

/**
 * Entry point for the Supseven User Privacy Interface (Supi).
 * Initializes the Supi instance once the page has fully loaded.
 */
const initFunc = () => {
    // Provide instance on window for external API access or debugging
    (window as any).supi = new Supi();

    // Clean up event listener after successful initialization
    window.removeEventListener('load', initFunc);
};

// Register load event to ensure all DOM elements are available
window.addEventListener('load', initFunc);
