import { SupiElement } from './Types';

export function findOne(selector: string, scope: SupiElement = null): SupiElement {
    return (scope || document).querySelector(selector) as SupiElement;
}

export function findAll<T extends Element = HTMLElement>(selector: string, scope: SupiElement = null): T[] {
    return Array.from((scope || document).querySelectorAll(selector)) as T[];
}
