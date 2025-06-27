import type { Tile } from "../types/ScrabbleTypes";

// Constants
export const BOARD_SIZE = 15;

// 1. Generate an empty board
export function generateEmptyBoard(size: number = BOARD_SIZE): Tile[][] {
    return Array.from({ length: size }, () =>
        Array.from({ length: size }, () => ({
            letter: null,
            state: "unlocked",
        }))
    );
}

// 2. Deep clone a board
export function cloneBoard(board: Tile[][]): Tile[][] {
    return board.map((row) =>
        row.map((cell) => ({
            letter: cell.letter,
            state: cell.state,
        }))
    );
}

// 3. Compute the difference between two boards
export function diffBoards(
    oldBoard: Tile[][],
    newBoard: Tile[][]
): [number, number, string | null][] {
    const diffs: [number, number, string | null][] = [];

    for (let y = 0; y < oldBoard.length; y++) {
        for (let x = 0; x < oldBoard[y].length; x++) {
            const oldTile = oldBoard[y][x];
            const newTile = newBoard[y][x];

            if (oldTile.letter !== newTile.letter) {
                diffs.push([x, y, newTile.letter]);
            }
        }
    }

    return diffs;
}
