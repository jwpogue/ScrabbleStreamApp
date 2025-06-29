import CursorArrow from "./CursorArrow";
import type { Tile } from "../../types/ScrabbleTypes";
import type { Arrow } from "../../types/ScrabbleTypes";
import "./../../styles/GameBoard.css";

type GameBoardProps = {
    board: Tile[][];
    arrow?: Arrow;
    editable: boolean;
    onCellClick?: (row: number, col: number) => void;
};

export default function GameBoard({
    board,
    arrow,
    editable,
    onCellClick = () => {},
}: GameBoardProps) {
    return (
        <div className="board-grid">
            {board.map((row, rowIndex) =>
                row.map((cell, colIndex) => {
                    const isSelected =
                        editable &&
                        arrow &&
                        arrow.mode !== "hidden" &&
                        arrow.x === colIndex &&
                        arrow.y === rowIndex;

                    const isSelectMode = isSelected && arrow?.mode === "select";

                    return (
                        <div
                            key={`${rowIndex}-${colIndex}`}
                            className={`cell${isSelected ? " selected" : ""}${
                                isSelectMode ? " select-outline" : ""
                            }`}
                            onClick={() =>
                                editable && onCellClick(rowIndex, colIndex)
                            }
                        >
                            {cell.letter && (
                                <span className={cell.state}>
                                    {cell.letter}
                                </span>
                            )}
                            {isSelected && arrow?.mode === "edit" && (
                                <CursorArrow arrow={arrow} />
                            )}
                        </div>
                    );
                })
            )}
        </div>
    );
}
