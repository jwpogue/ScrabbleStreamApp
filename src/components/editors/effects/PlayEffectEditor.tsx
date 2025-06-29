// src/components/editors/effects/PlayEffectEditor.tsx

import { useState, useEffect } from "react"
import type { PlayEffect, TilePlacement, Tile } from "../../../types/ScrabbleTypes"
import BoardEditor from "../../editors/BoardEditor"

interface Props {
  payload: PlayEffect
  onChange: (newPayload: PlayEffect) => void
  liveBoard: Tile[][]
}

export default function PlayEffectEditor({
  payload,
  onChange,
  liveBoard,
}: Props) {
  const [placements, setPlacements] = useState<TilePlacement[]>(payload.tiles)

  // build an editable board = liveBoard + current placements
  const derivedBoard: Tile[][] = liveBoard.map((row, y) =>
    row.map((tile, x) => {
      const hit = placements.find((p) => p.x === x && p.y === y)
      return hit
        ? { letter: hit.letter, state: "unlocked" }
        : { ...tile }
    })
  )

  // whenever placements change, bubble up
  useEffect(() => {
    onChange({ tiles: placements })
  }, [placements])

  return (
    <BoardEditor
      liveBoard={derivedBoard}
      commitBoard={(newBoard) => {
        const newTiles: TilePlacement[] = []
        newBoard.forEach((row, y) =>
          row.forEach((cell, x) => {
            if (
              cell.state === "unlocked" &&
              cell.letter &&
              cell.letter !== liveBoard[y][x]?.letter
            ) {
              newTiles.push({ x, y, letter: cell.letter })
            }
          })
        )
        setPlacements(newTiles)
      }}
    />
  )
}
