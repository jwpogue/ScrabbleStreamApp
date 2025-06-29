import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import type {
    AdditivityType,
    ChronologyType,
    Effect,
    FrameNode,
    Game,
    ScrabbleNode,
    SequenceNode,
} from "../types/ScrabbleTypes";
import { effects } from "../components/editors/effects";

function isSequenceNode(node: ScrabbleNode): node is SequenceNode {
    return (node as SequenceNode).children !== undefined;
}
function isFrameNode(node: ScrabbleNode): node is FrameNode {
    return (node as FrameNode).effect !== undefined;
}

export function useScrabbleGame(initialGame: Game) {
    const [game, setGame] = useState<Game>(initialGame);
    const [selectedNodeId, setSelectedNodeId] = useState<string>(
        initialGame.rootSequence.children[0]?.id || initialGame.rootSequence.id
    );

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

    // FIX: Handle React Arborist's special root ID
    const handleAddChild = (
        parentId: string,
        index: number,
        effectType: Effect["type"]
    ) => {
        console.log("🚀 handleAddChild called with:", {
            parentId,
            index,
            effectType,
        });
        console.log("🎯 Root sequence ID:", game.rootSequence.id);
        console.log("🔍 Current game state:", JSON.stringify(game, null, 2));

        // Handle React Arborist's special root ID by converting it to actual root ID
        const actualParentId =
            parentId === "__REACT_ARBORIST_INTERNAL_ROOT__"
                ? game.rootSequence.id
                : parentId;

        const parent = findNodeById(game.rootSequence, actualParentId);
        console.log("📍 Found parent:", parent);

        if (!parent || !isSequenceNode(parent)) {
            console.log("❌ Parent not found or not a sequence node");
            return;
        }

        const newFrame: FrameNode = {
            id: uuidv4(),
            effect: createDefaultEffect(effectType) as Effect, // <== 👈 Explicit cast
        };
        console.log("✨ Created new frame:", newFrame);

        const newChildren = [
            ...parent.children.slice(0, index),
            newFrame,
            ...parent.children.slice(index),
        ];
        console.log("📝 New children array:", newChildren);

        // Always use the actual parent ID for updates
        if (actualParentId === game.rootSequence.id) {
            console.log("🎯 Updating root sequence directly");
            setGame((prev) => {
                const newGame = {
                    ...prev,
                    rootSequence: {
                        ...prev.rootSequence,
                        children: newChildren,
                    },
                };
                console.log("🎊 New game state:", newGame);
                return newGame;
            });
        } else {
            console.log("🔄 Using handleNodeUpdate for non-root parent");
            handleNodeUpdate(actualParentId, { children: newChildren });
        }
        setSelectedNodeId(newFrame.id);
    };

    const handleAddSequence = (
        parentId: string,
        index: number,
        chronologyType: ChronologyType,
        additivityType: AdditivityType
    ) => {
        console.log("🚀 handleAddSequence called with:", {
            parentId,
            index,
            chronologyType,
            additivityType,
        });
        console.log("🎯 Root sequence ID:", game.rootSequence.id);

        // Handle React Arborist's special root ID by converting it to actual root ID
        const actualParentId =
            parentId === "__REACT_ARBORIST_INTERNAL_ROOT__"
                ? game.rootSequence.id
                : parentId;

        const parent = findNodeById(game.rootSequence, actualParentId);
        console.log("📍 Found parent:", parent);

        if (!parent || !isSequenceNode(parent)) {
            console.log("❌ Parent not found or not a sequence node");
            return;
        }

        const newSequence: SequenceNode = {
            id: uuidv4(),
            chronologyType: chronologyType,
            additivityType: additivityType,
            children: [],
        };
        console.log("✨ Created new sequence:", newSequence);

        const newChildren = [
            ...parent.children.slice(0, index),
            newSequence,
            ...parent.children.slice(index),
        ];
        console.log("📝 New children array:", newChildren);

        // Always use the actual parent ID for updates
        if (actualParentId === game.rootSequence.id) {
            console.log("🎯 Updating root sequence directly");
            setGame((prev) => {
                const newGame = {
                    ...prev,
                    rootSequence: {
                        ...prev.rootSequence,
                        children: newChildren,
                    },
                };
                console.log("🎊 New game state:", newGame);
                return newGame;
            });
        } else {
            console.log("🔄 Using handleNodeUpdate for non-root parent");
            handleNodeUpdate(actualParentId, { children: newChildren });
        }
        setSelectedNodeId(newSequence.id);
    };

    // FIX: Enhanced deletion that handles sequences with children
    const handleDeleteChild = (parentId: string, childId: string) => {
        // Handle React Arborist's special root ID
        const actualParentId =
            parentId === "__REACT_ARBORIST_INTERNAL_ROOT__"
                ? game.rootSequence.id
                : parentId;

        const parent = findNodeById(game.rootSequence, actualParentId);
        if (!parent || !isSequenceNode(parent)) return;

        const childToDelete = findNodeById(game.rootSequence, childId);

        // If deleting a sequence with children, you might want to:
        // Option 1: Prevent deletion if it has children
        if (
            childToDelete &&
            isSequenceNode(childToDelete) &&
            childToDelete.children.length > 0
        ) {
            const confirmDelete = window.confirm(
                `This sequence has ${childToDelete.children.length} children. Delete anyway?`
            );
            if (!confirmDelete) return;
        }

        const filtered = parent.children.filter((c) => c.id !== childId);
        handleNodeUpdate(actualParentId, { children: filtered });

        if (selectedNodeId === childId) {
            setSelectedNodeId(actualParentId);
        }
    };

    // FIX: Separate the move logic from insertion logic
    const moveNodeInTree = (
        node: ScrabbleNode,
        nodeId: string,
        newParentId: string,
        newIndex: number
    ): { newTree: ScrabbleNode; movedNode: ScrabbleNode | null } => {
        if (!isSequenceNode(node)) {
            return { newTree: node, movedNode: null };
        }

        let movedNode: ScrabbleNode | null = null;

        // Remove the node from current location
        const filteredChildren = node.children.filter((child) => {
            if (child.id === nodeId) {
                movedNode = child;
                return false;
            }
            return true;
        });

        // Handle React Arborist's special root ID
        const actualNewParentId =
            newParentId === "__REACT_ARBORIST_INTERNAL_ROOT__"
                ? game.rootSequence.id
                : newParentId;

        // If this is the target parent, insert the moved node
        if (node.id === actualNewParentId && movedNode) {
            const newChildren = [
                ...filteredChildren.slice(0, newIndex),
                movedNode,
                ...filteredChildren.slice(newIndex),
            ];
            return { newTree: { ...node, children: newChildren }, movedNode };
        }

        // Otherwise, recursively process children
        const processedChildren = filteredChildren.map((child) => {
            const result = moveNodeInTree(
                child,
                nodeId,
                actualNewParentId,
                newIndex
            );
            if (result.movedNode && !movedNode) {
                movedNode = result.movedNode;
            }
            return result.newTree;
        });

        return {
            newTree: { ...node, children: processedChildren },
            movedNode,
        };
    };

    const handleMoveNode = (
        nodeId: string,
        newParentId: string,
        newIndex: number
    ) => {
        const result = moveNodeInTree(
            game.rootSequence,
            nodeId,
            newParentId,
            newIndex
        );
        setGame({ ...game, rootSequence: result.newTree as SequenceNode });
    };

    return {
        game,
        selectedNodeId,
        setSelectedNodeId,
        selectedNode,
        handleNodeUpdate,
        handleAddChild,
        handleAddSequence,
        handleDeleteChild,
        handleMoveNode,
    };
}

const createDefaultEffect = <T extends keyof typeof effects>(
    type: T
): (typeof effects)[T] extends { type: T; initialPayload: () => infer P }
    ? { type: T; payload: P }
    : never => {
    const def = effects[type];
    return {
        type: def.type,
        payload: def.initialPayload(),
    } as any;
};
