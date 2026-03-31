import { SupiElement } from './Types';

/**
 * Finds a single element in the DOM or within a given scope.
 *
 * @param selector CSS selector string.
 * @param scope Optional scope (parent element) to search within.
 * @returns The first element matching the selector or null.
 */
export function findOne(selector: string, scope: SupiElement = null): SupiElement {
    return (scope || document).querySelector(selector) as SupiElement;
}

/**
 * Finds all elements matching the selector and returns them as an array.
 * Supports generics for better type safety when searching for specific elements like HTMLInputElement.
 *
 * @param selector CSS selector string.
 * @param scope Optional scope (parent element) to search within.
 * @returns An array of matched elements.
 */
export function findAll<T extends Element = HTMLElement>(selector: string, scope: SupiElement = null): T[] {
    return Array.from((scope || document).querySelectorAll(selector)) as T[];
}
