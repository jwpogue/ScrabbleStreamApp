import type {
    Tile,
    Effect,
    FrameNode,
    SequenceNode,
    ScrabbleNode,
} from "../types/ScrabbleTypes";

import { generateEmptyBoard } from "./boardUtils";

// --- Type Guards ---

function isFrameNode(node: ScrabbleNode): node is FrameNode {
    return "effect" in node;
}

function isSequenceNode(node: ScrabbleNode): node is SequenceNode {
    return "children" in node;
}

// --- Flatten Tree ---

export function flattenFrames(node: ScrabbleNode): FrameNode[] {
    if (isFrameNode(node)) {
        return [node];
    }

    if (isSequenceNode(node)) {
        return node.children.flatMap(flattenFrames);
    }

    return [];
}

// --- Effect Application ---

export function applyEffect(board: Tile[][], effect: Effect): Tile[][] {
    const newBoard = board.map((row) => row.map((cell) => ({ ...cell })));

    switch (effect.type) {
        case "play":
            for (const [row, col] of effect.tiles) {
                newBoard[row][col].state = "locked";
            }
            break;

        case "highlight-tile": {
            const [row, col] = effect.position;
            newBoard[row][col].state = "current";
            break;
        }

        case "highlight-area":
            for (const [row, col] of effect.positions) {
                newBoard[row][col].state = "current";
            }
            break;

        case "show-potential-play":
            for (const [row, col] of effect.tiles) {
                newBoard[row][col].state = "unlocked";
            }
            break;
    }

    return newBoard;
}

// --- Board Preview ---

function computeBoardFromSequence(
    sequence: SequenceNode,
    board: Tile[][],
    frameTargetIndex: number,
    frameCounter: { count: number }
): Tile[][] {
    for (const child of sequence.children) {
        if (isFrameNode(child)) {
            if (frameCounter.count === frameTargetIndex) {
                return applyEffect(board, child.effect);
            }

            board = sequence.additivityType === "cumulative"
                ? applyEffect(board, child.effect)
                : generateEmptyBoard(board.length);

            frameCounter.count++;
        } else if (isSequenceNode(child)) {
            board = computeBoardFromSequence(
                child,
                board,
                frameTargetIndex,
                frameCounter
            );
            if (frameCounter.count > frameTargetIndex) {
                return board;
            }
        }
    }
    return board;
}

export function computeBoardAtFrame(
    root: SequenceNode,
    frameIndex: number,
    boardSize: number
): Tile[][] {
    const emptyBoard = generateEmptyBoard(boardSize);
    return computeBoardFromSequence(root, emptyBoard, frameIndex, { count: 0 });
}
