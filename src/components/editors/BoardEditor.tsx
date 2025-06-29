// src/components/board/BoardEditor.tsx

import { useState, useCallback, useEffect } from "react"
import type { Arrow, Tile } from "../../types/ScrabbleTypes"
import GameBoard from "../board/GameBoard"
import BoardInputHandler from "../board/BoardInputHandler"

interface BoardEditorProps {
  liveBoard: Tile[][]
  commitBoard: (newBoard: Tile[][]) => void
}

export default function BoardEditor({
  liveBoard,
  commitBoard,
}: BoardEditorProps) {
  // Local editable board state
  const [board, setBoard] = useState<Tile[][]>(
    () => liveBoard.map((row) => [...row])
  )

  // Whenever the parent gives a new liveBoard, reset our local copy
  useEffect(() => {
  const liveBoardFlat = liveBoard.flat().map((tile) => tile.letter).join("")
  const boardFlat = board.flat().map((tile) => tile.letter).join("")

  if (liveBoardFlat !== boardFlat) {
    setBoard(liveBoard.map((row) => [...row]))
  }
}, [liveBoard])


  // Cursor state
  const [arrow, setArrow] = useState<Arrow>({
    x: 0,
    y: 0,
    mode: "hidden",
    direction: "horizontal",
  })

  // Update both local and parent board
  const updateBoard = useCallback(
    (newBoard: Tile[][]) => {
      setBoard(newBoard)
      commitBoard(newBoard)
    },
    [commitBoard]
  )

  // Hold the click handler from the input handler
  const [cellClickHandler, setCellClickHandler] = useState<
    ((row: number, col: number) => void) | null
  >(null)

  // Memoize registration of the click handler
  const handleCellClickReady = useCallback(
    (handler: (row: number, col: number) => void) => {
      setCellClickHandler(() => handler)
    },
    []
  )

  // Handler for GameBoard clicks
  const handleCellClick = useCallback(
    (row: number, col: number) => {
      cellClickHandler?.(row, col)
    },
    [cellClickHandler]
  )

  return (
    <>
      <BoardInputHandler
        board={board}
        arrow={arrow}
        setArrow={setArrow}
        updateBoard={updateBoard}
        onCellClickReady={handleCellClickReady}
      />
      <GameBoard
        board={board}
        arrow={arrow}
        editable={true}
        onCellClick={handleCellClick}
      />
    </>
  )
}

