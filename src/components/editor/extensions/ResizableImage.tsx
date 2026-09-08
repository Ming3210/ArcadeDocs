"use client";

import React, { useState, useRef, useEffect } from "react";
import { NodeViewWrapper, NodeViewProps, ReactNodeViewRenderer } from "@tiptap/react";
import Image from "@tiptap/extension-image";
import { AlignLeft, AlignCenter, AlignRight, Trash2 } from "lucide-react";

export const ResizableImageComponent = (props: NodeViewProps) => {
  const { node, updateAttributes, selected, deleteNode } = props;
  const [resizing, setResizing] = useState(false);
  const [currentWidth, setCurrentWidth] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const src = node.attrs.src;
  const alt = node.attrs.alt;
  const alignment = node.attrs.alignment || "center";
  const widthAttr = node.attrs.width;

  useEffect(() => {
    if (widthAttr) {
      const parsed = parseInt(widthAttr, 10);
      if (!isNaN(parsed)) {
        setCurrentWidth(parsed);
      }
    }
  }, [widthAttr]);

  // Xử lý kéo dãn kích thước (Drag to resize)
  const handleMouseDown = (e: React.MouseEvent, corner: "se" | "sw") => {
    e.preventDefault();
    e.stopPropagation();
    setResizing(true);

    const startX = e.clientX;
    const initialWidth = imgRef.current?.getBoundingClientRect().width || 300;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      let newWidth = corner === "se" ? initialWidth + deltaX : initialWidth - deltaX;

      // Giới hạn kích thước từ 120px đến 800px
      newWidth = Math.max(120, Math.min(800, newWidth));
      setCurrentWidth(Math.round(newWidth));
    };

    const handleMouseUp = (upEvent: MouseEvent) => {
      setResizing(false);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);

      const deltaX = upEvent.clientX - startX;
      let finalWidth = corner === "se" ? initialWidth + deltaX : initialWidth - deltaX;
      finalWidth = Math.max(120, Math.min(800, Math.round(finalWidth)));

      updateAttributes({ width: `${finalWidth}px` });
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const handleSetAlignment = (align: "left" | "center" | "right") => {
    updateAttributes({ alignment: align });
  };

  const alignmentClass =
    alignment === "left"
      ? "justify-start"
      : alignment === "right"
      ? "justify-end"
      : "justify-center";

  return (
    <NodeViewWrapper className={`my-4 flex ${alignmentClass} group/img-wrapper select-none`}>
      <div
        ref={containerRef}
        className="relative inline-block group/img transition-shadow duration-150"
        style={{ width: currentWidth ? `${currentWidth}px` : "auto", maxWidth: "100%" }}
      >
        {/* Ảnh hiển thị */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={imgRef}
          src={src}
          alt={alt || "Ảnh tài liệu"}
          className={`block w-full h-auto rounded-lg shadow-sm transition-all duration-150 ${
            selected || resizing
              ? "ring-2 ring-indigo-500 shadow-md"
              : "hover:ring-2 hover:ring-indigo-300"
          }`}
          style={{ width: currentWidth ? `${currentWidth}px` : undefined }}
        />

        {/* Thanh công cụ căn chỉnh nổi (Hiển thị khi chọn hoặc hover) */}
        {(selected || resizing) && (
          <div className="absolute -top-11 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-slate-900/90 backdrop-blur-sm text-white px-2 py-1 rounded-lg shadow-xl z-30 border border-slate-700 animate-in fade-in zoom-in-95 duration-100">
            <button
              type="button"
              onClick={() => handleSetAlignment("left")}
              className={`p-1.5 rounded hover:bg-slate-700 transition ${
                alignment === "left" ? "bg-indigo-600 text-white" : "text-slate-300"
              }`}
              title="Căn trái"
            >
              <AlignLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => handleSetAlignment("center")}
              className={`p-1.5 rounded hover:bg-slate-700 transition ${
                alignment === "center" ? "bg-indigo-600 text-white" : "text-slate-300"
              }`}
              title="Căn giữa"
            >
              <AlignCenter className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => handleSetAlignment("right")}
              className={`p-1.5 rounded hover:bg-slate-700 transition ${
                alignment === "right" ? "bg-indigo-600 text-white" : "text-slate-300"
              }`}
              title="Căn phải"
            >
              <AlignRight className="w-3.5 h-3.5" />
            </button>

            <div className="w-px h-3.5 bg-slate-700 mx-1" />

            {/* Các kích thước nhanh */}
            <button
              type="button"
              onClick={() => updateAttributes({ width: "300px" })}
              className="text-[11px] px-1.5 py-0.5 rounded hover:bg-slate-700 text-slate-300 font-medium"
            >
              Nhỏ
            </button>
            <button
              type="button"
              onClick={() => updateAttributes({ width: "550px" })}
              className="text-[11px] px-1.5 py-0.5 rounded hover:bg-slate-700 text-slate-300 font-medium"
            >
              Vừa
            </button>
            <button
              type="button"
              onClick={() => updateAttributes({ width: "100%" })}
              className="text-[11px] px-1.5 py-0.5 rounded hover:bg-slate-700 text-slate-300 font-medium"
            >
              Đầy
            </button>

            <div className="w-px h-3.5 bg-slate-700 mx-1" />

            <button
              type="button"
              onClick={deleteNode}
              className="p-1.5 rounded hover:bg-rose-600/80 text-rose-300 hover:text-white transition"
              title="Xóa ảnh"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Các chấm kéo dãn (Resize Handles kiểu Google Docs) */}
        {(selected || resizing) && (
          <>
            {/* Chấm góc dưới - phải */}
            <div
              onMouseDown={(e) => handleMouseDown(e, "se")}
              className="absolute -bottom-1.5 -right-1.5 w-3.5 h-3.5 bg-white border-2 border-indigo-600 rounded-sm shadow-md cursor-nwse-resize hover:scale-125 transition-transform z-20"
              title="Kéo để thay đổi kích thước"
            />
            {/* Chấm góc dưới - trái */}
            <div
              onMouseDown={(e) => handleMouseDown(e, "sw")}
              className="absolute -bottom-1.5 -left-1.5 w-3.5 h-3.5 bg-white border-2 border-indigo-600 rounded-sm shadow-md cursor-nesw-resize hover:scale-125 transition-transform z-20"
              title="Kéo để thay đổi kích thước"
            />
          </>
        )}
      </div>
    </NodeViewWrapper>
  );
};

export const ResizableImage = Image.extend({
  name: "image",

  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        renderHTML: (attributes: any) => {
          if (!attributes.width) return {};
          return { style: `width: ${attributes.width}` };
        },
      },
      alignment: {
        default: "center",
        renderHTML: (attributes: any) => {
          return { "data-alignment": attributes.alignment || "center" };
        },
      },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageComponent);
  },
});
