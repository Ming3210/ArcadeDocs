"use client";

import React, { useRef } from "react";
import { Trash2 } from "lucide-react";
import { PlaygroundShapeItem, ShapeType } from "@/components/pro/PlaygroundShape";

export const ARROW_PALETTE = [
  { hex: "#ff2a4b", label: "Retro Red" },
  { hex: "#00f0ff", label: "Neon Cyan" },
  { hex: "#f59e0b", label: "Cyber Amber" },
  { hex: "#39ff14", label: "Neon Lime" },
  { hex: "#ff007f", label: "Hot Pink" },
  { hex: "#a855f7", label: "Retro Purple" },
  { hex: "#ffffff", label: "Crisp White" },
];

export const isArrowConnector = (type: ShapeType): boolean => {
  return type === "line-arrow" || type === "arrow-bidirectional" || type === "line";
};

interface ArrowConnectorViewProps {
  shape: PlaygroundShapeItem;
  isSelected: boolean;
  zoom: number;
  isSpacePressed?: boolean;
  activeTool?: string;
  onSelect: (id: string, e?: React.MouseEvent) => void;
  onUpdateEndpoints: (
    id: string,
    startX: number,
    startY: number,
    endX: number,
    endY: number
  ) => void;
  onUpdateColor: (id: string, color: string) => void;
  onUpdateType: (id: string, type: ShapeType) => void;
  onUpdateStrokeDash?: (id: string, strokeDash: boolean) => void;
  onDelete: (id: string, e?: React.MouseEvent) => void;
}

export const ArrowConnectorView: React.FC<ArrowConnectorViewProps> = ({
  shape,
  isSelected,
  zoom,
  isSpacePressed = false,
  activeTool = "select",
  onSelect,
  onUpdateEndpoints,
  onUpdateColor,
  onUpdateType,
  onUpdateStrokeDash,
  onDelete,
}) => {
  // Resolve start & end coordinates (fallbacks for legacy shapes)
  const startX = shape.startX ?? shape.x;
  const startY = shape.startY ?? shape.y + (shape.height || 40) / 2;
  const endX = shape.endX ?? shape.x + (shape.width || 160);
  const endY = shape.endY ?? shape.y + (shape.height || 40) / 2;

  const dx = endX - startX;
  const dy = endY - startY;
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);
  const midX = (startX + endX) / 2;
  const midY = (startY + endY) / 2;

  const color = shape.color || "#ff2a4b";
  const hasArrowEnd = shape.type === "line-arrow" || shape.type === "arrow-bidirectional";
  const hasArrowStart = shape.type === "arrow-bidirectional";

  const angleRad = Math.atan2(dy, dx);
  // Pull shaft line slightly inward into the arrowhead body so strokeLinecap="round" won't poke through the sharp tip
  const shaftStartX = hasArrowStart ? startX + Math.cos(angleRad) * 10 : startX;
  const shaftStartY = hasArrowStart ? startY + Math.sin(angleRad) * 10 : startY;
  const shaftEndX = hasArrowEnd ? endX - Math.cos(angleRad) * 10 : endX;
  const shaftEndY = hasArrowEnd ? endY - Math.sin(angleRad) * 10 : endY;

  // Drag Whole Arrow
  const handleShaftMouseDown = (e: React.MouseEvent) => {
    if (activeTool === "hand" || isSpacePressed) return;
    e.stopPropagation();
    onSelect(shape.id, e);

    const startClientX = e.clientX;
    const startClientY = e.clientY;
    const initialStartX = startX;
    const initialStartY = startY;
    const initialEndX = endX;
    const initialEndY = endY;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = (moveEvent.clientX - startClientX) / zoom;
      const deltaY = (moveEvent.clientY - startClientY) / zoom;
      const newStartX = Math.round(initialStartX + deltaX);
      const newStartY = Math.round(initialStartY + deltaY);
      const newEndX = Math.round(initialEndX + deltaX);
      const newEndY = Math.round(initialEndY + deltaY);
      onUpdateEndpoints(shape.id, newStartX, newStartY, newEndX, newEndY);
    };

    const onMouseUp = () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  // Drag Handle A (Start point / Tail)
  const handleStartHandleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(shape.id, e);

    const startClientX = e.clientX;
    const startClientY = e.clientY;
    const initialStartX = startX;
    const initialStartY = startY;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = (moveEvent.clientX - startClientX) / zoom;
      const deltaY = (moveEvent.clientY - startClientY) / zoom;
      const newStartX = Math.round(initialStartX + deltaX);
      const newStartY = Math.round(initialStartY + deltaY);
      onUpdateEndpoints(shape.id, newStartX, newStartY, endX, endY);
    };

    const onMouseUp = () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  // Drag Handle B (End point / Head)
  const handleEndHandleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(shape.id, e);

    const startClientX = e.clientX;
    const startClientY = e.clientY;
    const initialEndX = endX;
    const initialEndY = endY;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = (moveEvent.clientX - startClientX) / zoom;
      const deltaY = (moveEvent.clientY - startClientY) / zoom;
      const newEndX = Math.round(initialEndX + deltaX);
      const newEndY = Math.round(initialEndY + deltaY);
      onUpdateEndpoints(shape.id, startX, startY, newEndX, newEndY);
    };

    const onMouseUp = () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  return (
    <>
      {/* SVG Canvas Connector Line & Arrowheads */}
      <svg
        className="absolute top-0 left-0 w-full h-full overflow-visible pointer-events-none z-10"
        style={{ width: "1px", height: "1px" }}
      >
        <g>
          {/* Broad Invisible Hitbox Line for Easy Selection & Dragging */}
          <line
            x1={startX}
            y1={startY}
            x2={endX}
            y2={endY}
            stroke="transparent"
            strokeWidth={20}
            strokeLinecap="round"
            className="pointer-events-auto cursor-grab active:cursor-grabbing"
            onMouseDown={handleShaftMouseDown}
          />

          {/* Under-shadow for crisp 8-bit depth */}
          <line
            x1={shaftStartX}
            y1={shaftStartY + 2}
            x2={shaftEndX}
            y2={shaftEndY + 2}
            stroke="#000000"
            strokeWidth={4.5}
            strokeDasharray={shape.strokeDash ? "6 6" : undefined}
            strokeLinecap="round"
            opacity={0.7}
          />

          {/* Visible Arrow Shaft */}
          <line
            x1={shaftStartX}
            y1={shaftStartY}
            x2={shaftEndX}
            y2={shaftEndY}
            stroke={color}
            strokeWidth={3.5}
            strokeDasharray={shape.strokeDash ? "6 6" : undefined}
            strokeLinecap="round"
            className="pointer-events-auto cursor-grab active:cursor-grabbing"
            onMouseDown={handleShaftMouseDown}
          />

          {/* Arrowhead at Target (End) */}
          {hasArrowEnd && (
            <g transform={`translate(${endX}, ${endY}) rotate(${angle})`}>
              {/* Drop shadow for arrowhead */}
              <polygon
                points="0,1.5 -18,-7 -18,10"
                fill="#000000"
                opacity={0.6}
              />
              {/* Main Arrowhead: clean, sharp flat-base triangle matching user's image */}
              <polygon
                points="0,0 -18,-8.5 -18,8.5"
                fill={color}
                stroke="#000000"
                strokeWidth={1.5}
                strokeLinejoin="round"
                className="pointer-events-auto cursor-grab active:cursor-grabbing"
                onMouseDown={handleShaftMouseDown}
              />
            </g>
          )}

          {/* Arrowhead at Origin (Start) for Bidirectional Arrow */}
          {hasArrowStart && (
            <g transform={`translate(${startX}, ${startY}) rotate(${angle + 180})`}>
              <polygon
                points="0,1.5 -18,-7 -18,10"
                fill="#000000"
                opacity={0.6}
              />
              <polygon
                points="0,0 -18,-8.5 -18,8.5"
                fill={color}
                stroke="#000000"
                strokeWidth={1.5}
                strokeLinejoin="round"
                className="pointer-events-auto cursor-grab active:cursor-grabbing"
                onMouseDown={handleShaftMouseDown}
              />
            </g>
          )}

          {/* Selection Control Handles (2 White Endpoint Dots like in user's image) */}
          {isSelected && (
            <>
              {/* Handle A: Start Point */}
              <circle
                cx={startX}
                cy={startY}
                r={6}
                fill="#ffffff"
                stroke="#000000"
                strokeWidth={2}
                className="pointer-events-auto cursor-move hover:scale-125 transition-transform"
                onMouseDown={handleStartHandleMouseDown}
              />

              {/* Handle B: End Point */}
              <circle
                cx={endX}
                cy={endY}
                r={6}
                fill="#ffffff"
                stroke="#000000"
                strokeWidth={2}
                className="pointer-events-auto cursor-move hover:scale-125 transition-transform"
                onMouseDown={handleEndHandleMouseDown}
              />
            </>
          )}
        </g>
      </svg>

      {/* Floating Retro Inspector Toolbar positioned comfortably above the arrow */}
      {isSelected && (
        <div
          onMouseDown={(e) => e.stopPropagation()}
          className="absolute z-40 flex items-center gap-1.5 retro-window-frame bg-[#0d101a] px-2 py-1 shadow-[3px_3px_0_0_#000] text-xs font-mono select-none pointer-events-auto whitespace-nowrap"
          style={{
            left: `${midX}px`,
            top: `${Math.min(startY, endY) - 34}px`,
            transform: "translate(-50%, -100%)",
          }}
        >
          {/* Color Swatches */}
          <div className="flex items-center gap-1">
            {ARROW_PALETTE.map((c) => (
              <button
                key={c.hex}
                type="button"
                onClick={() => onUpdateColor(shape.id, c.hex)}
                className={`w-3.5 h-3.5 border border-black transition-transform hover:scale-125 cursor-pointer ${
                  color === c.hex ? "ring-2 ring-white scale-110" : ""
                }`}
                style={{ backgroundColor: c.hex }}
                title={c.label}
              />
            ))}
          </div>

          <div className="retro-divider-v h-4" />

          {/* Type Toggle: 1 Head vs 2 Heads vs Simple Line */}
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={() => onUpdateType(shape.id, "line-arrow")}
              className={`px-1.5 py-0.5 text-[10px] cursor-pointer font-pixel ${
                shape.type === "line-arrow"
                  ? "retro-btn-active border border-cyan-400"
                  : "retro-btn hover:border-slate-500"
              }`}
              title="Mũi tên 1 đầu (➔)"
            >
              ➔
            </button>
            <button
              type="button"
              onClick={() => onUpdateType(shape.id, "arrow-bidirectional")}
              className={`px-1.5 py-0.5 text-[10px] cursor-pointer font-pixel ${
                shape.type === "arrow-bidirectional"
                  ? "retro-btn-active border border-cyan-400"
                  : "retro-btn hover:border-slate-500"
              }`}
              title="Mũi tên 2 đầu (⬌)"
            >
              ⬌
            </button>
            <button
              type="button"
              onClick={() => onUpdateType(shape.id, "line")}
              className={`px-1.5 py-0.5 text-[10px] cursor-pointer font-pixel ${
                shape.type === "line"
                  ? "retro-btn-active border border-cyan-400"
                  : "retro-btn hover:border-slate-500"
              }`}
              title="Đường thẳng (─)"
            >
              ─
            </button>
          </div>

          <div className="retro-divider-v h-4" />

          {/* Stroke Dash Toggle */}
          <button
            type="button"
            onClick={() => onUpdateStrokeDash?.(shape.id, !shape.strokeDash)}
            className={`px-1.5 py-0.5 text-[9px] cursor-pointer font-pixel ${
              shape.strokeDash
                ? "retro-btn-active border border-cyan-400"
                : "retro-btn hover:border-slate-500"
            }`}
            title="Đổi nét đứt / nét liền"
          >
            {shape.strokeDash ? "NÉT ĐỨT" : "NÉT LIỀN"}
          </button>

          <div className="retro-divider-v h-4" />

          {/* Delete Button */}
          <button
            type="button"
            onClick={(e) => onDelete(shape.id, e)}
            className="retro-btn-danger p-1 cursor-pointer"
            title="Xóa mũi tên (Delete)"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </>
  );
};
