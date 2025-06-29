// src/components/board/BoardInputHandler.tsx

import React, { useCallback, useEffect } from "react"
import type { Arrow, Tile, TileState } from "../../types/ScrabbleTypes"
import { BOARD_SIZE } from "../../lib/boardUtils"

interface Props {
  board: Tile[][]
  arrow: Arrow
  setArrow: React.Dispatch<React.SetStateAction<Arrow>>
  updateBoard: (b: Tile[][]) => void
  onCellClickReady?: (handler: (row: number, col: number) => void) => void
}

export default function BoardInputHandler({
  board,
  arrow,
  setArrow,
  updateBoard,
  onCellClickReady,
}: Props) {
  // Move cursor to next unlocked cell
  const advance = useCallback(
    (
      x: number,
      y: number,
      direction: Arrow["direction"],
      inclusive: boolean,
      forward = true
    ): [number, number] | null => {
      let col = x
      let row = y
      if (!inclusive) {
        if (direction === "horizontal") col += forward ? 1 : -1
        else row += forward ? 1 : -1
      }
      while (
        col >= 0 &&
        col < BOARD_SIZE &&
        row >= 0 &&
        row < BOARD_SIZE
      ) {
        if (board[row][col].state === "unlocked") return [col, row]
        if (direction === "horizontal") col += forward ? 1 : -1
        else row += forward ? 1 : -1
      }
      return null
    },
    [board]
  )

  // Update arrow state
  const moveArrow = useCallback(
    (
      x: number,
      y: number,
      mode: Arrow["mode"],
      direction = arrow.direction
    ) => {
      setArrow({ x, y, mode, direction })
    },
    [arrow.direction, setArrow]
  )

  // Register click handler once (stable because onCellClickReady is memoized upstream)
  useEffect(() => {
    if (!onCellClickReady) return

    const handleCellClick = (row: number, col: number) => {
      const clickedCell = board[row][col]
      setArrow((prev) => {
        const isSame = prev.x === col && prev.y === row
        const isActive = prev.mode !== "hidden"
        if (isSame && isActive) {
          if (prev.direction === "horizontal") {
            return { ...prev, direction: "vertical" }
          } else {
            return { ...prev, mode: "hidden", direction: "horizontal" }
          }
        }
        return {
          x: col,
          y: row,
          direction: "horizontal",
          mode: clickedCell.letter ? "select" : "edit",
        }
      })
    }

    onCellClickReady(handleCellClick)
  }, [board, setArrow, onCellClickReady])

  // Delete/backspace behavior
  const handleDelete = useCallback(() => {
    const { x, y, mode, direction } = arrow
    const newBoard = board.map((r) => [...r])

    if (mode === "select") {
      if (newBoard[y][x].state === "unlocked") {
        newBoard[y][x] = { letter: null, state: "unlocked" }
        moveArrow(x, y, "edit", direction)
      } else {
        const back = advance(x, y, direction, false, false)
        if (back) {
          const [bx, by] = back
          const nextMode = newBoard[by][bx].letter ? "select" : "edit"
          moveArrow(bx, by, nextMode, direction)
        }
      }
    } else if (mode === "edit") {
      const back = advance(x, y, direction, false, false)
      if (back) {
        const [bx, by] = back
        if (newBoard[by][bx].state === "unlocked") {
          newBoard[by][bx] = { letter: null, state: "unlocked" }
          moveArrow(bx, by, "edit", direction)
        }
      }
    }

    updateBoard(newBoard)
  }, [arrow, board, advance, moveArrow, updateBoard])

  const handleLetterInput = useCallback(
  (letter: string) => {
    const { x, y, mode, direction } = arrow
    const newBoard = board.map((r) => [...r])

    if (mode === "select") {
      const next = advance(x, y, direction, true)
      if (!next) return // Don't do anything if no valid cell found

      const [col, row] = next
      newBoard[row][col] = { letter, state: "unlocked" }

      const nextCell = advance(col, row, direction, false)
      if (nextCell) {
        const [nextX, nextY] = nextCell
        const nextMode = newBoard[nextY][nextX].letter ? "select" : "edit"
        moveArrow(nextX, nextY, nextMode, direction)
      } else {
        moveArrow(col, row, "select", direction)
      }
    } else if (mode === "edit") {
      newBoard[y][x] = { letter, state: "unlocked" }

      const nextCell = advance(x, y, direction, false)
      if (nextCell) {
        const [nextX, nextY] = nextCell
        const nextMode = newBoard[nextY][nextX].letter ? "select" : "edit"
        moveArrow(nextX, nextY, nextMode, direction)
      } else {
        moveArrow(x, y, "select", direction)
      }
    }

    updateBoard(newBoard)
  },
  [arrow, advance, board, moveArrow, updateBoard]
)

  // Arrow key navigation
  const handleSpecialKeys = useCallback(
    (key: string) => {
      const { x, y, mode, direction } = arrow
      if (mode === "hidden") return

      let newX = x
      let newY = y
      let newDir = direction

      if (key === "ArrowDown") {
        newY = Math.min(y + 1, BOARD_SIZE - 1)
        newDir = "vertical"
      } else if (key === "ArrowUp") {
        newY = Math.max(y - 1, 0)
        newDir = "vertical"
      } else if (key === "ArrowRight") {
        newX = Math.min(x + 1, BOARD_SIZE - 1)
        newDir = "horizontal"
      } else if (key === "ArrowLeft") {
        newX = Math.max(x - 1, 0)
        newDir = "horizontal"
      } else {
        return
      }

      const cell = board[newY][newX]
      const nextMode = cell.letter ? "select" : "edit"
      setArrow({ x: newX, y: newY, mode: nextMode, direction: newDir })
    },
    [arrow, board, setArrow]
  )

  // Keyboard event handling
  const handleKeydown = useCallback(
    (e: KeyboardEvent) => {
      const key = e.key
      if (key === "Enter") {
        const updated = board.map((row) =>
          row.map((cell) =>
            cell.letter && cell.state === "unlocked"
              ? { ...cell, state: "current" as TileState }
              : cell
          )
        )
        updateBoard(updated)
        setArrow((prev) => ({ ...prev, mode: "hidden" }))
      } else if (arrow.mode !== "hidden") {
        if (key === "Backspace" || key === "Delete") handleDelete()
        else if (/^[a-zA-Z]$/.test(key)) handleLetterInput(key.toUpperCase())
        else handleSpecialKeys(key)
      }
    },
    [
      arrow.mode,
      arrow,
      board,
      handleDelete,
      handleLetterInput,
      handleSpecialKeys,
      updateBoard,
    ]
  )

  useEffect(() => {
    document.addEventListener("keydown", handleKeydown)
    return () => document.removeEventListener("keydown", handleKeydown)
  }, [handleKeydown])

  return null
}
