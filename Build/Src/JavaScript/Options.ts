
import { Position } from "./Types";

interface CookieLifetime {
    all: number
    reduced: number
}

interface Item {
    name: string
}

type ItemsMap = {
    [name: string]: Item
}

interface Element {
    required: boolean
    showOnLoad: boolean
    names: string
    items: ItemsMap
}

type ElementsMap = {
    [name: string]: Element
}

export interface SupiOptions {
    position: Position,
    theme: string,
    detailed: boolean
    cookieTTL: CookieLifetime
    elements: ElementsMap
}
