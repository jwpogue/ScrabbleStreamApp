export type TileState = "unlocked" | "locked" | "current";
export type DirectionState = "horizontal" | "vertical";
export type ArrowMode = "edit" | "select" | "hidden";

export type Effect =
    | { type: "highlight-area"; positions: [number, number][] }
    | { type: "highlight-tile"; position: [number, number] }
    | { type: "show-potential-play"; tiles: [number, number][] }
    | { type: "none" }; // for simple transition/no visual effect

export type SequenceType =
    | "consecutive-replacement"
    | "consecutive-additive"
    | "simultaneous";

export type Tile = {
    letter: string | null;
    state: TileState;
};

export type Arrow = {
    x: number;
    y: number;
    mode: ArrowMode;
    direction: DirectionState;
};

export type FrameNode = {
    id: string;
    effect: Effect;
    transitionIn?: Transition;
    transitionOut?: Transition;
    board: Tile[][];
};

export type SequenceNode = {
    id: string; 
    type: SequenceType;
    children: ScrabbleNode[];
    board: Tile[][]; // this is the end board, cached
};

export type ScrabbleNode = FrameNode | SequenceNode;


// export type Play = {
//     id: string;
//     moveTiles: [number, number, string][]; // (x, y, letter)
//     board: Tile[][]; // Result of applying move to previous play
//     rack: string[];
//     score: number;
//     tileColor: string;
//     playerImage?: string;
//     playDescription: string;
//     rootSequence: Sequence; // Default: "consecutive-replacement"
// };

export interface Transition {
    type: "fade" | "slide" | "none";
    duration: number; // seconds
    tileColor?: string; // optional override
}


export type Game = {
  id: string;
  title: string;
  rootSequence: SequenceNode;
  boardSize: number;
  tileColor?: string;
  // Add global properties like default transitions, theme, etc.
};