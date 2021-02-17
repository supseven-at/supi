
export enum Position {
    Center,
    Bottom
}

export enum Status {
    None,
    All,
    Selected
}

export enum Mode {
    All,
    Essential,
    Selected
}

export type SupiElement = HTMLElement & Node | null;
