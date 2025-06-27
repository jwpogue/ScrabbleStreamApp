// src/components/panels/SequenceTree.tsx
// import React from "react";
import { Tree, type NodeRendererProps } from "react-arborist";
import type {
  ScrabbleNode,
  SequenceNode,
  FrameNode,
} from "../../types/ScrabbleTypes";

import "../../styles/SequenceTree.css";

interface SequenceTreeProps {
  rootSequence: SequenceNode;
  selectedId: string;
  onSelect: (id: string) => void;
  onAddChild: (parentId: string, index: number) => void;
  onAddSequence: (parentId: string, index: number) => void;
  onDeleteChild: (parentId: string, childId: string) => void;
  onMoveNode: (nodeId: string, newParentId: string, newIndex: number) => void;
}

// Type guards
const isSequenceNode = (n: ScrabbleNode): n is SequenceNode =>
  "children" in n;

const isFrameNode = (n: ScrabbleNode): n is FrameNode =>
  "effect" in n;

export default function SequenceTree({
  rootSequence,
  selectedId,
  onSelect,
  onAddChild,
  onAddSequence,
  onDeleteChild,
  onMoveNode,
}: SequenceTreeProps) {
  const data: ScrabbleNode[] = [rootSequence];

  return (
    <div className="sequence-tree-panel">
      <Tree<ScrabbleNode>
        data={data}
        childrenAccessor="children"
        idAccessor="id"
        width={300}
        height={window.innerHeight}
        indent={20}
        rowHeight={28}
        openByDefault
        selection={selectedId}
        onSelect={(nodes) => {
          if (nodes.length > 0) {
            onSelect(nodes[0].data.id);
          }
        }}
        onMove={({ dragIds, parentId, index }) => {
          const draggedId = dragIds[0];
          const newParentId = parentId ?? rootSequence.id;
          if (draggedId != null) {
            onMoveNode(draggedId, newParentId, index);
          }
        }}
      >
        {({ node, style, dragHandle }: NodeRendererProps<ScrabbleNode>) => {
          const d = node.data;
          const isSelected = d.id === selectedId;
          const parentNode = node.parent;
          const parentId = parentNode?.data.id ?? rootSequence.id;
          const indexInParent = node.childIndex;

          const label = isFrameNode(d)
            ? `🟦 Frame (${d.effect.type})`
            : `🧩 Sequence (${d.type})`;

          return (
            <div
              className={`seq-node${isSelected ? " selected" : ""}`}
              style={style}
              ref={dragHandle}
              onClick={() => onSelect(d.id)}
            >
              <span className="chevron">
                {node.isInternal ? (node.isOpen ? "▼" : "▶") : "•"}
              </span>
              <span className="label">{label}</span>
              <div className="actions">
                <button
                  className="btn-add-frame"
                  title="Insert Frame After"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddChild(parentId, indexInParent + 1);
                  }}
                >
                  ＋F
                </button>
                <button
                  className="btn-add-seq"
                  title="Insert Sequence After"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddSequence(parentId, indexInParent + 1);
                  }}
                >
                  ＋S
                </button>
                {d.id !== rootSequence.id && (
                  <button
                    className="btn-delete"
                    title="Delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteChild(parentId, d.id);
                    }}
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          );
        }}
      </Tree>
    </div>
  );
}
