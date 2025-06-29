export type TileState = "unlocked" | "locked" | "current";
export type DirectionState = "horizontal" | "vertical";
export type ArrowMode = "edit" | "select" | "hidden";

// Base Effect type
export type Effect =
  | { type: "play"; payload: PlayEffect }
  | { type: "highlight"; payload: HighlightEffect }
  | { type: "none"; payload: NoneEffect}
  // Add more effect types as needed

export interface PlayEffect {
  tiles: TilePlacement[]; // includes position + letter
}

export interface TilePlacement {
  x: number;
  y: number;
  letter: string;
}

export interface HighlightEffect {
  squares: { x: number; y: number }[];
}

// No-op effect
export type NoneEffect = {};





export type ChronologyType =
    | "consecutive"
    | "simultaneous";

export type AdditivityType =
    | "cumulative"
    | "temporary"

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
  effect: Effect;          // Stack of effects to apply in this frame
  transitionIn?: Transition;  // Optional entrance transition
  transitionOut?: Transition; // Optional exit transition
};

export type SequenceNode = {
    id: string; 
    chronologyType: ChronologyType;
    additivityType: AdditivityType;
    children: ScrabbleNode[];
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