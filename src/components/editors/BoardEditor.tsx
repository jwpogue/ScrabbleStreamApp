import { useEffect, useState, useCallback } from "react";
import GameBoard from "../board/GameBoard";
import type { Arrow, FrameNode, TileState } from "../../types/ScrabbleTypes";
import { BOARD_SIZE } from "../../lib/boardUtils";

// Props passed from parent manager
interface BoardEditorProps {
    frame: FrameNode;
    updateFrame: (updated: Partial<FrameNode>) => void;
}

export default function BoardEditor({ frame, updateFrame }: BoardEditorProps) {
    const [arrow, setArrow] = useState<Arrow>({
        x: 0,
        y: 0,
        mode: "hidden",
        direction: "horizontal",
    });

    const handleCellClick = (row: number, col: number) => {
        const clickedCell = frame.board[row][col];

        setArrow((prev) => {
            const isSameCell = prev.x === col && prev.y === row;
            const isActive = prev.mode !== "hidden";

            if (isSameCell && isActive) {
                if (prev.direction === "horizontal") {
                    return { ...prev, direction: "vertical" };
                } else {
                    return { ...prev, mode: "hidden", direction: "horizontal" };
                }
            }

            const newMode = clickedCell.letter ? "select" : "edit";
            return {
                x: col,
                y: row,
                mode: newMode,
                direction: "horizontal",
            };
        });
    };

    const moveArrow = useCallback(
        (
            x: number,
            y: number,
            mode: Arrow["mode"],
            direction = arrow.direction
        ) => {
            setArrow({ x, y, mode, direction });
        },
        [arrow.direction]
    );

    const advance = useCallback(
        (
            startX: number,
            startY: number,
            direction: Arrow["direction"],
            inclusive: boolean,
            forward = true
        ): [number, number] | null => {
            let col = startX;
            let row = startY;

            if (!inclusive) {
                if (direction === "horizontal") col += forward ? 1 : -1;
                if (direction === "vertical") row += forward ? 1 : -1;
            }

            while (
                col >= 0 &&
                col < BOARD_SIZE &&
                row >= 0 &&
                row < BOARD_SIZE
            ) {
                if (frame.board[row][col].state === "unlocked")
                    return [col, row];
                if (direction === "horizontal") col += forward ? 1 : -1;
                if (direction === "vertical") row += forward ? 1 : -1;
            }
            return null;
        },
        [frame.board]
    );

    const handleDelete = useCallback(() => {
        const { x, y, mode, direction } = arrow;
        const newBoard = frame.board.map((r) => [...r]);

        if (mode === "select") {
            if (newBoard[y][x].state == "unlocked") {
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
                } else {
                    const fallbackX =
                        direction === "horizontal" ? Math.max(x - 1, 0) : x;
                    const fallbackY =
                        direction === "vertical" ? Math.max(y - 1, 0) : y;
                    moveArrow(fallbackX, fallbackY, "select", direction);
                }
            }
        } else if (mode === "edit") {
            const backCell = advance(x, y, direction, false, false);
            if (backCell) {
                const [backX, backY] = backCell;
                if (newBoard[backY][backX].state == "unlocked") {
                    newBoard[backY][backX] = {
                        letter: null,
                        state: "unlocked",
                    };
                    moveArrow(backX, backY, "edit", direction);
                }
            }
        }

        updateFrame({ board: newBoard });
    }, [arrow, advance, moveArrow, frame.board, updateFrame]);

    const handleLetterInput = useCallback(
        (letter: string) => {
            const { x, y, mode, direction } = arrow;
            const newBoard = frame.board.map((r) => [...r]);

            if (mode === "select") {
                const next = advance(x, y, direction, true);
                if (!next) return;

                const [col, row] = next;
                newBoard[row][col] = { letter, state: "unlocked" };

                const nextCell = advance(col, row, direction, false);
                if (nextCell) {
                    const [nextX, nextY] = nextCell;
                    const nextMode = newBoard[nextY][nextX].letter
                        ? "select"
                        : "edit";
                    moveArrow(nextX, nextY, nextMode, direction);
                } else {
                    moveArrow(col, row, "select", direction);
                }
            } else if (mode === "edit") {
                newBoard[y][x] = { letter, state: "unlocked" };

                const nextCell = advance(x, y, direction, false);
                if (nextCell) {
                    const [nextX, nextY] = nextCell;
                    const nextMode = newBoard[nextY][nextX].letter
                        ? "select"
                        : "edit";
                    moveArrow(nextX, nextY, nextMode, direction);
                } else {
                    moveArrow(x, y, "select", direction);
                }
            }

            updateFrame({ board: newBoard });
        },
        [arrow, advance, moveArrow, frame.board, updateFrame]
    );

    const handleSpecialKeys = useCallback(
        (keyDir: string) => {
            const { x, y, mode, direction } = arrow;
            const newBoard = frame.board.map((r) => [...r]);

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
                default:
                    return;
            }

            const target = newBoard[newY][newX];
            const newMode = target.letter ? "select" : "edit";

            setArrow({ x: newX, y: newY, mode: newMode, direction: newDir });
        },
        [arrow, frame.board]
    );

    const handleKeydown = useCallback(
        (e: KeyboardEvent) => {
            const key = e.key;
            if (key === "Enter") {
                const updated = frame.board.map((row) =>
                    row.map((cell) =>
                        cell.letter && cell.state == "unlocked"
                            ? { ...cell, state: "current" as TileState }
                            : cell
                    )
                );
                updateFrame({ board: updated });
                setArrow((prev) => ({ ...prev, mode: "hidden" }));
            } else if (arrow.mode === "hidden") {
                return;
            } else if (key === "Backspace" || key === "Delete") {
                handleDelete();
            } else if (/^[a-zA-Z]$/.test(key)) {
                handleLetterInput(key.toUpperCase());
            } else {
                handleSpecialKeys(key);
            }
        },
        [arrow.mode, frame.board, updateFrame, handleDelete, handleLetterInput]
    );

    useEffect(() => {
        document.addEventListener("keydown", handleKeydown);
        return () => document.removeEventListener("keydown", handleKeydown);
    }, [handleKeydown]);

    return (
        <GameBoard
            board={frame.board}
            arrow={arrow}
            onCellClick={handleCellClick}
        />
    );
}
