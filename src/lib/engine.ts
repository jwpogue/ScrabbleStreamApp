import type {
  Tile,
  Effect,
  FrameNode,
  SequenceNode,
  ScrabbleNode,
  PlayEffect,
  HighlightEffect,
} from "../types/ScrabbleTypes"

import { generateEmptyBoard } from "./boardUtils"

// --- Type Guards ---

export function isFrameNode(node: ScrabbleNode): node is FrameNode {
  return "effect" in node
}

export function isSequenceNode(node: ScrabbleNode): node is SequenceNode {
  return "children" in node
}

// --- Flatten Tree ---

export function flattenFrames(node: ScrabbleNode): FrameNode[] {
  if (isFrameNode(node)) return [node]
  if (isSequenceNode(node)) {
    return node.children.flatMap(flattenFrames)
  }
  return []
}

// --- Frame Index ---

export function findFrameIndex(frame: FrameNode, root: SequenceNode): number {
  const allFrames = flattenFrames(root)
  return allFrames.findIndex((f) => f.id === frame.id)
}

// --- Effect Application ---

export function applyEffect(board: Tile[][], effect: Effect): Tile[][] {
  const newBoard = board.map((row) => row.map((cell) => ({ ...cell })))

  switch (effect.type) {
    case "play": {
      const payload = effect.payload as PlayEffect
      for (const { x, y } of payload.tiles) {
        newBoard[y][x] = {
          letter: payload.tiles.find((t) => t.x === x && t.y === y)?.letter ?? null,
          state: "locked",
        }
      }
      break
    }

    case "highlight": {
      const payload = effect.payload as HighlightEffect
      for (const { x, y } of payload.squares) {
        newBoard[y][x] = { ...newBoard[y][x], state: "current" }
      }
      break
    }

    case "none": {
      break
    }
  }

  return newBoard
}

// --- Board Computation Logic ---

function computeBoardFromSequence(
  sequence: SequenceNode,
  board: Tile[][],
  frameTargetIndex: number,
  frameCounter: { count: number }
): Tile[][] {
  for (const child of sequence.children) {
    if (isFrameNode(child)) {
      if (frameCounter.count === frameTargetIndex) {
        return applyEffect(board, child.effect)
      }

      board =
        sequence.additivityType === "cumulative"
          ? applyEffect(board, child.effect)
          : generateEmptyBoard(board.length)

      frameCounter.count++
    } else if (isSequenceNode(child)) {
      board = computeBoardFromSequence(
        child,
        board,
        frameTargetIndex,
        frameCounter
      )
      if (frameCounter.count > frameTargetIndex) return board
    }
  }
  return board
}

export function computeBoardAtFrame(
  root: SequenceNode,
  frameIndex: number,
  boardSize: number
): Tile[][] {
  const emptyBoard = generateEmptyBoard(boardSize)
  return computeBoardFromSequence(root, emptyBoard, frameIndex, { count: 0 })
}
