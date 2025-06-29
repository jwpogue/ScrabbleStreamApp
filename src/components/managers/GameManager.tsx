// src/components/managers/GameManager.tsx

import { v4 as uuidv4 } from "uuid";
import FrameEditor from "../editors/FrameEditor";
import SequenceEditor from "../editors/SequenceEditor";
import SequenceTree from "../panels/SequenceTree";
import { useScrabbleGame } from "../../hooks/useScrabbleGame";
import { generateEmptyBoard } from "../../lib/boardUtils";
import type { FrameNode, Game, SequenceNode } from "../../types/ScrabbleTypes";

const createInitialGame = (): Game => {
    const rootFrame: FrameNode = {
        id: uuidv4(),
        effect: { type: "none" },
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
                        updateFrame={(upd) =>
                            handleNodeUpdate(selectedNodeId, upd)
                        }
                    />
                )}
                {selectedNode && "children" in selectedNode && (
                    <SequenceEditor
                        sequence={selectedNode}
                        updateSequence={(upd) =>
                            handleNodeUpdate(selectedNodeId, upd)
                        }
                        selectedId={selectedNodeId}
                        onSelectNode={setSelectedNodeId}
                        onDeleteChild={(id) =>
                            handleDeleteChild(selectedNode.id, id)
                        }
                    />
                )}
            </div>
        </div>
    );
}
