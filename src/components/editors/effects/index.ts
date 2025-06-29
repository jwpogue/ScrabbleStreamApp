// src/components/editors/effects/index.ts

import PlayEffectEditor from "./PlayEffectEditor"
import NoneEffectEditor from "./NoneEffectEditor"
import HighlightEffectEditor from "./HighlightEffectEditor"

import type {
  Effect,
  Tile
} from "../../../types/ScrabbleTypes"

type EffectType = Effect["type"]

// Base definition interface
export interface EffectDefinition<T extends EffectType> {
  type: T
  initialPayload: () => Extract<Effect, { type: T }>["payload"]
  Editor: React.FC<{
    payload: Extract<Effect, { type: T }>["payload"]
    onChange: (newPayload: Extract<Effect, { type: T }>["payload"]) => void
    liveBoard: Tile[][]
  }>
}

// Concrete typed object
export const effects: {
  play: EffectDefinition<"play">
  none: EffectDefinition<"none">
  highlight: EffectDefinition<"highlight">
} = {
  play: {
    type: "play",
    initialPayload: () => ({ tiles: [] }),
    Editor: PlayEffectEditor,
  },
  none: {
    type: "none",
    initialPayload: () => ({}),
    Editor: NoneEffectEditor,
  },
    highlight: {
    type: "highlight",
    initialPayload: () => ({ squares: [] }),
    Editor: HighlightEffectEditor, // or use a <div> placeholder
  },
}
