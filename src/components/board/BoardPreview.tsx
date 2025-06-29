import React from "react";
import GameBoard from "./GameBoard";
import type { Tile } from "../../types/ScrabbleTypes";
import "../../styles/BoardPreview.css";

type BoardPreviewProps = {
  board: Tile[][];
  onClose: () => void;
};

export default function BoardPreview({ board, onClose }: BoardPreviewProps) {
  return (
    <div className="board-preview-overlay">
      <div className="preview-background" onClick={onClose} />
      <div className="preview-modal">
        <h3>Board Preview</h3>
        <GameBoard board={board} editable={false} onCellClick={() => {}} />
        <button className="close-button" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}