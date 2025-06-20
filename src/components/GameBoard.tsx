import CursorArrow from "./CursorArrow";
import type { Tile } from "../types/Frame";
import type { Arrow } from "../types/Frame";
import "./GameBoard.css";

type GameBoardProps = {
    board: Tile[][];
    arrow: Arrow;
    onCellClick: (row: number, col: number) => void;
};

export default function GameBoard({ board, arrow, onCellClick }: GameBoardProps) {
    return (
        <div className="board-grid">
            {board.map((row, rowIndex) =>
                row.map((cell, colIndex) => {
                    const isSelected =
                        arrow.mode !== "hidden" &&
                        arrow.x === colIndex &&
                        arrow.y === rowIndex;

                    const isSelectMode = isSelected && arrow.mode === "select";

                    return (
                        <div
                            key={`${rowIndex}-${colIndex}`}
                            className={`cell${isSelected ? " selected" : ""}${isSelectMode ? " select-outline" : ""}`}
                            onClick={() => onCellClick(rowIndex, colIndex)}
                        >
                            {cell.letter && (
                                <span className={cell.isLocked ? "locked" : "unlocked"}>
                                    {cell.letter}
                                </span>
                            )}
                            {isSelected && arrow.mode === "edit" && (
                                <CursorArrow arrow={arrow} />
                            )}
                        </div>
                    );
                })
            )}
        </div>
    );
}
