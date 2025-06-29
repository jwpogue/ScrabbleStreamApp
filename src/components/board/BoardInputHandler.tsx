import { useCallback, useEffect } from "react";
import type { Arrow, Tile, TileState } from "../../types/ScrabbleTypes";
import { BOARD_SIZE } from "../../lib/boardUtils";

interface Props {
    board: Tile[][];
    arrow: Arrow;
    setArrow: React.Dispatch<React.SetStateAction<Arrow>>;
    updateBoard: (b: Tile[][]) => void;
    onCellClickReady?: (handler: (row: number, col: number) => void) => void;
}

export default function BoardInputHandler({
    board,
    arrow,
    setArrow,
    updateBoard,
    onCellClickReady,
}: Props) {
    const advance = useCallback(
        (
            x: number,
            y: number,
            direction: Arrow["direction"],
            inclusive: boolean,
            forward = true
        ): [number, number] | null => {
            let col = x;
            let row = y;
            if (!inclusive) {
                direction === "horizontal"
                    ? (col += forward ? 1 : -1)
                    : (row += forward ? 1 : -1);
            }

            while (
                col >= 0 &&
                col < BOARD_SIZE &&
                row >= 0 &&
                row < BOARD_SIZE
            ) {
                if (board[row][col].state === "unlocked") return [col, row];
                direction === "horizontal"
                    ? (col += forward ? 1 : -1)
                    : (row += forward ? 1 : -1);
            }
            return null;
        },
        [board]
    );

    const moveArrow = useCallback(
        (
            x: number,
            y: number,
            mode: Arrow["mode"],
            direction = arrow.direction
        ) => {
            setArrow({ x, y, mode, direction });
        },
        [arrow.direction, setArrow]
    );

    useEffect(() => {
        if (!onCellClickReady) return;

        const handleCellClick = (row: number, col: number) => {
            const clickedCell = board[row][col];
            setArrow((prev) => {
                const isSame = prev.x === col && prev.y === row;
                const isActive = prev.mode !== "hidden";
                if (isSame && isActive) {
                    return prev.direction === "horizontal"
                        ? { ...prev, direction: "vertical" }
                        : { ...prev, mode: "hidden", direction: "horizontal" };
                }
                return {
                    x: col,
                    y: row,
                    direction: "horizontal",
                    mode: clickedCell.letter ? "select" : "edit",
                };
            });
        };

        onCellClickReady(handleCellClick);
    }, [board, setArrow, onCellClickReady]);
    const handleDelete = useCallback(() => {
        const { x, y, mode, direction } = arrow;
        const newBoard = board.map((r) => [...r]);

        if (mode === "select") {
            if (newBoard[y][x].state === "unlocked") {
                newBoard[y][x] = { letter: null, state: "unlocked" };
                moveArrow(x, y, "edit", direction);
            } else {
                const backCell = advance(x, y, direction, false, false);
                if (backCell) {
                    const [backX, backY] = backCell;
                    const nextMode = newBoard[backY][backX].letter
                        ? "select"
                        : "edit";
                    moveArrow(backX, backY, nextMode, direction);
                }
            }
        } else if (mode === "edit") {
            const backCell = advance(x, y, direction, false, false);
            if (backCell) {
                const [backX, backY] = backCell;
                if (newBoard[backY][backX].state === "unlocked") {
                    newBoard[backY][backX] = {
                        letter: null,
                        state: "unlocked",
                    };
                    moveArrow(backX, backY, "edit", direction);
                }
            }
        }

        updateBoard(newBoard);
    }, [arrow, board, advance, moveArrow, updateBoard]);

    const handleLetterInput = useCallback(
        (letter: string) => {
            const { x, y, mode, direction } = arrow;
            const newBoard = board.map((r) => [...r]);

            if (mode === "select" || mode === "edit") {
                const [col, row] =
                    mode === "select"
                        ? advance(x, y, direction, true) ?? [x, y]
                        : [x, y];
                newBoard[row][col] = { letter, state: "unlocked" };

                const nextCell = advance(col, row, direction, false);
                if (nextCell) {
                    const [nx, ny] = nextCell;
                    const nextMode = newBoard[ny][nx].letter
                        ? "select"
                        : "edit";
                    moveArrow(nx, ny, nextMode, direction);
                } else {
                    moveArrow(col, row, "select", direction);
                }

                updateBoard(newBoard);
            }
        },
        [arrow, board, advance, moveArrow, updateBoard]
    );

    const handleSpecialKeys = useCallback(
        (keyDir: string) => {
            const { x, y, mode, direction } = arrow;
            if (mode === "hidden") return;

            let newX = x;
            let newY = y;
            let newDir = direction;

            switch (keyDir) {
                case "ArrowDown":
                    newY = Math.min(y + 1, BOARD_SIZE - 1);
                    newDir = "vertical";
                    break;
                case "ArrowUp":
                    newY = Math.max(y - 1, 0);
                    newDir = "vertical";
                    break;
                case "ArrowRight":
                    newX = Math.min(x + 1, BOARD_SIZE - 1);
                    newDir = "horizontal";
                    break;
                case "ArrowLeft":
                    newX = Math.max(x - 1, 0);
                    newDir = "horizontal";
                    break;
            }

            const target = board[newY][newX];
            const newMode = target.letter ? "select" : "edit";
            setArrow({ x: newX, y: newY, mode: newMode, direction: newDir });
        },
        [arrow, board, setArrow]
    );

    const handleKeydown = useCallback(
        (e: KeyboardEvent) => {
            const key = e.key;
            if (key === "Enter") {
                const updated = board.map((row) =>
                    row.map((cell) =>
                        cell.letter && cell.state === "unlocked"
                            ? { ...cell, state: "current" as TileState }
                            : cell
                    )
                );
                updateBoard(updated);
                setArrow({ ...arrow, mode: "hidden" });
            } else if (arrow.mode !== "hidden") {
                if (key === "Backspace" || key === "Delete") handleDelete();
                else if (/^[a-zA-Z]$/.test(key))
                    handleLetterInput(key.toUpperCase());
                else handleSpecialKeys(key);
            }
        },
        [arrow.mode, board, handleDelete, handleLetterInput]
    );

    useEffect(() => {
        document.addEventListener("keydown", handleKeydown);
        return () => document.removeEventListener("keydown", handleKeydown);
    }, [handleKeydown]);

    return null; // This component doesn't render anything visual
}
