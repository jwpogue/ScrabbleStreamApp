// src/components/managers/GameManager.tsx

import { useState } from "react";
import { generateEmptyBoard } from "../../lib/boardUtils";
import { v4 as uuidv4 } from "uuid";

import FrameEditor from "../editors/FrameEditor";
import SequenceEditor from "../editors/SequenceEditor";
import SequenceTree from "../panels/SequenceTree";

import type {
    FrameNode,
    Game,
    ScrabbleNode,
    SequenceNode,
} from "../../types/ScrabbleTypes";

// Type guards
function isSequenceNode(node: ScrabbleNode): node is SequenceNode {
    return (node as SequenceNode).children !== undefined;
}
function isFrameNode(node: ScrabbleNode): node is FrameNode {
    return (node as FrameNode).effect !== undefined;
}

// Create the initial game state
const createInitialGame = (): Game => {
    const rootFrame: FrameNode = {
        id: uuidv4(),
        effect: { type: "none" },
        board: generateEmptyBoard(15),
    };

    const rootSequence: SequenceNode = {
        id: uuidv4(),
        type: "consecutive-additive",
        children: [rootFrame],
        board: generateEmptyBoard(15),
    };

    return {
        id: uuidv4(),
        title: "Untitled Game",
        boardSize: 15,
        rootSequence,
    };
};

export default function GameManager() {
    const [game, setGame] = useState<Game>(createInitialGame());
    const [selectedNodeId, setSelectedNodeId] = useState<string>(
        game.rootSequence.children[0]?.id || game.rootSequence.id
    );

    // Find node by ID
    const findNodeById = (
        node: ScrabbleNode,
        id: string
    ): ScrabbleNode | null => {
        if (node.id === id) return node;
        if (isSequenceNode(node)) {
            for (const child of node.children) {
                const found = findNodeById(child, id);
                if (found) return found;
            }
        }
        return null;
    };

    // Update node by ID
    const updateNodeById = (
        node: ScrabbleNode,
        id: string,
        updated: Partial<FrameNode | SequenceNode>
    ): ScrabbleNode => {
        if (node.id === id) {
            return { ...node, ...updated };
        }
        if (isSequenceNode(node)) {
            return {
                ...node,
                children: node.children.map((child) =>
                    updateNodeById(child, id, updated)
                ),
            };
        }
        return node;
    };

    const handleNodeUpdate = (
        nodeId: string,
        updated: Partial<FrameNode | SequenceNode>
    ) => {
        const newRoot = updateNodeById(
            game.rootSequence,
            nodeId,
            updated
        ) as SequenceNode;
        setGame((prev) => ({ ...prev, rootSequence: newRoot }));
    };

    const selectedNode = findNodeById(game.rootSequence, selectedNodeId);

    const handleAddChild = (parentId: string, index: number) => {
        const parent = findNodeById(game.rootSequence, parentId);
        if (!parent || !isSequenceNode(parent)) return;

        const newFrame: FrameNode = {
            id: uuidv4(),
            effect: { type: "none" },
            board: generateEmptyBoard(game.boardSize),
        };

        const newChildren = [
            ...parent.children.slice(0, index),
            newFrame,
            ...parent.children.slice(index),
        ];

        handleNodeUpdate(parentId, { children: newChildren });
        setSelectedNodeId(newFrame.id);
    };

    const handleAddSequence = (parentId: string, index: number) => {
        const parent = findNodeById(game.rootSequence, parentId);
        if (!parent || !isSequenceNode(parent)) return;

        const newSequence: SequenceNode = {
            id: uuidv4(),
            type: "consecutive-replacement",
            children: [],
            board: generateEmptyBoard(game.boardSize),
        };

        const newChildren = [
            ...parent.children.slice(0, index),
            newSequence,
            ...parent.children.slice(index),
        ];

        handleNodeUpdate(parentId, { children: newChildren });
        setSelectedNodeId(newSequence.id);
    };

    const handleDeleteChild = (parentId: string, childId: string) => {
        const parent = findNodeById(game.rootSequence, parentId);
        if (!parent || !isSequenceNode(parent)) return;

        const filtered = parent.children.filter((c) => c.id !== childId);
        handleNodeUpdate(parentId, { children: filtered });

        if (selectedNodeId === childId) {
            setSelectedNodeId(parentId);
        }
    };

    const moveNode = (
        node: ScrabbleNode,
        nodeId: string,
        newParentId: string,
        newIndex: number
    ): ScrabbleNode => {
        if (!isSequenceNode(node)) return node;

        let dragged: ScrabbleNode | null = null;

        const filteredChildren = node.children.filter((child) => {
            if (child.id === nodeId) {
                dragged = child;
                return false;
            }
            return true;
        });

        const newChildren =
            node.id === newParentId
                ? [
                      ...filteredChildren.slice(0, newIndex),
                      dragged!,
                      ...filteredChildren.slice(newIndex),
                  ]
                : node.children.map((child) =>
                      moveNode(child, nodeId, newParentId, newIndex)
                  );

        return { ...node, children: newChildren };
    };

    const handleMoveNode = (
        nodeId: string,
        newParentId: string,
        newIndex: number
    ) => {
        const updatedRoot = moveNode(
            game.rootSequence,
            nodeId,
            newParentId,
            newIndex
        ) as SequenceNode;
        setGame({ ...game, rootSequence: updatedRoot });
    };

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
            />
            <div style={{ flex: 1, padding: "1rem", overflow: "auto" }}>
                {selectedNode && isFrameNode(selectedNode) && (
                    <FrameEditor
                        frame={selectedNode}
                        updateFrame={(upd) =>
                            handleNodeUpdate(selectedNodeId, upd)
                        }
                    />
                )}
                {selectedNode && isSequenceNode(selectedNode) && (
                    <SequenceEditor
                        sequence={selectedNode}
                        updateSequence={(upd) =>
                            handleNodeUpdate(selectedNodeId, upd)
                        }
                        selectedId={selectedNodeId}
                        onSelectNode={setSelectedNodeId}
                        onAddChild={(index) => handleAddChild(selectedNode.id, index)}
                        onAddSequence={(index) => handleAddSequence(selectedNode.id, index)}
                        onDeleteChild={(id) =>
                            handleDeleteChild(selectedNode.id, id)
                        }
                    />
                )}
            </div>
        </div>
    );
}
