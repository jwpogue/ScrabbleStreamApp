// src/components/editors/SequenceEditor.tsx
import React from "react";
import type { SequenceNode, FrameNode, ScrabbleNode } from "../../types/ScrabbleTypes";

interface SequenceEditorProps {
  sequence: SequenceNode;
  updateSequence: (updated: Partial<SequenceNode>) => void;
  selectedId: string;
  onSelectNode: (nodeId: string) => void;
  onDeleteChild: (childId: string) => void;
}

const isFrameNode = (node: ScrabbleNode): node is FrameNode => "effect" in node;

export default function SequenceEditor({
  sequence,
  updateSequence,
  selectedId,
  onSelectNode,
  onDeleteChild,
}: SequenceEditorProps) {
  return (
    <div className="sequence-editor">
      <h3>Sequence Properties</h3>

      <label>
        Chronology:
        <select
          value={sequence.chronologyType}
          onChange={(e) => updateSequence({ chronologyType: e.target.value as SequenceNode["chronologyType"] })}
        >
          <option value="consecutive">Consecutive</option>
          <option value="simultaneous">Simultaneous</option>
        </select>
      </label>

      <label>
        Additivity:
        <select
          value={sequence.additivityType}
          onChange={(e) => updateSequence({ additivityType: e.target.value as SequenceNode["additivityType"] })}
        >
          <option value="cumulative">Cumulative</option>
          <option value="temporary">Temporary</option>
        </select>
      </label>

      <div className="child-list">
        <h4>Children</h4>
        <ul style={{ padding: 0, listStyle: "none" }}>
          {sequence.children.map((child) => {
            const isSelected = child.id === selectedId;
            const label = isFrameNode(child)
              ? `Frame (${child.effect.type})`
              : `Sequence (${child.chronologyType})`;

            return (
              <li
                key={child.id}
                className={isSelected ? "selected" : ""}
                onClick={() => onSelectNode(child.id)}
                style={{
                  cursor: "pointer",
                  padding: "4px",
                  marginBottom: "4px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  border: isSelected ? "1px solid blue" : "1px solid transparent",
                  borderRadius: "4px",
                }}
              >
                <span>{label}</span>
                <button
                  title="Delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteChild(child.id);
                  }}
                >
                  ✕
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
