"use client";

import React, { useRef, useEffect } from "react";
import {
  Trash2,
  ChevronDown,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from "lucide-react";

const RetroAlignTopIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" className="w-3.5 h-3.5 fill-current">
    <rect x="1" y="2" width="12" height="1.5" />
    <rect x="3" y="5.5" width="8" height="1" opacity="0.8" />
    <rect x="3" y="8" width="5" height="1" opacity="0.8" />
  </svg>
);

const RetroAlignMiddleIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" className="w-3.5 h-3.5 fill-current">
    <rect x="3" y="3" width="8" height="1" opacity="0.8" />
    <rect x="1" y="6.25" width="12" height="1.5" />
    <rect x="3" y="9.5" width="8" height="1" opacity="0.8" />
  </svg>
);

export type ShapeType =
  | "line-arrow"
  | "arrow-bidirectional"
  | "arrow-curved"
  | "line"
  | "line-curved"
  | "rectangle"
  | "rounded-rect"
  | "circle"
  | "diamond"
  | "triangle"
  | "right-triangle"
  | "pentagon"
  | "hexagon"
  | "arrow-right"
  | "arrow-left"
  | "arrow-up"
  | "arrow-down"
  | "star"
  | "star-4"
  | "speech-bubble"
  | "cloud-bubble"
  | "heart";

export interface PlaygroundShapeItem {
  id: string;
  type: ShapeType;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  fillColor?: string;
  content: string;
  fontSize?: number;
  fontFamily?: string;
  textColor?: string;
  textAlign?: "left" | "center" | "right";
  verticalAlign?: "top" | "center" | "bottom";
  startX?: number;
  startY?: number;
  endX?: number;
  endY?: number;
  strokeDash?: boolean;
}

export const SHAPES_LIST: Array<{ type: ShapeType; label: string }> = [
  { type: "line-arrow", label: "Mũi tên chỉ hướng" },
  { type: "arrow-bidirectional", label: "Mũi tên 2 đầu" },
  { type: "arrow-curved", label: "Mũi tên cong" },
  { type: "line", label: "Đường kẻ ngang" },
  { type: "line-curved", label: "Đường cong sóng" },
  { type: "circle", label: "Hình tròn / Elip" },
  { type: "rectangle", label: "Hình chữ nhật" },
  { type: "rounded-rect", label: "Chữ nhật bo góc" },
  { type: "diamond", label: "Hình thoi" },
  { type: "triangle", label: "Tam giác đều" },
  { type: "right-triangle", label: "Tam giác vuông" },
  { type: "pentagon", label: "Ngũ giác" },
  { type: "hexagon", label: "Lục giác" },
  { type: "arrow-right", label: "Mũi tên khối phải" },
  { type: "arrow-left", label: "Mũi tên khối trái" },
  { type: "arrow-up", label: "Mũi tên khối lên" },
  { type: "arrow-down", label: "Mũi tên khối xuống" },
  { type: "star", label: "Ngôi sao 5 cánh" },
  { type: "star-4", label: "Sao 4 cánh" },
  { type: "speech-bubble", label: "Bóng thoại" },
  { type: "cloud-bubble", label: "Đám mây" },
  { type: "heart", label: "Trái tim" },
];

export const NEON_COLORS = [
  { hex: "#00f0ff", label: "Neon Cyan" },
  { hex: "#ff007f", label: "Hot Pink" },
  { hex: "#39ff14", label: "Neon Lime" },
  { hex: "#ffe600", label: "Cyber Yellow" },
  { hex: "#a855f7", label: "Retro Purple" },
  { hex: "#ffffff", label: "Crisp White" },
];

/**
 * Render Vector SVG geometry for any ShapeType
 */
export const renderShapeSvgGeometry = (
  type: ShapeType,
  color: string,
  fillColor: string = "rgba(18, 17, 40, 0.75)"
) => {
  const commonProps = {
    stroke: color,
    strokeWidth: "2.5",
    fill: fillColor,
    vectorEffect: "non-scaling-stroke" as const,
    strokeLinejoin: "round" as const,
    strokeLinecap: "round" as const,
  };

  switch (type) {
    case "line-arrow":
      return (
        <g>
          <line x1="6" y1="50" x2="80" y2="50" {...commonProps} strokeWidth="3.5" />
          <polygon points="76,36 96,50 76,64" fill={color} stroke="none" />
        </g>
      );
    case "arrow-bidirectional":
      return (
        <g>
          <polygon points="24,36 4,50 24,64" fill={color} stroke="none" />
          <line x1="20" y1="50" x2="80" y2="50" {...commonProps} strokeWidth="3.5" />
          <polygon points="76,36 96,50 76,64" fill={color} stroke="none" />
        </g>
      );
    case "arrow-curved":
      return (
        <g>
          <path
            d="M 12,84 Q 12,42 46,42 L 78,42"
            fill="none"
            stroke={color}
            strokeWidth="3.5"
            vectorEffect="non-scaling-stroke"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <polygon points="74,28 96,42 74,56" fill={color} stroke="none" />
        </g>
      );
    case "line":
      return <line x1="4" y1="50" x2="96" y2="50" {...commonProps} strokeWidth="3.5" />;
    case "line-curved":
      return (
        <path
          d="M 6,50 C 26,16 34,84 54,50 C 70,22 78,78 94,50"
          fill="none"
          stroke={color}
          strokeWidth="3.5"
          vectorEffect="non-scaling-stroke"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      );
    case "rectangle":
      return <rect x="3" y="3" width="94" height="94" rx="2" ry="2" {...commonProps} />;
    case "rounded-rect":
      return <rect x="3" y="3" width="94" height="94" rx="16" ry="16" {...commonProps} />;
    case "circle":
      return <ellipse cx="50" cy="50" rx="47" ry="47" {...commonProps} />;
    case "diamond":
      return <polygon points="50,3 97,50 50,97 3,50" {...commonProps} />;
    case "triangle":
      return <polygon points="50,4 97,96 3,96" {...commonProps} />;
    case "right-triangle":
      return <polygon points="4,4 96,96 4,96" {...commonProps} />;
    case "pentagon":
      return <polygon points="50,4 97,38 79,96 21,96 3,38" {...commonProps} />;
    case "hexagon":
      return <polygon points="25,4 75,4 97,50 75,96 25,96 3,50" {...commonProps} />;
    case "arrow-right":
      return <polygon points="4,34 58,34 58,12 96,50 58,88 58,66 4,66" {...commonProps} />;
    case "arrow-left":
      return <polygon points="96,34 42,34 42,12 4,50 42,88 42,66 96,66" {...commonProps} />;
    case "arrow-up":
      return <polygon points="34,96 34,42 12,42 50,4 88,42 66,42 66,96" {...commonProps} />;
    case "arrow-down":
      return <polygon points="34,4 34,58 12,58 50,96 88,58 66,58 66,4" {...commonProps} />;
    case "star":
      return (
        <polygon
          points="50,3 64,35 98,36 71,57 81,91 50,71 19,91 29,57 2,36 36,35"
          {...commonProps}
        />
      );
    case "star-4":
      return (
        <path
          d="M50,2 Q50,50 98,50 Q50,50 50,98 Q50,50 2,50 Q50,50 50,2 Z"
          {...commonProps}
        />
      );
    case "speech-bubble":
      return (
        <path
          d="M4,10 A8,8 0 0,1 12,2 H88 A8,8 0 0,1 96,10 V64 A8,8 0 0,1 88,72 H30 L10,94 V72 H12 A8,8 0 0,1 4,64 Z"
          {...commonProps}
        />
      );
    case "cloud-bubble":
      return (
        <path
          d="M28,66 A18,18 0 0,1 14,38 A20,20 0 0,1 32,20 A24,24 0 0,1 68,18 A20,20 0 0,1 88,36 A18,18 0 0,1 82,64 A16,16 0 0,1 64,74 A18,18 0 0,1 44,74 A16,16 0 0,1 28,66 Z"
          {...commonProps}
        />
      );
    case "heart":
      return (
        <path
          d="M50,88 C20,62 4,46 4,26 A22,22 0 0,1 50,20 A22,22 0 0,1 96,26 C96,46 80,62 50,88 Z"
          {...commonProps}
        />
      );
    default:
      return <rect x="3" y="3" width="94" height="94" rx="4" {...commonProps} />;
  }
};

/**
 * Safe Padding Styles to ensure text stays neatly inside each shape's boundary
 */
export const getShapeTextContainerStyle = (type: ShapeType): React.CSSProperties => {
  switch (type) {
    case "circle":
      return { top: "18%", left: "18%", right: "18%", bottom: "18%" };
    case "diamond":
      return { top: "24%", left: "24%", right: "24%", bottom: "24%" };
    case "triangle":
      return { top: "36%", left: "22%", right: "22%", bottom: "10%" };
    case "right-triangle":
      return { top: "38%", left: "12%", right: "38%", bottom: "10%" };
    case "pentagon":
      return { top: "24%", left: "18%", right: "18%", bottom: "14%" };
    case "hexagon":
      return { top: "16%", left: "20%", right: "20%", bottom: "16%" };
    case "arrow-right":
      return { top: "34%", left: "8%", right: "40%", bottom: "34%" };
    case "arrow-left":
      return { top: "34%", left: "40%", right: "8%", bottom: "34%" };
    case "arrow-up":
      return { top: "42%", left: "34%", right: "34%", bottom: "8%" };
    case "arrow-down":
      return { top: "8%", left: "34%", right: "34%", bottom: "42%" };
    case "star":
      return { top: "28%", left: "28%", right: "28%", bottom: "26%" };
    case "star-4":
      return { top: "26%", left: "26%", right: "26%", bottom: "26%" };
    case "speech-bubble":
      return { top: "10%", left: "12%", right: "12%", bottom: "32%" };
    case "cloud-bubble":
      return { top: "22%", left: "18%", right: "18%", bottom: "28%" };
    case "heart":
      return { top: "24%", left: "18%", right: "18%", bottom: "26%" };
    case "line-arrow":
    case "arrow-bidirectional":
    case "arrow-curved":
    case "line":
    case "line-curved":
      return { top: "15%", left: "10%", right: "10%", bottom: "15%" };
    case "rounded-rect":
      return { top: "10%", left: "10%", right: "10%", bottom: "10%" };
    case "rectangle":
    default:
      return { top: "10px", left: "12px", right: "12px", bottom: "10px" };
  }
};

/**
 * Mini SVG Icon renderer for Shape Palette grid button
 */
export const ShapeMiniIcon: React.FC<{
  type: ShapeType;
  size?: number;
  color?: string;
  className?: string;
}> = ({ type, size = 20, color = "currentColor", className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    className={`overflow-visible inline-block shrink-0 ${className}`}
  >
    {renderShapeSvgGeometry(type, color, "none")}
  </svg>
);

/**
 * ShapeItemView: The interactive on-canvas shape note component
 */
interface ShapeItemViewProps {
  shape: PlaygroundShapeItem;
  isSelected: boolean;
  onSelect: (id: string, e?: React.MouseEvent) => void;
  onMouseDown: (e: React.MouseEvent, id: string, x: number, y: number) => void;
  onResizeMouseDown: (e: React.MouseEvent, id: string, width: number, height: number) => void;
  onUpdateContent: (id: string, content: string) => void;
  onUpdateColor: (id: string, color: string) => void;
  onUpdateType: (id: string, type: ShapeType) => void;
  onUpdateTextAlign?: (id: string, align: "left" | "center" | "right") => void;
  onUpdateVerticalAlign?: (id: string, align: "top" | "center" | "bottom") => void;
  onDelete: (id: string, e?: React.MouseEvent) => void;
  onCheckSelection: (refKey: string) => void;
  onFocusElement?: (refKey: string) => void;
  contentRefs: React.MutableRefObject<{ [key: string]: HTMLDivElement | null }>;
}

export const ShapeItemView: React.FC<ShapeItemViewProps> = ({
  shape,
  isSelected,
  onSelect,
  onMouseDown,
  onResizeMouseDown,
  onUpdateContent,
  onUpdateColor,
  onUpdateType,
  onUpdateTextAlign,
  onUpdateVerticalAlign,
  onDelete,
  onCheckSelection,
  onFocusElement,
  contentRefs,
}) => {
  const textRef = useRef<HTMLDivElement>(null);
  const isTypingRef = useRef(false);
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = React.useState(false);
  const refKey = shape.id;

  useEffect(() => {
    contentRefs.current[refKey] = textRef.current;
    return () => {
      delete contentRefs.current[refKey];
    };
  }, [refKey, contentRefs]);

  useEffect(() => {
    if (textRef.current && !isTypingRef.current) {
      if (textRef.current.innerHTML !== shape.content) {
        textRef.current.innerHTML = shape.content || "";
      }
    }
  }, [shape.content]);

  const safeStyle = getShapeTextContainerStyle(shape.type);

  // Default to top-left text position
  const textAlign = shape.textAlign || "left";
  const verticalAlign = shape.verticalAlign || "top";

  const vClass =
    verticalAlign === "center"
      ? "items-center"
      : verticalAlign === "bottom"
      ? "items-end"
      : "items-start";

  const hJustifyClass =
    textAlign === "center"
      ? "justify-center"
      : textAlign === "right"
      ? "justify-end"
      : "justify-start";

  const hTextClass =
    textAlign === "center"
      ? "text-center"
      : textAlign === "right"
      ? "text-right"
      : "text-left";

  return (
    <div
      onClick={(e) => onSelect(shape.id, e)}
      onMouseDown={(e) => onMouseDown(e, shape.id, shape.x, shape.y)}
      className={`absolute select-none pointer-events-auto group/shape transition-shadow ${
        isSelected
          ? "outline outline-2 outline-cyan-400 shadow-[3px_3px_0_0_#00f0ff80]"
          : "hover:outline hover:outline-1 hover:outline-slate-600"
      }`}
      style={{
        left: `${shape.x}px`,
        top: `${shape.y}px`,
        width: `${shape.width}px`,
        height: `${shape.height}px`,
        cursor: "grab",
      }}
    >
      {/* FLOATING ACTION TOOLBAR WHEN SHAPE IS SELECTED */}
      {isSelected && (
        <div
          onMouseDown={(e) => e.stopPropagation()}
          className="absolute -top-10 left-1/2 -translate-x-1/2 flex items-center gap-1.5 retro-window-frame bg-[#0d101a] px-2 py-1 shadow-[3px_3px_0_0_#000] z-30 text-xs font-mono select-none whitespace-nowrap"
        >
          {/* Pixel Color Swatches */}
          <div className="flex items-center gap-1">
            {NEON_COLORS.map((c) => (
              <button
                key={c.hex}
                type="button"
                onClick={() => onUpdateColor(shape.id, c.hex)}
                className={`w-3.5 h-3.5 border border-black transition-transform hover:scale-125 cursor-pointer ${
                  shape.color === c.hex ? "ring-2 ring-white scale-110" : ""
                }`}
                style={{ backgroundColor: c.hex }}
                title={c.label}
              />
            ))}
          </div>

          <div className="retro-divider-v h-4" />

          {/* Vertical Align Toggle (Top vs Center) */}
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={() => onUpdateVerticalAlign?.(shape.id, "top")}
              className={`p-1 cursor-pointer transition ${
                verticalAlign === "top"
                  ? "retro-btn-active border border-cyan-400"
                  : "retro-btn hover:border-slate-500"
              }`}
              title="Viết chữ từ ĐỈNH (Top)"
            >
              <RetroAlignTopIcon />
            </button>
            <button
              type="button"
              onClick={() => onUpdateVerticalAlign?.(shape.id, "center")}
              className={`p-1 cursor-pointer transition ${
                verticalAlign === "center"
                  ? "retro-btn-active border border-cyan-400"
                  : "retro-btn hover:border-slate-500"
              }`}
              title="Viết chữ GIỮA DỌC (Center Vertical)"
            >
              <RetroAlignMiddleIcon />
            </button>
          </div>

          <div className="retro-divider-v h-4" />

          {/* Horizontal Align (Left vs Center vs Right) */}
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={() => onUpdateTextAlign?.(shape.id, "left")}
              className={`p-1 cursor-pointer transition ${
                textAlign === "left"
                  ? "retro-btn-active border border-cyan-400"
                  : "retro-btn hover:border-slate-500"
              }`}
              title="Căn lề TRÁI (Left / Đầu dòng)"
            >
              <AlignLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onUpdateTextAlign?.(shape.id, "center")}
              className={`p-1 cursor-pointer transition ${
                textAlign === "center"
                  ? "retro-btn-active border border-cyan-400"
                  : "retro-btn hover:border-slate-500"
              }`}
              title="Căn GIỮA NGANG (Center)"
            >
              <AlignCenter className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onUpdateTextAlign?.(shape.id, "right")}
              className={`p-1 cursor-pointer transition ${
                textAlign === "right"
                  ? "retro-btn-active border border-cyan-400"
                  : "retro-btn hover:border-slate-500"
              }`}
              title="Căn lề PHẢI (Right)"
            >
              <AlignRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="retro-divider-v h-4" />

          {/* Quick Shape Switcher */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
              className="retro-btn flex items-center gap-1 px-1.5 py-0.5 text-[10px] cursor-pointer"
              title="Đổi loại hình khối"
            >
              <ShapeMiniIcon type={shape.type} size={13} />
              <ChevronDown className="w-2.5 h-2.5 text-slate-400" />
            </button>

            {isTypeDropdownOpen && (
              <div
                className="absolute top-full mt-1.5 left-0 retro-window-frame bg-[#0d101a] p-2 w-48 shadow-2xl z-40 grid grid-cols-4 gap-1"
                onClick={(e) => e.stopPropagation()}
              >
                {SHAPES_LIST.map((s) => (
                  <button
                    key={s.type}
                    type="button"
                    onClick={() => {
                      onUpdateType(shape.id, s.type);
                      setIsTypeDropdownOpen(false);
                    }}
                    className={`p-1 flex items-center justify-center cursor-pointer transition ${
                      shape.type === s.type
                        ? "retro-btn-active border border-cyan-400"
                        : "retro-btn hover:border-slate-500"
                    }`}
                    title={s.label}
                  >
                    <ShapeMiniIcon type={s.type} size={16} />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="retro-divider-v h-4" />

          {/* Delete Button */}
          <button
            type="button"
            onClick={(e) => onDelete(shape.id, e)}
            className="retro-btn-danger p-1 cursor-pointer"
            title="Xóa hình khối (Delete)"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* SVG Vector Background */}
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="w-full h-full pointer-events-none drop-shadow-md"
      >
        {renderShapeSvgGeometry(
          shape.type,
          shape.color,
          shape.fillColor || "rgba(14, 18, 30, 0.85)"
        )}
      </svg>

      {/* Safe Text Container with Top-Left / Configurable Alignment */}
      <div
        className={`absolute flex ${vClass} ${hJustifyClass} overflow-hidden pointer-events-auto`}
        style={safeStyle}
      >
        <div
          ref={textRef}
          contentEditable
          suppressContentEditableWarning
          data-placeholder="Nhập chữ..."
          onFocus={() => {
            isTypingRef.current = true;
            onFocusElement?.(refKey);
          }}
          onBlur={(e) => {
            isTypingRef.current = false;
            onUpdateContent(shape.id, e.currentTarget.innerHTML);
          }}
          onInput={(e) => {
            onUpdateContent(shape.id, e.currentTarget.innerHTML);
          }}
          onMouseUp={() => onCheckSelection(refKey)}
          onKeyUp={() => onCheckSelection(refKey)}
          onMouseDown={(e) => e.stopPropagation()}
          className={`w-full max-h-full overflow-y-auto ${hTextClass} focus:outline-none select-text cursor-text leading-snug break-words px-1 py-0.5 empty:before:content-[attr(data-placeholder)] empty:before:text-slate-500 empty:before:italic`}
          style={{
            color: shape.textColor || "#ffffff",
            fontSize: shape.fontSize ? `${shape.fontSize}px` : "12px",
            fontFamily: shape.fontFamily || "'JetBrains Mono', monospace",
            textShadow: "0 1px 2px rgba(0,0,0,0.9)",
          }}
        />
      </div>

      {/* Corner Resize Handle */}
      <div
        onMouseDown={(e) => onResizeMouseDown(e, shape.id, shape.width, shape.height)}
        className="absolute -bottom-1.5 -right-1.5 w-5 h-5 cursor-se-resize flex items-end justify-end p-0.5 z-20 group/resizer"
        title="Kéo góc này để thay đổi kích thước"
      >
        <div
          className="w-2.5 h-2.5 border border-black shadow-xs"
          style={{ backgroundColor: shape.color }}
        />
      </div>
    </div>
  );
};
