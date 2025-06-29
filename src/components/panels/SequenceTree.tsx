// src/components/panels/SequenceTree.tsx
import React, { useState, useMemo } from "react";
import { Tree, type NodeRendererProps } from "react-arborist";
import type {
  ScrabbleNode,
  SequenceNode,
  FrameNode,
  Effect,
  ChronologyType,
  AdditivityType,
} from "../../types/ScrabbleTypes";

import { computeBoardAtFrame } from "../../lib/engine";
import NodeInsertMenu from "../menus/NodeInsertMenu";
import { Plus, Eye, Trash2, FolderPlus } from "lucide-react";
import "../../styles/SequenceTree.css";
import BoardPreview from "../board/BoardPreview";

interface SequenceTreeProps {
  rootSequence: SequenceNode;
  selectedId: string;
  onSelect: (id: string) => void;
  onAddChild: (
    parentId: string,
    index: number,
    effectType: Effect["type"]
  ) => void;
  onAddSequence: (
    parentId: string,
    index: number,
    chronologyType: ChronologyType,
    additivityType: AdditivityType
  ) => void;
  onDeleteChild: (parentId: string, childId: string) => void;
  onMoveNode: (nodeId: string, newParentId: string, newIndex: number) => void;
  boardSize: number;
}

const isSequenceNode = (n: ScrabbleNode): n is SequenceNode => "children" in n;
const isFrameNode = (n: ScrabbleNode): n is FrameNode => "effect" in n;

export default function SequenceTree({
  rootSequence,
  selectedId,
  onSelect,
  onAddChild,
  onAddSequence,
  onDeleteChild,
  onMoveNode,
  boardSize,
}: SequenceTreeProps) {
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const [menuPosition, setMenuPosition] = useState<{
    x: number;
    y: number;
    parentId: string;
    index: number;
    type: "frame" | "sequence";
  } | null>(null);

  const data: ScrabbleNode[] = [rootSequence];

  const previewBoard = useMemo(() => {
    if (previewIndex === null) return null;
    return computeBoardAtFrame(rootSequence, previewIndex, boardSize);
  }, [rootSequence, previewIndex, boardSize]);

  let frameCounter = -1;

  return (
    <div className="sequence-tree-panel">
      <div className="structure-box">
        <Tree<ScrabbleNode>
          data={data}
          childrenAccessor="children"
          idAccessor="id"
          width={480}
          height={window.innerHeight}
          indent={20}
          rowHeight={28}
          openByDefault
          selection={selectedId}
          onSelect={(nodes) => {
            if (nodes.length) onSelect(nodes[0].data.id);
          }}
          onMove={({ dragIds, parentId, index }) => {
            const dragged = dragIds[0];
            if (dragged != null) {
              onMoveNode(dragged, parentId ?? rootSequence.id, index);
            }
          }}
        >
          {({ node, style, dragHandle }: NodeRendererProps<ScrabbleNode>) => {
            const d = node.data;
            const isSelected = d.id === selectedId;
            const parentId = node.parent?.data.id ?? rootSequence.id;
            const childIndex = node.childIndex;

            const label = isFrameNode(d)
              ? `Frame (${d.effect.type})`
              : `Sequence (${d.chronologyType})`;

            let currentIndex: number | null = null;
            if (isFrameNode(d)) {
              frameCounter++;
              currentIndex = frameCounter;
            }

            const isSequence = isSequenceNode(d);
            const targetParentId = isSequence ? d.id : parentId;
            const insertIndex = isSequence
              ? (d as SequenceNode).children.length
              : childIndex + 1;

            return (
              <div className="tree-row-wrapper" style={style}>
                <div
                  className={`seq-node ${isFrameNode(d) ? "frame" : "sequence"}$
                    {isSelected ? " selected" : ""}`}
                  style={{ ["--depth" as any]: node.level }}
                  ref={dragHandle}
                  onClick={() => onSelect(d.id)}
                >
                  <div className="content">
                    <span
                      className="chevron"
                      onClick={(e) => {
                        e.stopPropagation();
                        node.toggle();
                      }}
                    >
                      {node.isInternal ? (node.isOpen ? "▼" : "▶") : ""}
                    </span>
                    <span className="label">{label}</span>
                  </div>

                  <div className="actions">
                    <button
                      className="btn-icon"
                      title="Insert Frame"
                      onClick={(e) => {
                        e.stopPropagation();
                        const rect = (e.target as HTMLElement).getBoundingClientRect();
                        setMenuPosition({
                          x: rect.right + 8,
                          y: rect.top,
                          parentId: targetParentId,
                          index: insertIndex,
                          type: "frame",
                        });
                      }}
                    >
                      <Plus size={16} />
                    </button>
                    <button
                      className="btn-icon"
                      title="Insert Sequence"
                      onClick={(e) => {
                        e.stopPropagation();
                        const rect = (e.target as HTMLElement).getBoundingClientRect();
                        setMenuPosition({
                          x: rect.right + 8,
                          y: rect.top,
                          parentId: targetParentId,
                          index: insertIndex,
                          type: "sequence",
                        });
                      }}
                    >
                      <FolderPlus size={16} />
                    </button>
                    {d.id !== rootSequence.id && (
                      <button
                        className="btn-icon delete-btn"
                        title="Delete"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteChild(parentId, d.id);
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>

                <div className="preview-icon-cell">
                  {isFrameNode(d) && (
                    <button
                      className="btn-icon preview-btn"
                      title="Preview Frame"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewIndex(currentIndex!);
                      }}
                    >
                      <Eye size={16} />
                    </button>
                  )}
                </div>
              </div>
            );
          }}
        </Tree>
      </div>

      {menuPosition && (
        <NodeInsertMenu
          x={menuPosition.x}
          y={menuPosition.y}
          type={menuPosition.type}
          onAdd={({ effectType, chronologyType, additivityType }) => {
            if (menuPosition.type === "frame" && effectType) {
              onAddChild(
                menuPosition.parentId,
                menuPosition.index,
                effectType
              );
            } else if (
              menuPosition.type === "sequence" &&
              chronologyType &&
              additivityType
            ) {
              onAddSequence(
                menuPosition.parentId,
                menuPosition.index,
                chronologyType,
                additivityType
              );
            }
            setMenuPosition(null);
          }}
          onCancel={() => setMenuPosition(null)}
        />
      )}

      {previewIndex !== null && previewBoard && (
        <BoardPreview
          board={previewBoard}
          onClose={() => setPreviewIndex(null)}
        />
      )}
    </div>
  );
}