// src/components/editors/FrameEditor.tsx

import { useCallback } from "react";
import BoardEditor from "./BoardEditor";
import { BOARD_SIZE } from "../../lib/boardUtils";
import type { FrameNode, Tile } from "../../types/ScrabbleTypes";

interface FrameEditorProps {
    frame: FrameNode;
    updateFrame: (updated: Partial<FrameNode>) => void;
}

const createEmptyBoard = (): Tile[][] =>
    Array.from({ length: BOARD_SIZE }, () =>
        Array.from({ length: BOARD_SIZE }, () => ({
            letter: null,
            state: "unlocked" as const,
        }))
    );

export default function FrameEditor({ frame, updateFrame }: FrameEditorProps) {
    const board = frame.board ?? createEmptyBoard();

    const handleTransitionChange = (
        field: "transitionIn" | "transitionOut",
        key: string,
        value: any
    ) => {
        const current = frame[field] ?? { type: "none", duration: 0 };
        updateFrame({ [field]: { ...current, [key]: value } });
    };

    return (
        <div className="frame-editor">
            <h3>Frame Editor</h3>

            <BoardEditor
                frame={{ ...frame, board }}
                updateFrame={updateFrame}
            />

            <div className="transitions">
                <h4>Transition In</h4>
                <label>
                    Type:
                    <select
                        value={frame.transitionIn?.type || "none"}
                        onChange={(e) =>
                            handleTransitionChange(
                                "transitionIn",
                                "type",
                                e.target.value
                            )
                        }
                    >
                        <option value="none">None</option>
                        <option value="fade">Fade</option>
                        <option value="slide">Slide</option>
                    </select>
                </label>

                <label>
                    Duration:
                    <input
                        type="number"
                        value={frame.transitionIn?.duration || 0}
                        onChange={(e) =>
                            handleTransitionChange(
                                "transitionIn",
                                "duration",
                                Number(e.target.value)
                            )
                        }
                    />
                </label>

                <h4>Transition Out</h4>
                <label>
                    Type:
                    <select
                        value={frame.transitionOut?.type || "none"}
                        onChange={(e) =>
                            handleTransitionChange(
                                "transitionOut",
                                "type",
                                e.target.value
                            )
                        }
                    >
                        <option value="none">None</option>
                        <option value="fade">Fade</option>
                        <option value="slide">Slide</option>
                    </select>
                </label>

                <label>
                    Duration:
                    <input
                        type="number"
                        value={frame.transitionOut?.duration || 0}
                        onChange={(e) =>
                            handleTransitionChange(
                                "transitionOut",
                                "duration",
                                Number(e.target.value)
                            )
                        }
                    />
                </label>
            </div>
        </div>
    );
}
