
import { SupiElement } from "./Types";

export function findOne(selector: string, scope: SupiElement = null): SupiElement | null {
    return (scope || document).querySelector(selector)
}

export function findAll(selector: string, scope: SupiElement = null): Array<SupiElement> {
    return Array.from((scope || document).querySelectorAll(selector));
}
