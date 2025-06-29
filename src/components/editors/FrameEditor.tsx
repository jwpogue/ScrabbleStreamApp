// src/components/editors/FrameEditor.tsx
import type { FrameNode, SequenceNode, Effect } from "../../types/ScrabbleTypes"
import EffectEditor from "./EffectEditor"

interface FrameEditorProps {
  frame: FrameNode
  frameIndex: number
  rootSequence: SequenceNode
  boardSize: number
  updateEffect: (newEffect: Effect) => void
}

export default function FrameEditor({
  frame,
  frameIndex,
  rootSequence,
  boardSize,
  updateEffect,
}: FrameEditorProps) {
  return (
    <div className="frame-editor">
      <EffectEditor
        effect={frame.effect}
        onChange={updateEffect}
        frameIndex={frameIndex}
        rootSequence={rootSequence}
        boardSize={boardSize}
      />
    </div>
  )
}
