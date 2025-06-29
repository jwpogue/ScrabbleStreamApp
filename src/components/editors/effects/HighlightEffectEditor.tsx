// src/components/editors/effects/HighlightEffectEditor.tsx

import type { HighlightEffect, Tile } from "../../../types/ScrabbleTypes"

interface Props {
  payload: HighlightEffect
  onChange: (newPayload: HighlightEffect) => void
  liveBoard: Tile[][]
}

export default function HighlightEffectEditor({
}: Props) {
  return (
    <div style={{ fontStyle: "italic", color: "#666" }}>
      HighlightEffectEditor is not implemented yet.
    </div>
  )
}
