export type Tile = {
    letter: string | null;
    isLocked: boolean;
};

export type Arrow = {
    x: number;
    y: number;
    mode: "edit" | "select" | "hidden";
    direction: "horizontal" | "vertical";
};

export type Frame = {
    id: string;
    board: Tile[][];
    rack: string[];
    score: number;
    tileColor: string;
    playerImage?: string; // (optional)
    playDescription: string;
    transitionIn: Transition;
    transitionOut: Transition;
};

export interface Transition {
    type: "fade" | "slide" | "none";
    duration: number; // in seconds
    tileColor: string; // e.g. "orange"
}
