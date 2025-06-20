import { useEffect, useState, useCallback } from "react";
import GameBoard from "./GameBoard";
import type { Arrow, Frame } from "../types/Frame";
import { BOARD_SIZE } from "../lib/constants";

// Props passed from parent manager
interface BoardEditorProps {
    frame: Frame;
    updateFrame: (updated: Partial<Frame>) => void;
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
        (x: number, y: number, mode: Arrow["mode"], direction = arrow.direction) => {
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

            while (col >= 0 && col < BOARD_SIZE && row >= 0 && row < BOARD_SIZE) {
                if (!frame.board[row][col].isLocked) return [col, row];
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
            if (!newBoard[y][x].isLocked) {
                newBoard[y][x] = { letter: null, isLocked: false };
                moveArrow(x, y, "edit", direction);
            } else {
                const backCell = advance(x, y, direction, false, false);
                if (backCell) {
                    const [backX, backY] = backCell;
                    const nextMode = newBoard[backY][backX].letter ? "select" : "edit";
                    moveArrow(backX, backY, nextMode, direction);
                } else {
                    const fallbackX = direction === "horizontal" ? Math.max(x - 1, 0) : x;
                    const fallbackY = direction === "vertical" ? Math.max(y - 1, 0) : y;
                    moveArrow(fallbackX, fallbackY, "select", direction);
                }
            }
        } else if (mode === "edit") {
            const backCell = advance(x, y, direction, false, false);
            if (backCell) {
                const [backX, backY] = backCell;
                if (!newBoard[backY][backX].isLocked) {
                    newBoard[backY][backX] = { letter: null, isLocked: false };
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
                newBoard[row][col] = { letter, isLocked: false };

                const nextCell = advance(col, row, direction, false);
                if (nextCell) {
                    const [nextX, nextY] = nextCell;
                    const nextMode = newBoard[nextY][nextX].letter ? "select" : "edit";
                    moveArrow(nextX, nextY, nextMode, direction);
                } else {
                    moveArrow(col, row, "select", direction);
                }
            } else if (mode === "edit") {
                newBoard[y][x] = { letter, isLocked: false };

                const nextCell = advance(x, y, direction, false);
                if (nextCell) {
                    const [nextX, nextY] = nextCell;
                    const nextMode = newBoard[nextY][nextX].letter ? "select" : "edit";
                    moveArrow(nextX, nextY, nextMode, direction);
                } else {
                    moveArrow(x, y, "select", direction);
                }
            }

            updateFrame({ board: newBoard });
        },
        [arrow, advance, moveArrow, frame.board, updateFrame]
    );

    const handleKeydown = useCallback(
        (e: KeyboardEvent) => {
            const key = e.key;
            if (key === "Enter") {
                const updated = frame.board.map((row) =>
                    row.map((cell) =>
                        cell.letter && !cell.isLocked ? { ...cell, isLocked: true } : cell
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
            }
        },
        [arrow.mode, frame.board, updateFrame, handleDelete, handleLetterInput]
    );

    useEffect(() => {
        document.addEventListener("keydown", handleKeydown);
        return () => document.removeEventListener("keydown", handleKeydown);
    }, [handleKeydown]);

    return (
        <GameBoard board={frame.board} arrow={arrow} onCellClick={handleCellClick} />
    );
}
