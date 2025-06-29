// src/components/editors/EffectEditor.tsx

import { useMemo } from "react";
import type { Effect, SequenceNode } from "../../types/ScrabbleTypes";
import { effects } from "./effects";
import { computeBoardAtFrame } from "../../lib/engine";

interface EffectEditorProps {
    effect: Effect;
    onChange: (e: Effect) => void;
    frameIndex: number;
    rootSequence: SequenceNode;
    boardSize: number;
}

export function createEffect<T extends keyof typeof effects>(type: T): Effect {
    const def = effects[type];
    return {
        type,
        payload: def.initialPayload(),
    } as Effect;
}

export default function EffectEditor({
    effect,
    onChange,
    frameIndex,
    rootSequence,
    boardSize,
}: EffectEditorProps) {
    const liveBoard = useMemo(
        () => computeBoardAtFrame(rootSequence, frameIndex, boardSize),
        [rootSequence, frameIndex, boardSize]
    );

    return (
        <div className="effect-editor">
            {/* Dropdown to switch effect types */}
            <select
                value={effect.type}
                onChange={(e) => {
                    const newType = e.target.value as keyof typeof effects;
                    onChange(createEffect(newType));
                }}
            >
                {Object.keys(effects).map((type) => (
                    <option key={type} value={type}>
                        {type}
                    </option>
                ))}
            </select>

            {/* Render the editor for the current effect */}
            {effect.type === "play" && (
                <effects.play.Editor
                    key={`${effect.type}-${frameIndex}`}
                    payload={effect.payload}
                    onChange={(p) => onChange({ type: "play", payload: p })}
                    liveBoard={liveBoard}
                />
            )}
            {effect.type === "highlight" && (
                <effects.highlight.Editor
                    key={`${effect.type}-${frameIndex}`}
                    payload={effect.payload}
                    onChange={(p) =>
                        onChange({ type: "highlight", payload: p })
                    }
                    liveBoard={liveBoard}
                />
            )}
            {effect.type === "none" && (
                <effects.none.Editor
                    key={`${effect.type}-${frameIndex}`}
                    payload={effect.payload}
                    onChange={(p) => onChange({ type: "none", payload: p })}
                    liveBoard={liveBoard}
                />
            )}
        </div>
    );
}
