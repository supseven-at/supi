export enum Position {
    CenterCenter,
    BottomLeft,
}

export enum Status {
    None,
    All,
    Selected,
}

export enum Mode {
    All,
    Essential,
    Selected,
}

export type SupiElement = (HTMLElement & Node) | null;
