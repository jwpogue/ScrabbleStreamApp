// import React from "react";
import type { Frame } from "../types/Frame";
import "./FrameList.css";

type FrameListProps = {
  frames: Frame[];
  currentFrameIndex: number;
  onSelect: (index: number) => void;
  onAddFrame: () => void;
  onDeleteFrame: (index: number) => void;
};

export default function FrameList({
  frames,
  currentFrameIndex,
  onSelect,
  onAddFrame,
  onDeleteFrame,
}: FrameListProps) {
  return (
    <div className="frame-list">
      <h3>Frames:</h3>
      <ul>
        {frames.map((frame, index) => (
          <li
            key={frame.id}
            className={`frame-item ${index === currentFrameIndex ? "selected" : ""}`}
            onClick={() => onSelect(index)}
          >
            <span>Frame {index + 1}</span>
            <button
              className="delete-button"
              onClick={(e) => {
                e.stopPropagation(); // Don't select frame when clicking delete
                onDeleteFrame(index);
              }}
            >
              ✕
            </button>
          </li>
        ))}
      </ul>
      <button onClick={onAddFrame} className="add-frame-button">+ Add Frame</button>
    </div>
  );
}
