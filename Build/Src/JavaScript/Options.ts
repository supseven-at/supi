
import { Position } from "./Types";

interface CookieLifetime {
    all: number
    reduced: number
}

interface Item {
    names: string
    label: string | null
    service: string | null
}

interface Element {
    required: boolean
    showOnLoad: boolean
    names: string | null
    label: string | null
    items: {
        [name: string]: Item
    }
}

export interface SupiOptions {
    position: Position
    theme: string
    detailed: boolean
    cookieTTL: CookieLifetime
    elements: {
        [name: string]: Element
    }
    essentialIncludesYoutube: boolean
    essentialIncludesMaps: boolean
}
