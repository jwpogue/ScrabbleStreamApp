// src/components/managers/GameManager.tsx

import { useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import FrameEditor from "../editors/FrameEditor";
import SequenceEditor from "../editors/SequenceEditor";
import SequenceTree from "../panels/SequenceTree";
import { useScrabbleGame } from "../../hooks/useScrabbleGame";
import type {
  FrameNode,
  Game,
  SequenceNode,
  Effect,
} from "../../types/ScrabbleTypes";
import { findFrameIndex } from "../../lib/engine";
import { createEffect } from "../editors/EffectEditor";

const createInitialGame = (): Game => {
  const rootFrame: FrameNode = {
    id: uuidv4(),
    effect: createEffect("none"),
  };

  const rootSequence: SequenceNode = {
    id: uuidv4(),
    chronologyType: "consecutive",
    additivityType: "cumulative",
    children: [rootFrame],
  };

  return {
    id: uuidv4(),
    title: "Untitled Game",
    boardSize: 15,
    rootSequence,
  };
};

export default function GameManager() {
  const {
    game,
    selectedNodeId,
    setSelectedNodeId,
    selectedNode,
    handleNodeUpdate,
    handleAddChild,
    handleAddSequence,
    handleDeleteChild,
    handleMoveNode,
  } = useScrabbleGame(createInitialGame());

  // Only updates an effect when it really changes
  const updateEffect = useCallback(
    (newEffect: Effect) => {
      if (selectedNode && "effect" in selectedNode) {
        handleNodeUpdate(selectedNodeId, {
          ...selectedNode,
          effect: newEffect,
        });
      }
    },
    [handleNodeUpdate, selectedNode, selectedNodeId]
  );

  // Now matches SequenceEditorProps.updateSequence: (updated: Partial<SequenceNode>) => void
  const updateSequence = useCallback(
    (updated: Partial<SequenceNode>) => {
      if (selectedNode && "children" in selectedNode) {
        handleNodeUpdate(selectedNodeId, {
          ...selectedNode,
          ...updated,
        });
      }
    },
    [handleNodeUpdate, selectedNode, selectedNodeId]
  );

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <SequenceTree
        rootSequence={game.rootSequence}
        selectedId={selectedNodeId}
        onSelect={setSelectedNodeId}
        onAddChild={handleAddChild}
        onAddSequence={handleAddSequence}
        onDeleteChild={handleDeleteChild}
        onMoveNode={handleMoveNode}
        boardSize={game.boardSize}
      />

      <div style={{ flex: 1, padding: "1rem", overflow: "auto" }}>
        {selectedNode && "effect" in selectedNode && (
          <FrameEditor
            frame={selectedNode}
            rootSequence={game.rootSequence}
            boardSize={game.boardSize}
            frameIndex={findFrameIndex(
              selectedNode,
              game.rootSequence
            )}
            updateEffect={updateEffect}
          />
        )}

        {selectedNode && "children" in selectedNode && (
          <SequenceEditor
            sequence={selectedNode}
            updateSequence={updateSequence}
            selectedId={selectedNodeId}
            onSelectNode={setSelectedNodeId}
            onDeleteChild={(id) =>
              handleDeleteChild(selectedNodeId, id)
            }
          />
        )}
      </div>
    </div>
  );
}
