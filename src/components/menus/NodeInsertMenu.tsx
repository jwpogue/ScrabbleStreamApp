import React, { useState, useEffect, useRef } from "react";
import type { ChronologyType, AdditivityType, Effect } from "../../types/ScrabbleTypes";
import "../../styles/NodeInsertMenu.css";

interface NodeInsertMenuProps {
  x: number;
  y: number;
  type: "frame" | "sequence";
  onAdd: (options: { effectType?: Effect["type"]; chronologyType?: ChronologyType; additivityType?: AdditivityType }) => void;
  onCancel: () => void;
}

export default function NodeInsertMenu({ x, y, type, onAdd, onCancel }: NodeInsertMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  const [effectType, setEffectType] = useState<Effect["type"]>("play");
  const [chronologyType, setChronologyType] = useState<ChronologyType>("consecutive");
  const [additivityType, setAdditivityType] = useState<AdditivityType>("cumulative");

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onCancel();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onCancel]);

  const handleAdd = () => {
    if (type === "frame") {
      onAdd({ effectType });
    } else {
      onAdd({ chronologyType, additivityType });
    }
  };

  return (
    <div className="node-insert-menu" style={{ top: y, left: x }} ref={menuRef}>
      <h4>Add {type === "frame" ? "Frame" : "Sequence"}</h4>
      {type === "frame" ? (
        <label>
          Effect:
          <select value={effectType} onChange={(e) => setEffectType(e.target.value as Effect["type"]) }>
            <option value="play">Play</option>
            <option value="highlight-tile">Highlight Tile</option>
            <option value="highlight-area">Highlight Area</option>
            <option value="show-potential-play">Show Potential Play</option>
            <option value="none">None</option>
          </select>
        </label>
      ) : (
        <>
          <label>
            Chronology:
            <select value={chronologyType} onChange={(e) => setChronologyType(e.target.value as ChronologyType)}>
              <option value="consecutive">Consecutive</option>
              <option value="simultaneous">Simultaneous</option>
            </select>
          </label>
          <label>
            Additivity:
            <select value={additivityType} onChange={(e) => setAdditivityType(e.target.value as AdditivityType)}>
              <option value="cumulative">Cumulative</option>
              <option value="temporary">Temporary</option>
            </select>
          </label>
        </>
      )}
      <div className="menu-buttons">
        <button onClick={handleAdd}>Add</button>
        <button onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}