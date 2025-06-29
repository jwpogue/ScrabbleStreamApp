import type { Tile } from "../../../types/ScrabbleTypes"

interface Props {
  payload: {} 
  onChange: (payload: {}) => void
  liveBoard: Tile[][]
}

export default function NoneEffectEditor({
  }: Props) {
  return <div style={{ fontStyle: "italic" }}>No parameters for this effect.</div>
}
