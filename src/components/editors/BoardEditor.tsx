import { useState, useCallback } from "react"
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
  const [board, setBoard] = useState<Tile[][]>(
    () => liveBoard.map((row) => [...row])
  )

  const [arrow, setArrow] = useState<Arrow>({
    x: 0,
    y: 0,
    mode: "hidden",
    direction: "horizontal",
  })

  const updateBoard = (newBoard: Tile[][]) => {
    setBoard(newBoard)
    commitBoard(newBoard)
  }

  const [cellClickHandler, setCellClickHandler] = useState<
    ((row: number, col: number) => void) | null
  >(null)

  const handleCellClick = useCallback(
    (row: number, col: number) => {
      if (cellClickHandler) cellClickHandler(row, col)
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
        onCellClickReady={(handler) => setCellClickHandler(() => handler)}
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
