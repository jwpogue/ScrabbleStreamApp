import { useState } from "react";
import FrameList from "./FrameList";
import BoardEditor from "./BoardEditor";
import type { Frame } from "../types/Frame";
import { BOARD_SIZE } from "../lib/constants";
import { v4 as uuidv4 } from "uuid";

// Generate an empty board
function createEmptyBoard(): Frame["board"] {
  return Array.from({ length: BOARD_SIZE }, () =>
    Array.from({ length: BOARD_SIZE }, () => ({
      letter: null,
      isLocked: false,
    }))
  );
}

// Create a new empty frame with default settings
function createEmptyFrame(): Frame {
  return {
    id: uuidv4(),
    board: createEmptyBoard(),
    rack: [],
    score: 0,
    tileColor: "#000",
    playDescription: "",
    transitionIn: { type: "fade", duration: 1, tileColor: "orange" },
    transitionOut: { type: "fade", duration: 1, tileColor: "orange" },
  };
}

export default function FrameEditorManager() {
  const [frames, setFrames] = useState<Frame[]>([createEmptyFrame()]);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);

  const addFrame = () => {
    setFrames((prev) => {
      const newFrame = createEmptyFrame();
      // optionally copy board from current frame
      newFrame.board = JSON.parse(JSON.stringify(prev[currentFrameIndex].board));
      return [...prev, newFrame];
    });
    setCurrentFrameIndex(frames.length); // new frame is at the end
  };

  const deleteFrame = (index: number) => {
    if (frames.length <= 1) return;
    setFrames((prev) => {
      const newFrames = [...prev];
      newFrames.splice(index, 1);
      return newFrames;
    });
    if (currentFrameIndex >= frames.length - 1) {
      setCurrentFrameIndex(frames.length - 2);
    }
  };

  const updateCurrentFrame = (updated: Partial<Frame>) => {
    setFrames((prev) =>
      prev.map((f, i) =>
        i === currentFrameIndex ? { ...f, ...updated } : f
      )
    );
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <FrameList
        frames={frames}
        currentFrameIndex={currentFrameIndex}
        onSelect={setCurrentFrameIndex}
        onAddFrame={addFrame}
        onDeleteFrame={deleteFrame}
      />

      <div style={{ flexGrow: 1, padding: "16px" }}>
        <h1>Scrabble Board Editor</h1>
        <BoardEditor
          frame={frames[currentFrameIndex]}
          updateFrame={updateCurrentFrame}
        />
      </div>
    </div>
  );
}
