// src/components/editors/effects/PlayEffectEditor.tsx

import { useState, useEffect, useCallback, useMemo } from "react";
import type { PlayEffect, TilePlacement, Tile } from "../../../types/ScrabbleTypes";
import BoardEditor from "../../editors/BoardEditor";

interface Props {
  payload: PlayEffect;
  onChange: (newPayload: PlayEffect) => void;
  /** 
   * liveBoard here is the board *before* applying this frame’s play effect, 
   * as computed in EffectEditor via computeBoardAtFrame :contentReference[oaicite:0]{index=0}.
   */
  liveBoard: Tile[][];
}

export default function PlayEffectEditor({
  payload,
  onChange,
  liveBoard,
}: Props) {
  // --- 1) Capture the base board ONCE and never overwrite it ---
  const [baseBoard] = useState<Tile[][]>(
    () => liveBoard.map((row) => [...row])
  );

  // --- 2) Keep track of only *this* frame’s placements ---
  const [placements, setPlacements] = useState<TilePlacement[]>(
    payload.tiles
  );

  // If the user switches frames or effect-type, reset to that frame’s payload
  useEffect(() => {
    setPlacements(payload.tiles);
  }, [payload.tiles]);

  // --- 3) Build the editable view: base + your placements on top ---
  const derivedBoard: Tile[][] = useMemo(
    () =>
      baseBoard.map((row, y) =>
        row.map((tile, x) => {
          const hit = placements.find((p) => p.x === x && p.y === y);
          return hit
            ? { letter: hit.letter, state: "unlocked" }
            : { ...tile };
        })
      ),
    [baseBoard, placements]
  );

  // --- 4) Utility for shallow-equality of placements arrays ---
  const placementsEqual = (a: TilePlacement[], b: TilePlacement[]) => {
    if (a.length !== b.length) return false;
    return a.every((p, i) =>
      p.x === b[i].x && p.y === b[i].y && p.letter === b[i].letter
    );
  };

  // --- 5) Commit any cell whose letter differs from the *immutable* baseBoard ---
  const commitBoard = useCallback(
    (newBoard: Tile[][]) => {
      const newTiles: TilePlacement[] = [];
      newBoard.forEach((row, y) =>
        row.forEach((cell, x) => {
          const baseLetter = baseBoard[y][x]?.letter;
          if (cell.letter && cell.letter !== baseLetter) {
            newTiles.push({ x, y, letter: cell.letter });
          }
        })
      );

      if (!placementsEqual(newTiles, placements)) {
        setPlacements(newTiles);
        onChange({ tiles: newTiles });
      }
    },
    [baseBoard, onChange, placements]
  );

  return (
    <BoardEditor
      liveBoard={derivedBoard}
      commitBoard={commitBoard}
    />
  );
}
