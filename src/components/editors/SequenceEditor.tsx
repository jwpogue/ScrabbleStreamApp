import React from "react";
import type {
  SequenceNode,
  FrameNode,
  ScrabbleNode,
  SequenceType,
} from "../../types/ScrabbleTypes";

interface SequenceEditorProps {
  sequence: SequenceNode;
  updateSequence: (updated: Partial<SequenceNode>) => void;
  selectedId: string;
  onSelectNode: (nodeId: string) => void;
  onAddChild: (index: number) => void;
  onAddSequence: (index: number) => void;
  onDeleteChild: (childId: string) => void;
}

export default function SequenceEditor({
  sequence,
  updateSequence,
  selectedId,
  onSelectNode,
  onAddChild,
  onAddSequence,
  onDeleteChild,
}: SequenceEditorProps) {
  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateSequence({ type: e.target.value as SequenceType });
  };

  const isFrameNode = (node: ScrabbleNode): node is FrameNode =>
    "effect" in node;

  return (
    <div className="sequence-editor">
      <h3>Sequence Editor</h3>
      <label>
        Sequence Type:
        <select value={sequence.type} onChange={handleTypeChange}>
          <option value="consecutive-replacement">Consecutive (Replace)</option>
          <option value="consecutive-additive">Consecutive (Additive)</option>
          <option value="simultaneous">Simultaneous</option>
        </select>
      </label>

      <div className="child-list">
        <h4>Children</h4>
        <ul style={{ padding: 0, listStyle: "none" }}>
          {sequence.children.map((child, index) => {
            const isSelected = child.id === selectedId;
            const label = isFrameNode(child)
              ? `Frame (${child.effect.type})`
              : `Sequence (${child.type})`;

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
                <div style={{ display: "flex", gap: "0.25rem" }}>
                  <button
                    title="Add Frame after"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddChild(index + 1);
                    }}
                  >
                    ＋F
                  </button>
                  <button
                    title="Add Sequence after"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddSequence(index + 1);
                    }}
                  >
                    ＋S
                  </button>
                  <button
                    title="Delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteChild(child.id);
                    }}
                  >
                    ✕
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
        <div style={{ marginTop: "0.5rem" }}>
          <button onClick={() => onAddChild(sequence.children.length)}>
            + Add Frame
          </button>
          <button
            onClick={() => onAddSequence(sequence.children.length)}
            style={{ marginLeft: "0.5rem" }}
          >
            + Add Sequence
          </button>
        </div>
      </div>
    </div>
  );
}
