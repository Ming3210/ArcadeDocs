"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as Y from "yjs";
import YPartyKitProvider from "y-partykit/provider";
import { getRandomUser, DocUser } from "@/lib/random-user";
import {
  PixelDiscordBot,
  PixelGhostBot,
} from "@/components/pro/PixelBots";
import {
  InvaderSquid,
  InvaderCrab,
  InvaderOctopus,
} from "@/components/pro/SpaceInvaders";
import {
  ArrowLeft,
  Share2,
  Check,
  MousePointer,
  Hand,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  StickyNote,
  Trash2,
  Users,
  Sparkles,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Indent,
  Outdent,
  RemoveFormatting,
  Highlighter,
  Minus,
  Undo2,
  Redo2,
  Table as TableIcon,
  FileText,
  Plus,
  Scissors,
  Link2,
  ArrowDown,
  ChevronDown,
  X,
} from "lucide-react";
// Inline SVG icons (lucide-react v1.39 doesn't support typed deep path imports)
const Globe = ({ className, ...p }: React.SVGProps<SVGSVGElement> & {className?: string}) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...p}>
    <circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
  </svg>
);
const Lock = ({ className, ...p }: React.SVGProps<SVGSVGElement> & {className?: string}) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...p}>
    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);
const PaletteIcon = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/>
    <circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/>
    <circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/>
    <circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/>
    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.563-2.512 5.563-5.562C22 6.5 17.5 2 12 2z"/>
  </svg>
);
const GridIcon = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/>
  </svg>
);
const BellIcon = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
  </svg>
);
const SendIcon = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>
  </svg>
);
const ImageIcon = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
  </svg>
);
const UploadIcon = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/>
  </svg>
);

export type CanvasBgType =
  | "cyber-grid"
  | "dot-matrix"
  | "blueprint"
  | "terminal"
  | "synthwave"
  | "crosshair"
  | "obsidian"
  | "warm-draft";

export interface CanvasBgConfig {
  type: CanvasBgType;
  gridSize: 16 | 24 | 32 | 48 | 64;
  showGrid: boolean;
  scanlines: boolean;
  imageUrl?: string;
  imageOpacity?: number; // 0.05 to 0.8
  imageBlur?: number; // 0 to 24
  imageFit?: "cover" | "contain" | "bottom-right" | "center";
}

export const CANVAS_BG_THEMES: {
  id: CanvasBgType;
  name: string;
  subtitle: string;
  bgColor: string;
  accentColor: string;
  previewBorder: string;
  renderCss: (zoom: number, pan: { x: number; y: number }, gridSize: number, showGrid: boolean) => React.CSSProperties;
}[] = [
  {
    id: "cyber-grid",
    name: "Cyber Grid",
    subtitle: "Mặc định • Lưới Slate/Cyan",
    bgColor: "#0a0c14",
    accentColor: "#00f0ff",
    previewBorder: "border-cyan-500/50",
    renderCss: (zoom, pan, gridSize, showGrid) => ({
      backgroundColor: "#0a0c14",
      backgroundImage: showGrid
        ? `linear-gradient(rgba(148, 163, 184, 0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(148, 163, 184, 0.08) 1px, transparent 1px)`
        : "none",
      backgroundSize: `${gridSize * zoom}px ${gridSize * zoom}px`,
      backgroundPosition: `${pan.x}px ${pan.y}px`,
    }),
  },
  {
    id: "dot-matrix",
    name: "Dot Matrix",
    subtitle: "Điểm chấm neon • Tinh tế",
    bgColor: "#090b12",
    accentColor: "#38bdf8",
    previewBorder: "border-sky-500/50",
    renderCss: (zoom, pan, gridSize, showGrid) => ({
      backgroundColor: "#090b12",
      backgroundImage: showGrid
        ? `radial-gradient(circle, rgba(56, 189, 248, 0.35) 1.5px, transparent 1.5px)`
        : "none",
      backgroundSize: `${gridSize * zoom}px ${gridSize * zoom}px`,
      backgroundPosition: `${pan.x}px ${pan.y}px`,
    }),
  },
  {
    id: "blueprint",
    name: "Blueprint",
    subtitle: "Bản vẽ xanh kỹ thuật",
    bgColor: "#07172c",
    accentColor: "#60a5fa",
    previewBorder: "border-blue-500/50",
    renderCss: (zoom, pan, gridSize, showGrid) => ({
      backgroundColor: "#07172c",
      backgroundImage: showGrid
        ? `linear-gradient(rgba(96, 165, 250, 0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(96, 165, 250, 0.18) 1px, transparent 1px)`
        : "none",
      backgroundSize: `${gridSize * zoom}px ${gridSize * zoom}px`,
      backgroundPosition: `${pan.x}px ${pan.y}px`,
    }),
  },
  {
    id: "terminal",
    name: "CRT Terminal",
    subtitle: "Phosphor Green ma trận",
    bgColor: "#041209",
    accentColor: "#22c55e",
    previewBorder: "border-emerald-500/50",
    renderCss: (zoom, pan, gridSize, showGrid) => ({
      backgroundColor: "#041209",
      backgroundImage: showGrid
        ? `linear-gradient(rgba(34, 197, 94, 0.16) 1px, transparent 1px), linear-gradient(90deg, rgba(34, 197, 94, 0.16) 1px, transparent 1px)`
        : "none",
      backgroundSize: `${gridSize * zoom}px ${gridSize * zoom}px`,
      backgroundPosition: `${pan.x}px ${pan.y}px`,
    }),
  },
  {
    id: "synthwave",
    name: "Synthwave",
    subtitle: "Neon Violet • Cổ điển 80s",
    bgColor: "#11081f",
    accentColor: "#d946ef",
    previewBorder: "border-fuchsia-500/50",
    renderCss: (zoom, pan, gridSize, showGrid) => ({
      backgroundColor: "#11081f",
      backgroundImage: showGrid
        ? `linear-gradient(rgba(217, 70, 239, 0.16) 1px, transparent 1px), linear-gradient(90deg, rgba(217, 70, 239, 0.16) 1px, transparent 1px)`
        : "none",
      backgroundSize: `${gridSize * zoom}px ${gridSize * zoom}px`,
      backgroundPosition: `${pan.x}px ${pan.y}px`,
    }),
  },
  {
    id: "crosshair",
    name: "CAD Crosses",
    subtitle: "Giao điểm chữ thập kỹ thuật",
    bgColor: "#0d111c",
    accentColor: "#94a3b8",
    previewBorder: "border-slate-500/50",
    renderCss: (zoom, pan, gridSize, showGrid) => {
      const sz = gridSize * zoom;
      return {
        backgroundColor: "#0d111c",
        backgroundImage: showGrid
          ? `radial-gradient(circle, rgba(148, 163, 184, 0.4) 1px, transparent 1px), linear-gradient(rgba(148, 163, 184, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(148, 163, 184, 0.1) 1px, transparent 1px)`
          : "none",
        backgroundSize: `${sz}px ${sz}px`,
        backgroundPosition: `${pan.x}px ${pan.y}px`,
      };
    },
  },
  {
    id: "obsidian",
    name: "Pure Void",
    subtitle: "Đen tuyền tối giản • Tập trung",
    bgColor: "#040508",
    accentColor: "#64748b",
    previewBorder: "border-zinc-700",
    renderCss: () => ({
      backgroundColor: "#040508",
      backgroundImage: "none",
    }),
  },
  {
    id: "warm-draft",
    name: "Warm Draft",
    subtitle: "Giấy phác thảo Sepia cổ xưa",
    bgColor: "#15120f",
    accentColor: "#f59e0b",
    previewBorder: "border-amber-500/50",
    renderCss: (zoom, pan, gridSize, showGrid) => ({
      backgroundColor: "#15120f",
      backgroundImage: showGrid
        ? `linear-gradient(rgba(245, 158, 11, 0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(245, 158, 11, 0.12) 1px, transparent 1px)`
        : "none",
      backgroundSize: `${gridSize * zoom}px ${gridSize * zoom}px`,
      backgroundPosition: `${pan.x}px ${pan.y}px`,
    }),
  },
];
import {
  ShapeType,
  PlaygroundShapeItem,
  SHAPES_LIST,
  ShapeMiniIcon,
  ShapeItemView,
  renderShapeSvgGeometry,
} from "./PlaygroundShape";
import { ArrowConnectorView, isArrowConnector } from "./PlaygroundArrow";


interface StickyNoteItem {
  id: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  color: string;
  title: string;
  content: string;
}

interface PlaygroundTableItem {
  id: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  color: string;
  title: string;
  headers: string[];
  rows: string[][];
  cellAlign?: "left" | "center" | "right";
}

interface PlaygroundA4Doc {
  id: string;
  x: number;
  y: number;
  title: string;
  pages: string[]; // Mỗi phần tử là HTML của 1 trang A4 liên tục
}

const FONT_FAMILIES = [
  { name: "Arial", value: "Arial, sans-serif" },
  { name: "Inter", value: "Inter, sans-serif" },
  { name: "Roboto", value: "'Roboto', sans-serif" },
  { name: "Times New Roman", value: "'Times New Roman', serif" },
  { name: "Courier New", value: "'Courier New', monospace" },
  { name: "Georgia", value: "Georgia, serif" },
  { name: "Comic Sans MS", value: "'Comic Sans MS', cursive" },
  { name: "Trebuchet MS", value: "'Trebuchet MS', sans-serif" },
  { name: "Impact", value: "Impact, sans-serif" },
  { name: "Press Start 2P", value: "'Press Start 2P', monospace" },
  { name: "VT323", value: "'VT323', monospace" },
];

const FONT_SIZES = [8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 72];

const GOOGLE_DOCS_COLORS = [
  "#000000", "#434343", "#666666", "#999999", "#b7b7b7", "#cccccc", "#d9d9d9", "#efefef", "#f3f3f3", "#ffffff",
  "#980000", "#ff0000", "#ff9900", "#ffff00", "#00ff00", "#00ffff", "#4a86e8", "#0000ff", "#9900ff", "#ff00ff",
  "#e6b8af", "#f4cccc", "#fce5cd", "#fff2cc", "#d9ead3", "#d0e0e3", "#c9daf8", "#cfe2f3", "#d9d2e9", "#ead1dc",
  "#00f0ff", "#ff007f", "#39ff14", "#ffe600", "#a855f7", "#38bdf8", "#fb7185", "#4ade80", "#facc15", "#c084fc",
];

const HIGHLIGHT_COLORS = [
  "transparent", "#ffff00", "#00ff00", "#00ffff", "#ff00ff", "#0000ff", "#ff0000", "#ff9900", "#9900ff", "#e6b8af",
];

interface RemotePlayer {
  clientId: number;
  user: DocUser;
  cursor?: { x: number; y: number } | null;
}

interface PlaygroundCanvasProps {
  roomId: string;
}

// 8-Bit Pixel Arrow Cursor for Multiplayer
const PixelCursor: React.FC<{ color: string }> = ({ color }) => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 18 18"
    fill="none"
    className="pixelated drop-shadow-md"
    shapeRendering="crispEdges"
  >
    <path
      d="M0 0V14L4 10L7 17L10 15.5L7 8.5L12 8.5L0 0Z"
      fill={color}
      stroke="#000"
      strokeWidth="1.5"
    />
  </svg>
);

// Editable Rich Text Content for Sticky Notes
interface NoteContentProps {
  noteId: string;
  initialContent: string;
  onUpdate: (id: string, field: "title" | "content", val: string) => void;
  onCheckSelection: (noteId: string) => void;
  onFocusElement?: (refKey: string) => void;
  contentRefs: React.MutableRefObject<{ [key: string]: HTMLDivElement | null }>;
}

const NoteContent: React.FC<NoteContentProps> = ({
  noteId,
  initialContent,
  onUpdate,
  onCheckSelection,
  onFocusElement,
  contentRefs,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const isTypingRef = useRef(false);

  useEffect(() => {
    contentRefs.current[noteId] = ref.current;
    return () => {
      delete contentRefs.current[noteId];
    };
  }, [noteId, contentRefs]);

  useEffect(() => {
    if (ref.current && !isTypingRef.current) {
      if (ref.current.innerHTML !== initialContent) {
        ref.current.innerHTML = initialContent || "";
      }
    }
  }, [initialContent]);

  return (
    <div
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      onFocus={() => {
        isTypingRef.current = true;
        onFocusElement?.(noteId);
      }}
      onBlur={(e) => {
        isTypingRef.current = false;
        onUpdate(noteId, "content", e.currentTarget.innerHTML);
      }}
      onInput={(e) => {
        onUpdate(noteId, "content", e.currentTarget.innerHTML);
      }}
      onMouseUp={() => onCheckSelection(noteId)}
      onKeyUp={() => onCheckSelection(noteId)}
      onMouseDown={(e) => e.stopPropagation()}
      className="w-full flex-1 bg-transparent text-xs text-slate-300 focus:outline-none font-mono leading-relaxed overflow-y-auto px-1 py-0.5 select-text cursor-text"
      style={{ minHeight: "60px" }}
    />
  );
};

// Helper to cleanly extract content overflowing the 1-page A4 height limit (995px)
function extractPageOverflow(container: HTMLElement, maxHeight: number = 995): string | null {
  if (container.scrollHeight <= maxHeight + 4) return null;

  const overflowContainer = document.createElement("div");
  let iterations = 0;
  const maxIterations = 200;

  // 1. Pop entire child elements from the bottom until container fits maxHeight
  while (container.scrollHeight > maxHeight && container.childNodes.length > 1 && iterations < maxIterations) {
    iterations++;
    const last = container.lastChild;
    if (!last) break;
    container.removeChild(last);
    if (overflowContainer.firstChild) {
      overflowContainer.insertBefore(last, overflowContainer.firstChild);
    } else {
      overflowContainer.appendChild(last);
    }
  }

  // 2. If single remaining child still causes overflow (e.g. a large paragraph or block)
  if (container.scrollHeight > maxHeight && container.firstChild && iterations < maxIterations) {
    const single = container.firstChild as HTMLElement;
    if (single.nodeType === Node.ELEMENT_NODE && single.childNodes.length > 1) {
      const childOverflow: Node[] = [];
      while (container.scrollHeight > maxHeight && single.childNodes.length > 1 && iterations < maxIterations) {
        iterations++;
        const last = single.lastChild;
        if (!last) break;
        single.removeChild(last);
        childOverflow.unshift(last);
      }
      if (childOverflow.length > 0) {
        const clone = single.cloneNode(false) as HTMLElement;
        childOverflow.forEach((n) => clone.appendChild(n));
        if (overflowContainer.firstChild) {
          overflowContainer.insertBefore(clone, overflowContainer.firstChild);
        } else {
          overflowContainer.appendChild(clone);
        }
      }
    } else {
      // Split single text content by words
      const text = single.textContent || "";
      const words = text.split(" ");
      if (words.length > 1) {
        let low = 0;
        let high = words.length;
        let fitIndex = 0;
        while (low <= high) {
          const mid = Math.floor((low + high) / 2);
          single.textContent = words.slice(0, mid).join(" ");
          if (container.scrollHeight <= maxHeight) {
            fitIndex = mid;
            low = mid + 1;
          } else {
            high = mid - 1;
          }
        }
        if (fitIndex < words.length && fitIndex > 0) {
          single.textContent = words.slice(0, fitIndex).join(" ");
          const overflowWords = words.slice(fitIndex).join(" ");
          const clone = single.cloneNode(false) as HTMLElement;
          clone.textContent = overflowWords;
          if (overflowContainer.firstChild) {
            overflowContainer.insertBefore(clone, overflowContainer.firstChild);
          } else {
            overflowContainer.appendChild(clone);
          }
        }
      }
    }
  }

  const result = overflowContainer.innerHTML.trim();
  return result || null;
}

// Editable Rich Text Content for A4 Document Page with Strict Single-Sheet Height & Auto Pagination
interface A4PageContentProps {
  docId: string;
  pageIndex: number;
  initialContent: string;
  onUpdatePage: (docId: string, pageIndex: number, content: string) => void;
  onPageOverflow?: (docId: string, pageIndex: number, currentPageContent: string, overflowHtml: string) => void;
  onDeletePage?: (docId: string, pageIndex: number) => void;
  onCheckSelection: (refKey: string) => void;
  onFocusElement?: (refKey: string) => void;
  contentRefs: React.MutableRefObject<{ [key: string]: HTMLDivElement | null }>;
}

const A4PageContent: React.FC<A4PageContentProps> = ({
  docId,
  pageIndex,
  initialContent,
  onUpdatePage,
  onPageOverflow,
  onDeletePage,
  onCheckSelection,
  onFocusElement,
  contentRefs,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const isTypingRef = useRef(false);
  const refKey = `${docId}-p${pageIndex}`;

  useEffect(() => {
    contentRefs.current[refKey] = ref.current;
    return () => {
      delete contentRefs.current[refKey];
    };
  }, [refKey, contentRefs]);

  const checkOverflow = useCallback(() => {
    if (!ref.current) return;
    const overflowHtml = extractPageOverflow(ref.current, 995);
    if (overflowHtml) {
      onPageOverflow?.(docId, pageIndex, ref.current.innerHTML, overflowHtml);
    }
  }, [docId, pageIndex, onPageOverflow]);

  useEffect(() => {
    if (ref.current && !isTypingRef.current) {
      if (ref.current.innerHTML !== initialContent) {
        ref.current.innerHTML = initialContent || "";
        checkOverflow();
      }
    }
  }, [initialContent, checkOverflow]);

  return (
    <div
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      onFocus={() => {
        isTypingRef.current = true;
        onFocusElement?.(refKey);
      }}
      onBlur={(e) => {
        isTypingRef.current = false;
        onUpdatePage(docId, pageIndex, e.currentTarget.innerHTML);
      }}
      onInput={(e) => {
        const overflowHtml = extractPageOverflow(e.currentTarget, 995);
        if (overflowHtml) {
          onPageOverflow?.(docId, pageIndex, e.currentTarget.innerHTML, overflowHtml);
        } else {
          onUpdatePage(docId, pageIndex, e.currentTarget.innerHTML);
        }
      }}
      onPaste={() => {
        setTimeout(checkOverflow, 25);
      }}
      onKeyDown={(e) => {
        if (e.key === "Backspace" && pageIndex > 0) {
          const text = (e.currentTarget.textContent || "").trim();
          if (!text || text === "") {
            e.preventDefault();
            onDeletePage?.(docId, pageIndex);
            setTimeout(() => {
              const prevKey = `${docId}-p${pageIndex - 1}`;
              const prevEl = contentRefs.current[prevKey];
              if (prevEl) {
                prevEl.focus();
                try {
                  const range = document.createRange();
                  range.selectNodeContents(prevEl);
                  range.collapse(false);
                  const sel = window.getSelection();
                  if (sel) {
                    sel.removeAllRanges();
                    sel.addRange(range);
                  }
                } catch {}
              }
            }, 50);
          }
        }
      }}
      onMouseUp={() => onCheckSelection(refKey)}
      onKeyUp={() => onCheckSelection(refKey)}
      onMouseDown={(e) => e.stopPropagation()}
      className="w-full h-[995px] max-h-[995px] bg-white text-slate-850 focus:outline-none font-sans text-sm leading-relaxed select-text cursor-text overflow-hidden"
      style={{
        boxSizing: "border-box",
        wordBreak: "break-word",
      }}
    />
  );
};

function getClientOwnerId(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|;\s*)(?:arcadedocs_owner_id|easyca_owner_id)=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export default function PlaygroundCanvas({ roomId }: PlaygroundCanvasProps) {
  const router = useRouter();

  // 1. Current User Identity (lưu localStorage để dùng chung danh tính trên mọi tab trong trình duyệt)
  const [currentUser] = useState<DocUser>(() => {
    if (typeof window !== "undefined") {
      const ownerCookie = getClientOwnerId();
      const saved =
        localStorage.getItem("arcadedocs_doc_user") ||
        localStorage.getItem("easyca_doc_user") ||
        sessionStorage.getItem("collab_doc_user");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed && typeof parsed === "object" && parsed.name && parsed.color) {
            if (ownerCookie) {
              parsed.id = ownerCookie;
              parsed.accountCode = ownerCookie.slice(0, 8).toUpperCase();
            } else if (!parsed.id) {
              parsed.id = "usr_" + Math.random().toString(36).slice(2, 10);
            }
            localStorage.setItem("arcadedocs_doc_user", JSON.stringify(parsed));
            return parsed;
          }
        } catch {}
      }
      const newUser = getRandomUser(ownerCookie || undefined);
      if (ownerCookie) {
        newUser.accountCode = ownerCookie.slice(0, 8).toUpperCase();
      }
      localStorage.setItem("arcadedocs_doc_user", JSON.stringify(newUser));
      return newUser;
    }
    return getRandomUser();
  });

  // 2. Real-time Yjs & PartyKit setup
  const [ydoc] = useState(() => new Y.Doc());
  const [provider] = useState(() => {
    const host = process.env.NEXT_PUBLIC_PARTYKIT_HOST || "localhost:1999";
    return new YPartyKitProvider(host, `playground-${roomId}`, ydoc, {
      connect: false,
    });
  });

  const [status, setStatus] = useState<"connecting" | "connected" | "disconnected">("connecting");
  const [remotePlayers, setRemotePlayers] = useState<RemotePlayer[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<DocUser[]>([]);

  // 3. Pan & Zoom State (Figma Style)
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 120, y: 100 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [activeTool, setActiveTool] = useState<"select" | "hand" | "shape">("select");
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const [copied, setCopied] = useState(false);

  // 4. File metadata & Access control (Supabase)
  const [fileInfo, setFileInfo] = useState<{ id: string; title: string; is_public: boolean; owner_id: string } | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [accessState, setAccessState] = useState<"checking" | "granted" | "forbidden">("checking");
  const [userPermission, setUserPermission] = useState<"owner" | "edit" | "view">("edit");
  const isWhitelistedRef = useRef(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");
  const [privacyLoading, setPrivacyLoading] = useState(false);

  // 5. Canvas Background Customizer State
  const [canvasBg, setCanvasBg] = useState<CanvasBgConfig>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("arcadedocs_canvas_bg");
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return {
      type: "cyber-grid",
      gridSize: 32,
      showGrid: true,
      scanlines: true,
    };
  });
  const [isBgDropdownOpen, setIsBgDropdownOpen] = useState(false);
  const [bgPopoverTab, setBgPopoverTab] = useState<"wallpaper" | "grid">("wallpaper");

  const updateCanvasBg = (updates: Partial<CanvasBgConfig>) => {
    setCanvasBg((prev) => {
      const next = { ...prev, ...updates };
      try {
        localStorage.setItem("arcadedocs_canvas_bg", JSON.stringify(next));
        const yMeta = ydoc.getMap("playground-metadata");
        yMeta.set("canvas_bg", next);
      } catch {}
      return next;
    });
  };

  const activeTheme = CANVAS_BG_THEMES.find((t) => t.id === canvasBg.type) || CANVAS_BG_THEMES[0];

  const bgFileInputRef = useRef<HTMLInputElement>(null);
  const [bgUploading, setBgUploading] = useState(false);
  const [bgUrlInput, setBgUrlInput] = useState("");
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [bgUploadError, setBgUploadError] = useState<string | null>(null);

  const handleBgFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBgUploading(true);
    setBgUploadError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        if (data.url) {
          updateCanvasBg({
            imageUrl: data.url,
            imageOpacity: canvasBg.imageOpacity ?? 0.22,
            imageBlur: canvasBg.imageBlur ?? 6,
            imageFit: canvasBg.imageFit ?? "cover",
          });
          setBgUploading(false);
          if (e.target) e.target.value = "";
          return;
        }
      }
    } catch {
      // Fallback to local DataURL below
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      updateCanvasBg({
        imageUrl: dataUrl,
        imageOpacity: canvasBg.imageOpacity ?? 0.22,
        imageBlur: canvasBg.imageBlur ?? 6,
        imageFit: canvasBg.imageFit ?? "cover",
      });
      setBgUploading(false);
      if (e.target) e.target.value = "";
    };
    reader.onerror = () => {
      setBgUploadError("Không thể đọc tệp ảnh từ máy tính.");
      setBgUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleApplyBgUrl = () => {
    const url = bgUrlInput.trim();
    if (!url) return;
    updateCanvasBg({
      imageUrl: url,
      imageOpacity: canvasBg.imageOpacity ?? 0.22,
      imageBlur: canvasBg.imageBlur ?? 6,
      imageFit: canvasBg.imageFit ?? "cover",
    });
    setBgUrlInput("");
    setShowUrlInput(false);
  };

  const handleClearBgImage = () => {
    updateCanvasBg({ imageUrl: undefined });
  };

  // 6. Access Requests State
  const [pendingRequest, setPendingRequest] = useState<{
    id: string;
    accountCode: string;
    permission: "view" | "edit";
    note: string;
    created_at: string;
  } | null>(null);
  const [requestPermChoice, setRequestPermChoice] = useState<"edit" | "view">("edit");
  const [requestNote, setRequestNote] = useState("");
  const [requestSubmitting, setRequestSubmitting] = useState(false);
  const [requestSuccessMsg, setRequestSuccessMsg] = useState<string | null>(null);
  const [requestErrorMsg, setRequestErrorMsg] = useState<string | null>(null);

  // For owner: list of pending requests
  const [pendingRequests, setPendingRequests] = useState<{
    id: string;
    accountCode: string;
    permission: "view" | "edit";
    note: string;
    created_at: string;
  }[]>([]);
  const [reqActionLoading, setReqActionLoading] = useState<string | null>(null);

  const checkMyPendingRequest = useCallback(async () => {
    if (!roomId) return;
    try {
      const res = await fetch(`/api/files/${roomId}/access-requests`);
      if (res.ok) {
        const data = await res.json();
        if (data.hasPendingRequest && data.request) {
          setPendingRequest(data.request);
        } else {
          setPendingRequest(null);
        }
      }
    } catch {}
  }, [roomId]);

  const loadOwnerAccessRequests = useCallback(async () => {
    if (!roomId || !isOwner) return;
    try {
      const res = await fetch(`/api/files/${roomId}/access-requests`);
      if (res.ok) {
        const data = await res.json();
        if (data.isOwner && Array.isArray(data.requests)) {
          setPendingRequests(data.requests);
        }
      }
    } catch {}
  }, [roomId, isOwner]);

  const handleSubmitAccessRequest = async (overridePerm?: "edit" | "view") => {
    setRequestSubmitting(true);
    setRequestErrorMsg(null);
    setRequestSuccessMsg(null);
    try {
      const permToRequest = overridePerm || requestPermChoice;
      const res = await fetch(`/api/files/${roomId}/access-requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          permission: permToRequest,
          note: requestNote.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok && data.request) {
        setPendingRequest(data.request);
        setRequestSuccessMsg("Đã gửi yêu cầu! Vui lòng đợi chủ phòng phê duyệt.");
      } else {
        setRequestErrorMsg(data.error || "Không thể gửi yêu cầu lúc này.");
      }
    } catch {
      setRequestErrorMsg("Lỗi kết nối khi gửi yêu cầu.");
    } finally {
      setRequestSubmitting(false);
    }
  };

  const handleCancelAccessRequest = async () => {
    try {
      const res = await fetch(`/api/files/${roomId}/access-requests`, {
        method: "DELETE",
      });
      if (res.ok) {
        setPendingRequest(null);
        setRequestSuccessMsg(null);
      }
    } catch {}
  };

  const handleOwnerRequestAction = async (accountCode: string, action: "approve" | "reject", perm: "view" | "edit" = "edit") => {
    setReqActionLoading(accountCode);
    try {
      const res = await fetch(`/api/files/${roomId}/access-requests`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountCode,
          action,
          permission: perm,
        }),
      });
      if (res.ok) {
        setPendingRequests((prev) => prev.filter((r) => r.accountCode !== accountCode.toUpperCase()));
        if (action === "approve") {
          loadCollaborators();
        }
      }
    } catch {} finally {
      setReqActionLoading(null);
    }
  };

  // 7. Share & Collaborators Modal State
  const [showShareModal, setShowShareModal] = useState(false);
  const [collaborators, setCollaborators] = useState<{ id: string; accountCode: string; permission: string; created_at: string }[]>([]);
  const [newCollabCode, setNewCollabCode] = useState("");
  const [newCollabPerm, setNewCollabPerm] = useState<"edit" | "view">("edit");
  const [collabLoading, setCollabLoading] = useState(false);
  const [guestMode, setGuestMode] = useState<"edit" | "view">("edit");

  const loadCollaborators = useCallback(async () => {
    if (!roomId || !isOwner) return;
    try {
      const res = await fetch(`/api/files/${roomId}/collaborators`);
      if (res.ok) {
        const data = await res.json();
        setCollaborators(data.collaborators ?? []);
      }
    } catch {}
  }, [roomId, isOwner]);

  useEffect(() => {
    if (showShareModal && isOwner) {
      loadCollaborators();
      loadOwnerAccessRequests();
    }
  }, [showShareModal, isOwner, loadCollaborators, loadOwnerAccessRequests]);

  const handleAddCollaborator = async () => {
    const code = newCollabCode.trim();
    if (!code) return;
    setCollabLoading(true);
    try {
      const res = await fetch(`/api/files/${roomId}/collaborators`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountCode: code, permission: newCollabPerm }),
      });
      if (res.ok) {
        setNewCollabCode("");
        loadCollaborators();
      }
    } catch {}
    setCollabLoading(false);
  };

  const handleRemoveCollaborator = async (accountCode: string) => {
    try {
      const res = await fetch(`/api/files/${roomId}/collaborators`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountCode }),
      });
      if (res.ok) {
        loadCollaborators();
      }
    } catch {}
  };

  // Khi mở canvas: fetch hoặc tạo mới file metadata trong DB
  useEffect(() => {
    let isCancelled = false;

    async function initCanvasFile() {
      try {
        const res = await fetch(`/api/files/${roomId}`);

        if (res.status === 403) {
          // File PRIVATE và không phải chủ sở hữu -> Chặn truy cập tuyệt đối
          if (!isCancelled) {
            setAccessState("forbidden");
            checkMyPendingRequest();
          }
          return;
        }

        if (res.status === 404) {
          // File chưa tồn tại trong DB → tạo mới với id là roomId hiện tại
          const postRes = await fetch("/api/files", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: roomId, title: `Canvas ${roomId.slice(0, 8)}` }),
          });
          if (postRes.ok) {
            const data = await postRes.json();
            if (!isCancelled && data?.file) {
              setFileInfo(data.file);
              setIsOwner(true);
              setUserPermission("owner");
              setAccessState("granted");
              loadOwnerAccessRequests();
            }
          } else {
            if (!isCancelled) setAccessState("forbidden");
          }
          return;
        }

        if (res.ok) {
          const data = await res.json();
          if (!isCancelled && data?.file) {
            setFileInfo(data.file);
            const owned = Boolean(data.isOwner);
            setIsOwner(owned);
            isWhitelistedRef.current = Boolean(data.isWhitelisted);
            const perm: "owner" | "edit" | "view" = owned ? "owner" : (data.permission || "edit");
            setUserPermission(perm);
            setAccessState("granted");

            if (owned) {
              loadOwnerAccessRequests();
            } else if (perm === "view") {
              checkMyPendingRequest();
            }

            // Lưu vào lịch sử gần đây của trình duyệt này
            try {
              const raw =
                localStorage.getItem("arcadedocs_recent_canvases") ||
                localStorage.getItem("easyca_recent_canvases");
              let recents = raw ? JSON.parse(raw) : [];
              recents = recents.filter((r: any) => r.id !== data.file.id);
              recents.unshift({
                id: data.file.id,
                title: data.file.title,
                owner_id: data.file.owner_id,
                is_public: data.file.is_public,
                updated_at: new Date().toISOString(),
                permission: perm,
              });
              localStorage.setItem("arcadedocs_recent_canvases", JSON.stringify(recents.slice(0, 30)));
            } catch {}
          }
        }
      } catch (err) {
        console.error("[initCanvasFile Error]", err);
      }
    }

    initCanvasFile();
    return () => {
      isCancelled = true;
    };
  }, [roomId, checkMyPendingRequest, loadOwnerAccessRequests]);

  // Polling tự động khi bị chặn ở màn hình Forbidden để tự mở khóa ngay khi chủ phòng phê duyệt
  useEffect(() => {
    if (accessState !== "forbidden") return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/files/${roomId}`);
        if (res.ok) {
          window.location.reload();
        }
      } catch {}
    }, 3500);
    return () => clearInterval(interval);
  }, [accessState, roomId]);

  // Polling định kỳ kiểm tra yêu cầu mới cho chủ phòng
  useEffect(() => {
    if (!isOwner || accessState !== "granted") return;
    const interval = setInterval(() => {
      loadOwnerAccessRequests();
    }, 8000);
    return () => clearInterval(interval);
  }, [isOwner, accessState, loadOwnerAccessRequests]);

  const handleUpdateTitle = async (newTitle: string) => {
    if (!newTitle.trim() || !fileInfo || !isOwner) return;
    const res = await fetch(`/api/files/${roomId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle.trim() }),
    });
    if (res.ok) {
      const data = await res.json();
      setFileInfo(data.file);
    }
    setEditingTitle(false);
  };

  const handleTogglePrivacy = async () => {
    if (!fileInfo || !isOwner) return;
    setPrivacyLoading(true);
    const nextPrivacy = !fileInfo.is_public;
    const res = await fetch(`/api/files/${roomId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_public: nextPrivacy }),
    });
    if (res.ok) {
      const data = await res.json();
      setFileInfo(data.file);
      // Đồng bộ trạng thái privacy tức thì qua Yjs metadata để khách đang online phản ứng ngay
      const yMeta = ydoc.getMap("playground-metadata");
      yMeta.set("is_public", nextPrivacy);
    }
    setPrivacyLoading(false);
  };



  const containerRef = useRef<HTMLDivElement>(null);

  // Mouse position in viewport pixels for zooming precisely around the cursor
  const mousePosRef = useRef({ x: 600, y: 400 });

  // View state reference to always read current zoom & pan synchronously
  const viewRef = useRef({ zoom: 1, pan: { x: 120, y: 100 } });
  useEffect(() => {
    viewRef.current = { zoom, pan };
  }, [zoom, pan]);

  // Keep mousePosRef updated globally
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      mousePosRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", handleGlobalMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleGlobalMouseMove);
    };
  }, []);

  // Universal Zoom Function: Anchors strictly to the cursor position (Figma Mathematical Invariant)
  const applyZoomAtPoint = useCallback(
    (nextZoomOrDelta: number | ((currentZoom: number) => number), clientX?: number, clientY?: number) => {
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const targetX = clientX !== undefined ? clientX : mousePosRef.current.x;
      const targetY = clientY !== undefined ? clientY : mousePosRef.current.y;

      const mouseX = targetX - rect.left;
      const mouseY = targetY - rect.top;

      const currentZoom = viewRef.current.zoom;
      const currentPan = viewRef.current.pan;

      let nextZoom: number;
      if (typeof nextZoomOrDelta === "function") {
        nextZoom = nextZoomOrDelta(currentZoom);
      } else {
        nextZoom = nextZoomOrDelta;
      }
      nextZoom = Math.min(Math.max(0.15, +nextZoom.toFixed(2)), 3.5);

      if (nextZoom === currentZoom) return;

      // Invariant: Canvas point under mouse before zoom === Canvas point under mouse after zoom
      // (mouseX - currentPan.x) / currentZoom === (mouseX - newPanX) / nextZoom
      const newPanX = mouseX - (mouseX - currentPan.x) * (nextZoom / currentZoom);
      const newPanY = mouseY - (mouseY - currentPan.y) * (nextZoom / currentZoom);

      const nextPan = { x: Math.round(newPanX), y: Math.round(newPanY) };
      viewRef.current = { zoom: nextZoom, pan: nextPan };

      setZoom(nextZoom);
      setPan(nextPan);
    },
    []
  );

  // 4. Real-time Sticky Notes State
  const [notes, setNotes] = useState<StickyNoteItem[]>([]);
  const [draggingNoteId, setDraggingNoteId] = useState<string | null>(null);
  const [resizingNoteId, setResizingNoteId] = useState<string | null>(null);
  const [noteDragOffset, setNoteDragOffset] = useState({ x: 0, y: 0 });
  const [noteResizeStart, setNoteResizeStart] = useState({ mouseX: 0, mouseY: 0, width: 280, height: 180 });

  // 5. Real-time 8-Bit Tables State
  const [tables, setTables] = useState<PlaygroundTableItem[]>([]);
  const [draggingTableId, setDraggingTableId] = useState<string | null>(null);
  const [resizingTableId, setResizingTableId] = useState<string | null>(null);
  const [tableDragOffset, setTableDragOffset] = useState({ x: 0, y: 0 });
  const [tableResizeStart, setTableResizeStart] = useState({ mouseX: 0, mouseY: 0, width: 420, height: 240 });

  // 6. Real-time Separate A4 Documents State
  const [a4Docs, setA4Docs] = useState<PlaygroundA4Doc[]>([]);
  const [draggingA4Id, setDraggingA4Id] = useState<string | null>(null);
  const [a4DragOffset, setA4DragOffset] = useState({ x: 0, y: 0 });

  // 6.5. Real-time Shapes State (Drag-to-draw & editable shapes palette)
  const [shapes, setShapes] = useState<PlaygroundShapeItem[]>([]);
  const [selectedShapeType, setSelectedShapeType] = useState<ShapeType>("circle");
  const [isShapePaletteOpen, setIsShapePaletteOpen] = useState(false);
  const [isDrawingShape, setIsDrawingShape] = useState(false);
  const [drawStartPos, setDrawStartPos] = useState({ x: 0, y: 0 });
  const [drawCurrentPos, setDrawCurrentPos] = useState({ x: 0, y: 0 });
  const [draggingShapeId, setDraggingShapeId] = useState<string | null>(null);
  const [resizingShapeId, setResizingShapeId] = useState<string | null>(null);
  const [shapeDragOffset, setShapeDragOffset] = useState({ x: 0, y: 0 });
  const [shapeResizeStart, setShapeResizeStart] = useState({ mouseX: 0, mouseY: 0, width: 180, height: 160 });

  // Magnetic Snap Target for attaching to bottom of another A4 doc
  const [snapBottomTargetId, setSnapBottomTargetId] = useState<string | null>(null);
  // Pickers for manual attachment
  const [attachPickerDocId, setAttachPickerDocId] = useState<string | null>(null);
  const [headerAttachPickerId, setHeaderAttachPickerId] = useState<string | null>(null);

  // Table Sub-feature Dropdown state
  const [isTableDropdownOpen, setIsTableDropdownOpen] = useState(false);
  const lastActiveRefKey = useRef<string | null>(null);

  // 6.8. Word / Google Docs Topbar States (Font Family, Font Size, Text & Highlight Color)
  const [fontFamily, setFontFamily] = useState("Arial");
  const [fontSize, setFontSize] = useState(14);
  const [textColor, setTextColor] = useState("#ffffff");
  const [highlightColor, setHighlightColor] = useState("transparent");
  const [isFontFamilyDropdownOpen, setIsFontFamilyDropdownOpen] = useState(false);
  const [isFontSizeDropdownOpen, setIsFontSizeDropdownOpen] = useState(false);
  const [isTextColorDropdownOpen, setIsTextColorDropdownOpen] = useState(false);
  const [isHighlightDropdownOpen, setIsHighlightDropdownOpen] = useState(false);

  // Floating Bubble Menu on text selection
  const [floatingMenu, setFloatingMenu] = useState<{
    x: number;
    y: number;
    refKey: string;
  } | null>(null);
  const contentRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Selection State for Figma/Miro style selecting and keyboard delete
  const [selectedItem, setSelectedItem] = useState<{ type: "note" | "table" | "a4" | "shape"; id: string } | null>(null);
  const selectedItemRef = useRef(selectedItem);
  useEffect(() => {
    selectedItemRef.current = selectedItem;
  }, [selectedItem]);


  // Custom Retro Context Menu (Right Click Pop-up)
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    canvasX: number;
    canvasY: number;
  } | null>(null);

  // 7. Connect WebSocket & Wire up Yjs CRDT
  useEffect(() => {
    if (accessState !== "granted") return;

    provider.connect();

    const handleStatus = (event: { status: "connecting" | "connected" | "disconnected" }) => {
      setStatus(event.status);
    };
    provider.on("status", handleStatus);

    provider.awareness.setLocalStateField("user", currentUser);

    const handleAwarenessChange = () => {
      const states = provider.awareness.getStates();
      const currentClientId = provider.awareness.clientID;
      const otherUsersMap = new Map<string, DocUser>();
      const latestCursorByUser = new Map<string, RemotePlayer>();

      states.forEach((state: any, clientId: number) => {
        if (!state.user) return;
        const user = state.user as DocUser;
        // Loại trừ chính mình và các tab khác của cùng một trình duyệt / tài khoản
        const isSelf = clientId === currentClientId || (Boolean(currentUser.id) && user.id === currentUser.id);

        if (!isSelf) {
          const userKey = user.id || `client_${clientId}`;
          if (!otherUsersMap.has(userKey)) {
            otherUsersMap.set(userKey, user);
          }
          if (state.cursor) {
            latestCursorByUser.set(userKey, {
              clientId,
              user,
              cursor: state.cursor,
            });
          }
        }
      });

      setOnlineUsers(Array.from(otherUsersMap.values()));
      setRemotePlayers(Array.from(latestCursorByUser.values()));
    };
    provider.awareness.on("change", handleAwarenessChange);

    const handleBeforeUnload = () => {
      try {
        provider.awareness.setLocalState(null);
      } catch {}
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    // Sync Notes, Tables, A4 Docs, Shapes
    const yMeta = ydoc.getMap("playground-metadata");
    const yNotes = ydoc.getMap<StickyNoteItem>("playground-notes");
    const yTables = ydoc.getMap<PlaygroundTableItem>("playground-tables");
    const yA4 = ydoc.getMap<PlaygroundA4Doc>("playground-a4-docs");
    const yShapes = ydoc.getMap<PlaygroundShapeItem>("playground-shapes");

    // Quan sát thay đổi privacy & guest_mode từ metadata
    const handleMetaChange = () => {
      const livePublic = yMeta.get("is_public");
      if (typeof livePublic === "boolean") {
        setFileInfo((prev) => prev ? { ...prev, is_public: livePublic } : prev);
        if (!isOwner && !livePublic && !isWhitelistedRef.current) {
          setAccessState("forbidden");
        }
      }
      const liveGuestMode = yMeta.get("guest_mode");
      if (typeof liveGuestMode === "string" && !isOwner) {
        setUserPermission(liveGuestMode === "view" ? "view" : "edit");
      }
      const liveBg = yMeta.get("canvas_bg");
      if (liveBg && typeof liveBg === "object") {
        setCanvasBg((prev) => ({ ...prev, ...(liveBg as Partial<CanvasBgConfig>) }));
      }
    };
    yMeta.observe(handleMetaChange);

    const initialLiveBg = yMeta.get("canvas_bg");
    if (initialLiveBg && typeof initialLiveBg === "object") {
      setCanvasBg((prev) => ({ ...prev, ...(initialLiveBg as Partial<CanvasBgConfig>) }));
    }

    const localSeedKey = `playground_${roomId}_has_seeded`;
    const localYjsKey = `playground_${roomId}_yjs_backup`;

    // Phục hồi state Yjs từ localStorage (giúp lưu giữ trạng thái xóa sạch kể cả khi F5 hoặc offline)
    if (typeof window !== "undefined") {
      const savedBackup = localStorage.getItem(localYjsKey);
      if (savedBackup) {
        try {
          const binary = Uint8Array.from(atob(savedBackup), (c) => c.charCodeAt(0));
          Y.applyUpdate(ydoc, binary);
        } catch {}
      }
    }

    // Tự động sao lưu trạng thái Yjs vào localStorage mỗi khi có thao tác (thêm, sửa, xóa)
    const handleYDocUpdate = () => {
      if (typeof window !== "undefined") {
        try {
          const update = Y.encodeStateAsUpdate(ydoc);
          let binaryStr = "";
          for (let i = 0; i < update.length; i++) {
            binaryStr += String.fromCharCode(update[i]);
          }
          localStorage.setItem(localYjsKey, btoa(binaryStr));
          localStorage.setItem(localSeedKey, "true");
        } catch {}
      }
    };
    ydoc.on("update", handleYDocUpdate);

    const seedInitialDataIfEmpty = () => {
      // Khi vào trang web là trống hoàn toàn, không nạp bất kỳ template mẫu nào
      yMeta.set("initialized", true);
      if (typeof window !== "undefined") {
        localStorage.setItem(localSeedKey, "true");
      }
    };

    const handleSync = (isSynced: boolean) => {
      if (isSynced) {
        seedInitialDataIfEmpty();
      }
    };
    provider.on("synced", handleSync);
    seedInitialDataIfEmpty();

    const updateLocalNotes = () => {
      const list: StickyNoteItem[] = [];
      yNotes.forEach((val) => {
        if (val && val.id) list.push(val);
      });
      setNotes(list);
    };
    updateLocalNotes();
    yNotes.observe(updateLocalNotes);

    const updateLocalTables = () => {
      const list: PlaygroundTableItem[] = [];
      yTables.forEach((val) => {
        if (val && val.id) list.push(val);
      });
      setTables(list);
    };
    updateLocalTables();
    yTables.observe(updateLocalTables);

    const updateLocalA4 = () => {
      const list: PlaygroundA4Doc[] = [];
      yA4.forEach((val) => {
        if (val && val.id) list.push(val);
      });
      setA4Docs(list);
    };
    updateLocalA4();
    yA4.observe(updateLocalA4);

    const updateLocalShapes = () => {
      const list: PlaygroundShapeItem[] = [];
      yShapes.forEach((val) => {
        if (val && val.id) list.push(val);
      });
      setShapes(list);
    };
    updateLocalShapes();
    yShapes.observe(updateLocalShapes);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      try {
        provider.awareness.setLocalState(null);
      } catch {}
      provider.off("status", handleStatus);
      provider.off("synced", handleSync);
      provider.awareness.off("change", handleAwarenessChange);
      ydoc.off("update", handleYDocUpdate);
      yMeta.unobserve(handleMetaChange);
      yNotes.unobserve(updateLocalNotes);
      yTables.unobserve(updateLocalTables);
      yA4.unobserve(updateLocalA4);
      yShapes.unobserve(updateLocalShapes);
      provider.disconnect();
    };
  }, [provider, ydoc, currentUser, roomId, accessState, isOwner]);

  // Spacebar hotkey, Keyboard Zoom Shortcuts anchored to mouse, and Delete / Backspace for selected items
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Hotkey xóa đối tượng được chọn (Note, Table, A4 Doc, Shape)
      if (
        (e.key === "Delete" || e.key === "Backspace") &&
        selectedItemRef.current &&
        (e.target as HTMLElement).tagName !== "TEXTAREA" &&
        (e.target as HTMLElement).tagName !== "INPUT" &&
        !(e.target as HTMLElement).isContentEditable
      ) {
        e.preventDefault();
        const sel = selectedItemRef.current;
        if (sel.type === "note") {
          ydoc.getMap<StickyNoteItem>("playground-notes").delete(sel.id);
        } else if (sel.type === "table") {
          ydoc.getMap<PlaygroundTableItem>("playground-tables").delete(sel.id);
        } else if (sel.type === "a4") {
          ydoc.getMap<PlaygroundA4Doc>("playground-a4-docs").delete(sel.id);
        } else if (sel.type === "shape") {
          ydoc.getMap<PlaygroundShapeItem>("playground-shapes").delete(sel.id);
        }
        setSelectedItem(null);
        return;
      }

      if (
        e.code === "Space" &&
        !isSpacePressed &&
        (e.target as HTMLElement).tagName !== "TEXTAREA" &&
        (e.target as HTMLElement).tagName !== "INPUT" &&
        !(e.target as HTMLElement).isContentEditable
      ) {
        e.preventDefault();
        setIsSpacePressed(true);
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === "+" || e.key === "=")) {
        e.preventDefault();
        applyZoomAtPoint((z) => +(z + 0.15).toFixed(2), mousePosRef.current.x, mousePosRef.current.y);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "-") {
        e.preventDefault();
        applyZoomAtPoint((z) => +(z - 0.15).toFixed(2), mousePosRef.current.x, mousePosRef.current.y);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "0") {
        e.preventDefault();
        setZoom(1);
        setPan({ x: 120, y: 100 });
        viewRef.current = { zoom: 1, pan: { x: 120, y: 100 } };
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        setIsSpacePressed(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [isSpacePressed, applyZoomAtPoint]);

  // Global click & Escape listeners to close Context Menu, Floating Menu and Pickers
  useEffect(() => {
    const handleGlobalClick = () => {
      setContextMenu(null);
      setAttachPickerDocId(null);
      setHeaderAttachPickerId(null);
      setIsTableDropdownOpen(false);
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setContextMenu(null);
        setFloatingMenu(null);
        setAttachPickerDocId(null);
        setHeaderAttachPickerId(null);
        setIsTableDropdownOpen(false);
      }
    };
    const handleSelectionChange = () => {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed || !sel.toString().trim()) {
        setFloatingMenu(null);
      }
      updateFormattingFromSelection();
    };

    window.addEventListener("click", handleGlobalClick);
    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("selectionchange", handleSelectionChange);
    return () => {
      window.removeEventListener("click", handleGlobalClick);
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("selectionchange", handleSelectionChange);
    };
  }, []);

  // Helper to dynamically inspect and synchronize Font Family, Font Size, and Color from current cursor/selection
  const updateFormattingFromSelection = useCallback(() => {
    const sel = window.getSelection();
    let targetEl: HTMLElement | null = null;

    if (sel && sel.rangeCount > 0) {
      let node: Node | null = sel.anchorNode;
      if (node) {
        if (node.nodeType === Node.TEXT_NODE) {
          node = node.parentElement;
        }
        if (node instanceof HTMLElement) {
          targetEl = node;
        }
      }
    }

    if (!targetEl && lastActiveRefKey.current) {
      targetEl = contentRefs.current[lastActiveRefKey.current];
    }

    if (targetEl) {
      const computed = window.getComputedStyle(targetEl);

      // 1. Detect Font Family
      const rawFamily = (computed.fontFamily || "").toLowerCase().replace(/['"]/g, "");
      const matchedFamily = FONT_FAMILIES.find((f) =>
        rawFamily.includes(f.name.toLowerCase()) || f.value.toLowerCase().includes(rawFamily)
      );
      if (matchedFamily) {
        setFontFamily(matchedFamily.name);
      }

      // 2. Detect Font Size (pixels)
      const rawSize = parseFloat(computed.fontSize);
      if (!isNaN(rawSize) && rawSize > 0) {
        setFontSize(Math.round(rawSize));
      }

      // 3. Detect Text Color
      const rawColor = computed.color;
      if (rawColor) {
        const rgb = rawColor.match(/\d+/g);
        if (rgb && rgb.length >= 3) {
          const r = parseInt(rgb[0], 10).toString(16).padStart(2, "0");
          const g = parseInt(rgb[1], 10).toString(16).padStart(2, "0");
          const b = parseInt(rgb[2], 10).toString(16).padStart(2, "0");
          setTextColor(`#${r}${g}${b}`);
        }
      }
    }
  }, []);

  // Synchronize Typography when selecting a Shape
  useEffect(() => {
    if (selectedItem?.type === "shape") {
      const sh = shapes.find((s) => s.id === selectedItem.id);
      if (sh) {
        if (sh.fontFamily) {
          const matched = FONT_FAMILIES.find(
            (f) =>
              sh.fontFamily?.toLowerCase().includes(f.name.toLowerCase()) ||
              f.value.toLowerCase().includes(sh.fontFamily?.toLowerCase() || "")
          );
          setFontFamily(matched ? matched.name : sh.fontFamily);
        }
        if (sh.fontSize) {
          setFontSize(sh.fontSize);
        }
        if (sh.textColor) {
          setTextColor(sh.textColor);
        }
      }
    }
  }, [selectedItem, shapes]);

  // Check selection to position floating formatting bar and inspect typography
  const checkSelection = (refKey: string) => {
    lastActiveRefKey.current = refKey;
    updateFormattingFromSelection();

    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || !sel.toString().trim()) {
      setFloatingMenu(null);
      return;
    }

    try {
      const range = sel.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setFloatingMenu({
          x: rect.left + rect.width / 2,
          y: Math.max(10, rect.top - 46),
          refKey,
        });
      }
    } catch {
      setFloatingMenu(null);
    }
  };

  // Apply formatting command (Bold, Italic, Underline, Strikethrough, Align)
  const applyFormatting = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    const key = lastActiveRefKey.current || floatingMenu?.refKey;
    if (!key) return;

    const el = contentRefs.current[key];
    if (!el) return;

    if (key.startsWith("a4-") || key.includes("-p")) {
      const [docId, pageStr] = key.split("-p");
      const pageIndex = parseInt(pageStr, 10) || 0;
      handleUpdateA4Page(docId, pageIndex, el.innerHTML);
    } else if (key.startsWith("shape-")) {
      handleUpdateShapeContent(key, el.innerHTML);
    } else {
      handleUpdateNote(key, "content", el.innerHTML);
    }
  };

  const handleApplyFontFamily = (familyValue: string, familyName: string) => {
    setFontFamily(familyName);
    setIsFontFamilyDropdownOpen(false);

    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && !sel.isCollapsed) {
      document.execCommand("fontName", false, familyValue);
      const key = lastActiveRefKey.current || floatingMenu?.refKey;
      if (key) {
        const el = contentRefs.current[key];
        if (el) {
          const fontTags = el.querySelectorAll("font[face]");
          fontTags.forEach((f) => {
            f.removeAttribute("face");
            (f as HTMLElement).style.fontFamily = familyValue;
          });
          if (key.startsWith("a4-") || key.includes("-p")) {
            const [docId, pageStr] = key.split("-p");
            handleUpdateA4Page(docId, parseInt(pageStr, 10) || 0, el.innerHTML);
          } else if (key.startsWith("shape-")) {
            handleUpdateShapeContent(key, el.innerHTML);
          } else {
            handleUpdateNote(key, "content", el.innerHTML);
          }
        }
      }
    } else if (selectedItem?.type === "shape") {
      const yShapes = ydoc.getMap<PlaygroundShapeItem>("playground-shapes");
      const cur = yShapes.get(selectedItem.id);
      if (cur) {
        yShapes.set(selectedItem.id, { ...cur, fontFamily: familyValue });
      }
    } else if (lastActiveRefKey.current) {
      document.execCommand("fontName", false, familyValue);
      const key = lastActiveRefKey.current;
      const el = contentRefs.current[key];
      if (el) {
        const fontTags = el.querySelectorAll("font[face]");
        fontTags.forEach((f) => {
          f.removeAttribute("face");
          (f as HTMLElement).style.fontFamily = familyValue;
        });
        if (key.startsWith("a4-") || key.includes("-p")) {
          const [docId, pageStr] = key.split("-p");
          handleUpdateA4Page(docId, parseInt(pageStr, 10) || 0, el.innerHTML);
        } else if (key.startsWith("shape-")) {
          handleUpdateShapeContent(key, el.innerHTML);
        } else {
          handleUpdateNote(key, "content", el.innerHTML);
        }
      }
    }
  };

  const handleApplyFontSize = (size: number) => {
    const clamped = Math.max(6, Math.min(96, size));
    setFontSize(clamped);
    setIsFontSizeDropdownOpen(false);

    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && !sel.isCollapsed) {
      document.execCommand("fontSize", false, "7");
      const key = lastActiveRefKey.current || floatingMenu?.refKey;
      if (key) {
        const el = contentRefs.current[key];
        if (el) {
          const fontTags = el.querySelectorAll('font[size="7"]');
          fontTags.forEach((f) => {
            f.removeAttribute("size");
            (f as HTMLElement).style.fontSize = `${clamped}px`;
          });
          if (key.startsWith("a4-") || key.includes("-p")) {
            const [docId, pageStr] = key.split("-p");
            handleUpdateA4Page(docId, parseInt(pageStr, 10) || 0, el.innerHTML);
          } else if (key.startsWith("shape-")) {
            handleUpdateShapeContent(key, el.innerHTML);
          } else {
            handleUpdateNote(key, "content", el.innerHTML);
          }
        }
      }
    } else if (selectedItem?.type === "shape") {
      const yShapes = ydoc.getMap<PlaygroundShapeItem>("playground-shapes");
      const cur = yShapes.get(selectedItem.id);
      if (cur) {
        yShapes.set(selectedItem.id, { ...cur, fontSize: clamped });
      }
    } else if (lastActiveRefKey.current) {
      document.execCommand("fontSize", false, "7");
      const key = lastActiveRefKey.current;
      const el = contentRefs.current[key];
      if (el) {
        const fontTags = el.querySelectorAll('font[size="7"]');
        fontTags.forEach((f) => {
          f.removeAttribute("size");
          (f as HTMLElement).style.fontSize = `${clamped}px`;
        });
        if (key.startsWith("a4-") || key.includes("-p")) {
          const [docId, pageStr] = key.split("-p");
          handleUpdateA4Page(docId, parseInt(pageStr, 10) || 0, el.innerHTML);
        } else if (key.startsWith("shape-")) {
          handleUpdateShapeContent(key, el.innerHTML);
        } else {
          handleUpdateNote(key, "content", el.innerHTML);
        }
      }
    }
  };

  const handleApplyTextColor = (color: string) => {
    setTextColor(color);
    setIsTextColorDropdownOpen(false);

    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && !sel.isCollapsed) {
      document.execCommand("foreColor", false, color);
      const key = lastActiveRefKey.current || floatingMenu?.refKey;
      if (key) {
        const el = contentRefs.current[key];
        if (el) {
          if (key.startsWith("a4-") || key.includes("-p")) {
            const [docId, pageStr] = key.split("-p");
            handleUpdateA4Page(docId, parseInt(pageStr, 10) || 0, el.innerHTML);
          } else if (key.startsWith("shape-")) {
            handleUpdateShapeContent(key, el.innerHTML);
          } else {
            handleUpdateNote(key, "content", el.innerHTML);
          }
        }
      }
    } else if (selectedItem?.type === "shape") {
      const yShapes = ydoc.getMap<PlaygroundShapeItem>("playground-shapes");
      const cur = yShapes.get(selectedItem.id);
      if (cur) {
        yShapes.set(selectedItem.id, { ...cur, textColor: color });
      }
    }
  };

  const handleApplyHighlightColor = (color: string) => {
    setHighlightColor(color);
    setIsHighlightDropdownOpen(false);

    if (color === "transparent") {
      document.execCommand("removeFormat", false, undefined);
    } else {
      document.execCommand("hiliteColor", false, color);
    }

    const key = lastActiveRefKey.current || floatingMenu?.refKey;
    if (key) {
      const el = contentRefs.current[key];
      if (el) {
        if (key.startsWith("a4-") || key.includes("-p")) {
          const [docId, pageStr] = key.split("-p");
          handleUpdateA4Page(docId, parseInt(pageStr, 10) || 0, el.innerHTML);
        } else if (key.startsWith("shape-")) {
          handleUpdateShapeContent(key, el.innerHTML);
        } else {
          handleUpdateNote(key, "content", el.innerHTML);
        }
      }
    }
  };

  // Broadcast mouse cursor coordinates in canvas space
  const broadcastCursor = useCallback(
    (clientX: number, clientY: number) => {
      const canvasX = Math.round((clientX - pan.x) / zoom);
      const canvasY = Math.round((clientY - pan.y) / zoom);
      provider.awareness.setLocalStateField("cursor", { x: canvasX, y: canvasY });
    },
    [pan.x, pan.y, zoom, provider]
  );

  // Figma Wheel Zoom & Pan with non-passive listener anchored to mouse
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      mousePosRef.current = { x: e.clientX, y: e.clientY };

      // In Figma & Miro: Zoom when Ctrl/Meta is pressed or on Pinch
      if (e.ctrlKey || e.metaKey || e.altKey) {
        const factor = e.deltaY < 0 ? 1.12 : 0.88;
        applyZoomAtPoint((z) => z * factor, e.clientX, e.clientY);
      } else {
        // Pan canvas with regular trackpad / wheel scroll
        setPan((prev) => {
          const nextPan = {
            x: Math.round(prev.x - e.deltaX),
            y: Math.round(prev.y - e.deltaY),
          };
          viewRef.current.pan = nextPan;
          return nextPan;
        });
      }
    };

    container.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      container.removeEventListener("wheel", onWheel);
    };
  }, [applyZoomAtPoint]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsTableDropdownOpen(false);
    setIsShapePaletteOpen(false);
    setIsFontFamilyDropdownOpen(false);
    setIsFontSizeDropdownOpen(false);
    setIsTextColorDropdownOpen(false);
    setIsHighlightDropdownOpen(false);

    // Chế độ CHỈ XEM: Khách không thể tạo hình, chọn hay di chuyển đối tượng
    if (userPermission === "view") {
      if (e.button === 0 || e.button === 1) {
        setIsPanning(true);
        setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      }
      return;
    }

    if (e.button === 0) {
      setSelectedItem(null);
      if (contextMenu) setContextMenu(null);
    }

    if (activeTool === "shape" && e.button === 0) {
      const canvasX = Math.round((e.clientX - pan.x) / zoom);
      const canvasY = Math.round((e.clientY - pan.y) / zoom);
      setIsDrawingShape(true);
      setDrawStartPos({ x: canvasX, y: canvasY });
      setDrawCurrentPos({ x: canvasX, y: canvasY });
      return;
    }

    if (activeTool === "hand" || isSpacePressed || e.button === 1) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  // Intercept Right Click and Open Custom Retro Context Menu
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    if (userPermission === "view") return;

    const canvasX = Math.round((e.clientX - pan.x) / zoom);
    const canvasY = Math.round((e.clientY - pan.y) / zoom);
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      canvasX,
      canvasY,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    mousePosRef.current = { x: e.clientX, y: e.clientY };
    broadcastCursor(e.clientX, e.clientY);

    // Pan canvas
    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
      return;
    }

    // Drag-to-draw new shape preview
    if (isDrawingShape) {
      const canvasX = Math.round((e.clientX - pan.x) / zoom);
      const canvasY = Math.round((e.clientY - pan.y) / zoom);
      setDrawCurrentPos({ x: canvasX, y: canvasY });
      return;
    }

    // Drag Shape
    if (draggingShapeId) {
      const canvasX = (e.clientX - pan.x) / zoom - shapeDragOffset.x;
      const canvasY = (e.clientY - pan.y) / zoom - shapeDragOffset.y;
      const snappedX = Math.round(canvasX / 10) * 10;
      const snappedY = Math.round(canvasY / 10) * 10;

      setShapes((prev) =>
        prev.map((s) => (s.id === draggingShapeId ? { ...s, x: snappedX, y: snappedY } : s))
      );

      const yShapes = ydoc.getMap<PlaygroundShapeItem>("playground-shapes");
      const current = yShapes.get(draggingShapeId);
      if (current) {
        yShapes.set(draggingShapeId, { ...current, x: snappedX, y: snappedY });
      }
      return;
    }

    // Resize Shape
    if (resizingShapeId) {
      const deltaX = (e.clientX - shapeResizeStart.mouseX) / zoom;
      const deltaY = (e.clientY - shapeResizeStart.mouseY) / zoom;
      const newWidth = Math.max(80, Math.round((shapeResizeStart.width + deltaX) / 10) * 10);
      const newHeight = Math.max(60, Math.round((shapeResizeStart.height + deltaY) / 10) * 10);

      setShapes((prev) =>
        prev.map((s) => (s.id === resizingShapeId ? { ...s, width: newWidth, height: newHeight } : s))
      );

      const yShapes = ydoc.getMap<PlaygroundShapeItem>("playground-shapes");
      const current = yShapes.get(resizingShapeId);
      if (current) {
        yShapes.set(resizingShapeId, { ...current, width: newWidth, height: newHeight });
      }
      return;
    }

    // Drag A4 Document
    if (draggingA4Id) {
      const canvasX = (e.clientX - pan.x) / zoom - a4DragOffset.x;
      const canvasY = (e.clientY - pan.y) / zoom - a4DragOffset.y;
      const snappedX = Math.round(canvasX / 10) * 10;
      const snappedY = Math.round(canvasY / 10) * 10;

      setA4Docs((prev) =>
        prev.map((d) => (d.id === draggingA4Id ? { ...d, x: snappedX, y: snappedY } : d))
      );

      // Kéo Tờ A4 lại gần đáy của một tờ A4 khác để HÍT NAM CHÂM GHÉP NỐI VÀO CUỐI
      let detectedBottomTarget: string | null = null;
      for (const other of a4Docs) {
        if (other.id === draggingA4Id) continue;
        // Chiều cao hiện tại của tờ doc kia
        const otherHeight = 45 + other.pages.length * 1123 + (other.pages.length - 1) * 32;
        const targetBottomY = other.y + otherHeight;

        // Nếu kéo lại gần đáy của tờ kia (khoảng cách ngang < 320px, khoảng cách dọc cách đáy < 350px)
        const isNearX = Math.abs(snappedX - other.x) < 320;
        const isNearBottomY = Math.abs(snappedY - targetBottomY) < 360;

        if (isNearX && isNearBottomY) {
          detectedBottomTarget = other.id;
          break;
        }
      }
      setSnapBottomTargetId(detectedBottomTarget);

      const yA4 = ydoc.getMap<PlaygroundA4Doc>("playground-a4-docs");
      const current = yA4.get(draggingA4Id);
      if (current) {
        yA4.set(draggingA4Id, { ...current, x: snappedX, y: snappedY });
      }
      return;
    }

    // Resize Note
    if (resizingNoteId) {
      const deltaX = (e.clientX - noteResizeStart.mouseX) / zoom;
      const deltaY = (e.clientY - noteResizeStart.mouseY) / zoom;
      const newWidth = Math.max(200, Math.round((noteResizeStart.width + deltaX) / 10) * 10);
      const newHeight = Math.max(140, Math.round((noteResizeStart.height + deltaY) / 10) * 10);

      setNotes((prev) =>
        prev.map((n) => (n.id === resizingNoteId ? { ...n, width: newWidth, height: newHeight } : n))
      );

      const yNotes = ydoc.getMap<StickyNoteItem>("playground-notes");
      const current = yNotes.get(resizingNoteId);
      if (current) {
        yNotes.set(resizingNoteId, { ...current, width: newWidth, height: newHeight });
      }
      return;
    }

    // Drag Note
    if (draggingNoteId) {
      const canvasX = (e.clientX - pan.x) / zoom - noteDragOffset.x;
      const canvasY = (e.clientY - pan.y) / zoom - noteDragOffset.y;
      const snappedX = Math.round(canvasX / 10) * 10;
      const snappedY = Math.round(canvasY / 10) * 10;

      setNotes((prev) =>
        prev.map((n) => (n.id === draggingNoteId ? { ...n, x: snappedX, y: snappedY } : n))
      );

      const yNotes = ydoc.getMap<StickyNoteItem>("playground-notes");
      const current = yNotes.get(draggingNoteId);
      if (current) {
        yNotes.set(draggingNoteId, { ...current, x: snappedX, y: snappedY });
      }
      return;
    }

    // Resize Table
    if (resizingTableId) {
      const deltaX = (e.clientX - tableResizeStart.mouseX) / zoom;
      const deltaY = (e.clientY - tableResizeStart.mouseY) / zoom;
      const newWidth = Math.max(320, Math.round((tableResizeStart.width + deltaX) / 10) * 10);
      const newHeight = Math.max(160, Math.round((tableResizeStart.height + deltaY) / 10) * 10);

      setTables((prev) =>
        prev.map((t) => (t.id === resizingTableId ? { ...t, width: newWidth, height: newHeight } : t))
      );

      const yTables = ydoc.getMap<PlaygroundTableItem>("playground-tables");
      const current = yTables.get(resizingTableId);
      if (current) {
        yTables.set(resizingTableId, { ...current, width: newWidth, height: newHeight });
      }
      return;
    }

    // Drag Table
    if (draggingTableId) {
      const canvasX = (e.clientX - pan.x) / zoom - tableDragOffset.x;
      const canvasY = (e.clientY - pan.y) / zoom - tableDragOffset.y;
      const snappedX = Math.round(canvasX / 10) * 10;
      const snappedY = Math.round(canvasY / 10) * 10;

      setTables((prev) =>
        prev.map((t) => (t.id === draggingTableId ? { ...t, x: snappedX, y: snappedY } : t))
      );

      const yTables = ydoc.getMap<PlaygroundTableItem>("playground-tables");
      const current = yTables.get(draggingTableId);
      if (current) {
        yTables.set(draggingTableId, { ...current, x: snappedX, y: snappedY });
      }
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setDraggingNoteId(null);
    setResizingNoteId(null);
    setDraggingTableId(null);
    setResizingTableId(null);

    // Kéo thả đè vào đáy để Ghép nối tiếp: nếu thả vào vùng snap đáy của một tờ khác
    if (draggingA4Id && snapBottomTargetId && draggingA4Id !== snapBottomTargetId) {
      handleAttachDocToBottom(snapBottomTargetId, draggingA4Id);
    }
    setDraggingA4Id(null);
    setSnapBottomTargetId(null);

    // Finish Drawing Shape
    if (isDrawingShape) {
      setIsDrawingShape(false);
      const rawDist = Math.hypot(drawCurrentPos.x - drawStartPos.x, drawCurrentPos.y - drawStartPos.y);

      if (isArrowConnector(selectedShapeType)) {
        let sX = drawStartPos.x;
        let sY = drawStartPos.y;
        let eX = drawCurrentPos.x;
        let eY = drawCurrentPos.y;
        if (rawDist < 15) {
          // Chỉ click chuột mà ko kéo: tạo mũi tên nằm ngang mặc định 160px
          eX = sX + 160;
          eY = sY;
        }

        const arrowPalette = ["#ff2a4b", "#00f0ff", "#39ff14", "#ffe600", "#ff007f"];
        const randomColor = arrowPalette[Math.floor(Math.random() * arrowPalette.length)];
        const minX = Math.min(sX, eX);
        const minY = Math.min(sY, eY);
        const w = Math.max(20, Math.abs(eX - sX));
        const h = Math.max(20, Math.abs(eY - sY));

        const newArrow: PlaygroundShapeItem = {
          id: "arrow-" + Date.now(),
          type: selectedShapeType,
          x: minX,
          y: minY,
          width: w,
          height: h,
          startX: sX,
          startY: sY,
          endX: eX,
          endY: eY,
          color: randomColor,
          content: "",
          textAlign: "left",
          verticalAlign: "top",
        };

        const yShapes = ydoc.getMap<PlaygroundShapeItem>("playground-shapes");
        yShapes.set(newArrow.id, newArrow);
        setSelectedItem({ type: "shape", id: newArrow.id });
        setActiveTool("select");
        return;
      }

      const minX = Math.min(drawStartPos.x, drawCurrentPos.x);
      const minY = Math.min(drawStartPos.y, drawCurrentPos.y);
      const rawW = Math.abs(drawCurrentPos.x - drawStartPos.x);
      const rawH = Math.abs(drawCurrentPos.y - drawStartPos.y);

      // Nếu kéo 1 đoạn quá nhỏ (< 20px) tức là chỉ click, cấp kích thước mặc định 180x160
      const width = rawW < 20 ? 180 : Math.max(80, Math.round(rawW / 10) * 10);
      const height = rawH < 20 ? 160 : Math.max(60, Math.round(rawH / 10) * 10);
      const x = rawW < 20 ? drawStartPos.x - 90 : minX;
      const y = rawH < 20 ? drawStartPos.y - 80 : minY;

      const palette = ["#00f0ff", "#ff007f", "#39ff14", "#ffe600", "#a855f7", "#ffffff"];
      const randomColor = palette[Math.floor(Math.random() * palette.length)];

      const newShape: PlaygroundShapeItem = {
        id: "shape-" + Date.now(),
        type: selectedShapeType,
        x,
        y,
        width,
        height,
        color: randomColor,
        content: "",
        fontSize,
        fontFamily,
        textColor,
        textAlign: "left",
        verticalAlign: "top",
      };

      const yShapes = ydoc.getMap<PlaygroundShapeItem>("playground-shapes");
      yShapes.set(newShape.id, newShape);
      setSelectedItem({ type: "shape", id: newShape.id });
      setActiveTool("select");
      return;
    }

    setDraggingShapeId(null);
    setResizingShapeId(null);
  };

  const handleMouseLeave = () => {
    if (isDrawingShape) {
      setIsDrawingShape(false);
    }
    handleMouseUp();
    provider.awareness.setLocalStateField("cursor", null);
  };

  // Note Handlers
  const handleNoteMouseDown = (e: React.MouseEvent, noteId: string, noteX: number, noteY: number) => {
    if (activeTool === "hand" || isSpacePressed) return;
    e.stopPropagation();
    setDraggingNoteId(noteId);
    const canvasMouseX = (e.clientX - pan.x) / zoom;
    const canvasMouseY = (e.clientY - pan.y) / zoom;
    setNoteDragOffset({
      x: canvasMouseX - noteX,
      y: canvasMouseY - noteY,
    });
  };

  const handleResizeNoteMouseDown = (
    e: React.MouseEvent,
    noteId: string,
    currentWidth: number = 280,
    currentHeight: number = 180
  ) => {
    e.stopPropagation();
    setResizingNoteId(noteId);
    setNoteResizeStart({
      mouseX: e.clientX,
      mouseY: e.clientY,
      width: currentWidth,
      height: currentHeight,
    });
  };

  const handleAddNoteAt = (canvasX?: number, canvasY?: number) => {
    const colors = ["#f59e0b", "#06b6d4", "#10b981", "#8b5cf6", "#ec4899", "#3b82f6"];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const x = canvasX ?? Math.round((-pan.x + 300) / zoom / 20) * 20;
    const y = canvasY ?? Math.round((-pan.y + 200) / zoom / 20) * 20;

    const newNote: StickyNoteItem = {
      id: "note-" + Date.now(),
      x,
      y,
      width: 280,
      height: 180,
      color: randomColor,
      title: `GHI CHÚ #${notes.length + 1}`,
      content: "Nhập nội dung ghi chú... Bôi đen văn bản để chỉnh phông chữ, cỡ chữ & căn lề!",
    };
    const yNotes = ydoc.getMap<StickyNoteItem>("playground-notes");
    yNotes.set(newNote.id, newNote);
  };

  const handleDeleteNote = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const yNotes = ydoc.getMap<StickyNoteItem>("playground-notes");
    yNotes.delete(id);
    if (floatingMenu?.refKey === id) setFloatingMenu(null);
    if (selectedItem?.id === id) setSelectedItem(null);
  };

  const handleUpdateNote = (id: string, field: "title" | "content", val: string) => {
    const yNotes = ydoc.getMap<StickyNoteItem>("playground-notes");
    const current = yNotes.get(id);
    if (current) {
      yNotes.set(id, { ...current, [field]: val });
    }
  };

  // Shape Handlers (Move, Resize, Content, Color, Type, Delete)
  const handleShapeMouseDown = (e: React.MouseEvent, shapeId: string, shapeX: number, shapeY: number) => {
    if (activeTool === "hand" || isSpacePressed) return;
    e.stopPropagation();
    setSelectedItem({ type: "shape", id: shapeId });
    setDraggingShapeId(shapeId);
    const canvasMouseX = (e.clientX - pan.x) / zoom;
    const canvasMouseY = (e.clientY - pan.y) / zoom;
    setShapeDragOffset({
      x: canvasMouseX - shapeX,
      y: canvasMouseY - shapeY,
    });
  };

  const handleResizeShapeMouseDown = (
    e: React.MouseEvent,
    shapeId: string,
    currentWidth: number = 180,
    currentHeight: number = 160
  ) => {
    e.stopPropagation();
    setResizingShapeId(shapeId);
    setShapeResizeStart({
      mouseX: e.clientX,
      mouseY: e.clientY,
      width: currentWidth,
      height: currentHeight,
    });
  };

  const handleDeleteShape = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const yShapes = ydoc.getMap<PlaygroundShapeItem>("playground-shapes");
    yShapes.delete(id);
    if (floatingMenu?.refKey === id) setFloatingMenu(null);
    if (selectedItem?.id === id) setSelectedItem(null);
  };

  const handleUpdateShapeContent = (id: string, content: string) => {
    const yShapes = ydoc.getMap<PlaygroundShapeItem>("playground-shapes");
    const current = yShapes.get(id);
    if (current) {
      yShapes.set(id, { ...current, content });
    }
  };

  const handleUpdateShapeColor = (id: string, color: string) => {
    const yShapes = ydoc.getMap<PlaygroundShapeItem>("playground-shapes");
    const current = yShapes.get(id);
    if (current) {
      yShapes.set(id, { ...current, color });
    }
  };

  const handleUpdateShapeType = (id: string, type: ShapeType) => {
    const yShapes = ydoc.getMap<PlaygroundShapeItem>("playground-shapes");
    const current = yShapes.get(id);
    if (current) {
      yShapes.set(id, { ...current, type });
    }
  };

  const handleUpdateShapeTextAlign = (id: string, textAlign: "left" | "center" | "right") => {
    const yShapes = ydoc.getMap<PlaygroundShapeItem>("playground-shapes");
    const current = yShapes.get(id);
    if (current) {
      yShapes.set(id, { ...current, textAlign });
    }
  };

  const handleUpdateShapeVerticalAlign = (id: string, verticalAlign: "top" | "center" | "bottom") => {
    const yShapes = ydoc.getMap<PlaygroundShapeItem>("playground-shapes");
    const current = yShapes.get(id);
    if (current) {
      yShapes.set(id, { ...current, verticalAlign });
    }
  };

  const handleUpdateArrowEndpoints = (
    id: string,
    startX: number,
    startY: number,
    endX: number,
    endY: number
  ) => {
    const yShapes = ydoc.getMap<PlaygroundShapeItem>("playground-shapes");
    const current = yShapes.get(id);
    if (current) {
      const minX = Math.min(startX, endX);
      const minY = Math.min(startY, endY);
      const width = Math.max(20, Math.abs(endX - startX));
      const height = Math.max(20, Math.abs(endY - startY));
      yShapes.set(id, {
        ...current,
        startX,
        startY,
        endX,
        endY,
        x: minX,
        y: minY,
        width,
        height,
      });
    }
  };

  const handleUpdateShapeStrokeDash = (id: string, strokeDash: boolean) => {
    const yShapes = ydoc.getMap<PlaygroundShapeItem>("playground-shapes");
    const current = yShapes.get(id);
    if (current) {
      yShapes.set(id, { ...current, strokeDash });
    }
  };

  // Table Handlers
  const handleTableMouseDown = (e: React.MouseEvent, tableId: string, tableX: number, tableY: number) => {
    if (activeTool === "hand" || isSpacePressed) return;
    e.stopPropagation();
    setDraggingTableId(tableId);
    const canvasMouseX = (e.clientX - pan.x) / zoom;
    const canvasMouseY = (e.clientY - pan.y) / zoom;
    setTableDragOffset({
      x: canvasMouseX - tableX,
      y: canvasMouseY - tableY,
    });
  };

  const handleResizeTableMouseDown = (
    e: React.MouseEvent,
    tableId: string,
    currentWidth: number = 420,
    currentHeight: number = 240
  ) => {
    e.stopPropagation();
    setResizingTableId(tableId);
    setNoteResizeStart({
      mouseX: e.clientX,
      mouseY: e.clientY,
      width: currentWidth,
      height: currentHeight,
    });
  };

  const handleAddTableAt = (canvasX?: number, canvasY?: number) => {
    const colors = ["#06b6d4", "#10b981", "#f59e0b", "#8b5cf6"];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const x = canvasX ?? Math.round((-pan.x + 350) / zoom / 20) * 20;
    const y = canvasY ?? Math.round((-pan.y + 250) / zoom / 20) * 20;

    const newTable: PlaygroundTableItem = {
      id: "table-" + Date.now(),
      x,
      y,
      width: 440,
      height: 220,
      color: randomColor,
      title: `BẢNG DỮ LIỆU #${tables.length + 1}`,
      headers: ["Cột 1", "Cột 2", "Cột 3"],
      rows: [
        ["Dữ liệu 1", "Dữ liệu 2", "Dữ liệu 3"],
        ["Dữ liệu 4", "Dữ liệu 5", "Dữ liệu 6"],
      ],
    };
    const yTables = ydoc.getMap<PlaygroundTableItem>("playground-tables");
    yTables.set(newTable.id, newTable);
  };

  const handleDeleteTable = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const yTables = ydoc.getMap<PlaygroundTableItem>("playground-tables");
    yTables.delete(id);
    if (selectedItem?.id === id) setSelectedItem(null);
  };

  const handleAddTableRow = (tableId: string) => {
    const yTables = ydoc.getMap<PlaygroundTableItem>("playground-tables");
    const current = yTables.get(tableId);
    if (current) {
      const newRow = new Array(current.headers.length).fill("...");
      yTables.set(tableId, { ...current, rows: [...current.rows, newRow] });
    }
  };

  const handleDeleteTableRow = (tableId: string) => {
    const yTables = ydoc.getMap<PlaygroundTableItem>("playground-tables");
    const current = yTables.get(tableId);
    if (current && current.rows.length > 1) {
      yTables.set(tableId, {
        ...current,
        rows: current.rows.slice(0, -1),
      });
    }
  };

  const handleUpdateTableCellAlign = (tableId: string, cellAlign: "left" | "center" | "right") => {
    const yTables = ydoc.getMap<PlaygroundTableItem>("playground-tables");
    const current = yTables.get(tableId);
    if (current) yTables.set(tableId, { ...current, cellAlign });
  };

  const handleAddTableCol = (tableId: string) => {
    const yTables = ydoc.getMap<PlaygroundTableItem>("playground-tables");
    const current = yTables.get(tableId);
    if (current) {
      const newHeaders = [...current.headers, `Cột ${current.headers.length + 1}`];
      const newRows = current.rows.map((r) => [...r, "..."]);
      yTables.set(tableId, { ...current, headers: newHeaders, rows: newRows });
    }
  };

  const handleDeleteTableCol = (tableId: string) => {
    const yTables = ydoc.getMap<PlaygroundTableItem>("playground-tables");
    const current = yTables.get(tableId);
    if (current && current.headers.length > 1) {
      const newHeaders = current.headers.slice(0, -1);
      const newRows = current.rows.map((r) => r.slice(0, -1));
      yTables.set(tableId, {
        ...current,
        headers: newHeaders,
        rows: newRows,
      });
    }
  };

  const handleUpdateTableCell = (tableId: string, rowIndex: number, colIndex: number, val: string) => {
    const yTables = ydoc.getMap<PlaygroundTableItem>("playground-tables");
    const current = yTables.get(tableId);
    if (current) {
      const newRows = current.rows.map((r, ri) =>
        ri === rowIndex ? r.map((c, ci) => (ci === colIndex ? val : c)) : r
      );
      yTables.set(tableId, { ...current, rows: newRows });
    }
  };

  const handleUpdateTableHeader = (tableId: string, colIndex: number, val: string) => {
    const yTables = ydoc.getMap<PlaygroundTableItem>("playground-tables");
    const current = yTables.get(tableId);
    if (current) {
      const newHeaders = current.headers.map((h, i) => (i === colIndex ? val : h));
      yTables.set(tableId, { ...current, headers: newHeaders });
    }
  };

  // A4 Document Handlers
  const handleA4MouseDown = (e: React.MouseEvent, docId: string, docX: number, docY: number) => {
    if (activeTool === "hand" || isSpacePressed) return;
    e.stopPropagation();
    setDraggingA4Id(docId);
    const canvasMouseX = (e.clientX - pan.x) / zoom;
    const canvasMouseY = (e.clientY - pan.y) / zoom;
    setA4DragOffset({
      x: canvasMouseX - docX,
      y: canvasMouseY - docY,
    });
  };

  // Tạo tờ A4 độc lập mới ở bất kỳ vị trí nào
  const handleAddA4DocAt = (canvasX?: number, canvasY?: number) => {
    const count = a4Docs.length + 1;
    const x = canvasX ?? Math.round((-pan.x + 350) / zoom / 20) * 20;
    const y = canvasY ?? Math.round((-pan.y + 120) / zoom / 20) * 20;

    const newDoc: PlaygroundA4Doc = {
      id: "a4-" + Date.now(),
      x,
      y,
      title: `TỜ A4 #${count}`,
      pages: [
        `<h2>Tiêu đề tài liệu #${count}</h2><p>Bắt đầu soạn thảo văn bản tại đây. Sử dụng thanh công cụ phía trên để định dạng chữ, phông chữ, cỡ chữ và màu sắc.</p>`,
      ],
    };
    const yA4 = ydoc.getMap<PlaygroundA4Doc>("playground-a4-docs");
    yA4.set(newDoc.id, newDoc);
  };

  // GHÉP TỜ 2 VÀO CUỐI TỜ 1 ĐỂ TẠO THÀNH 2 TRANG LIÊN TỤC
  const handleAttachDocToBottom = (targetDocId: string, sourceDocId: string) => {
    if (targetDocId === sourceDocId) return;

    const yA4 = ydoc.getMap<PlaygroundA4Doc>("playground-a4-docs");
    const targetDoc = yA4.get(targetDocId);
    const sourceDoc = yA4.get(sourceDocId);

    if (targetDoc && sourceDoc) {
      const mergedPages = [...targetDoc.pages, ...sourceDoc.pages];
      yA4.set(targetDocId, {
        ...targetDoc,
        title:
          targetDoc.pages.length === 1 && sourceDoc.pages.length === 1
            ? `${targetDoc.title} + ${sourceDoc.title.replace("📄 ", "")} (2 tờ liên tục)`
            : targetDoc.title,
        pages: mergedPages,
      });
      yA4.delete(sourceDocId);
    }
    setSnapBottomTargetId(null);
    setAttachPickerDocId(null);
    setHeaderAttachPickerId(null);
  };

  // Tách một trang ra thành 1 tờ A4 độc lập riêng
  const handleSplitPageToNewDoc = (docId: string, pageIndex: number) => {
    const yA4 = ydoc.getMap<PlaygroundA4Doc>("playground-a4-docs");
    const current = yA4.get(docId);
    if (!current || current.pages.length <= 1) return;

    const pageContent = current.pages[pageIndex];
    const remainingPages = current.pages.filter((_, i) => i !== pageIndex);
    yA4.set(docId, { ...current, pages: remainingPages });

    const newDoc: PlaygroundA4Doc = {
      id: "a4-" + Date.now(),
      x: current.x + 850,
      y: current.y + pageIndex * 60,
      title: `📄 TỜ A4 TÁCH RA (Trang ${pageIndex + 1})`,
      pages: [pageContent],
    };
    yA4.set(newDoc.id, newDoc);
  };

  const handleUpdateA4Page = (docId: string, pageIndex: number, content: string) => {
    const yA4 = ydoc.getMap<PlaygroundA4Doc>("playground-a4-docs");
    const current = yA4.get(docId);
    if (current) {
      const pages = [...current.pages];
      pages[pageIndex] = content;
      yA4.set(docId, { ...current, pages });
    }
  };

  const handleAddA4Page = (docId: string) => {
    const yA4 = ydoc.getMap<PlaygroundA4Doc>("playground-a4-docs");
    const current = yA4.get(docId);
    if (current) {
      const pages = [...current.pages, "<p><br></p>"];
      yA4.set(docId, { ...current, pages });
    }
  };

  const handleA4PageOverflow = (
    docId: string,
    pageIndex: number,
    currentPageContent: string,
    overflowHtml: string
  ) => {
    const yA4 = ydoc.getMap<PlaygroundA4Doc>("playground-a4-docs");
    const current = yA4.get(docId);
    if (!current) return;

    const pages = [...current.pages];
    pages[pageIndex] = currentPageContent;

    if (pageIndex + 1 < pages.length) {
      // Prepend overflow to next page
      pages[pageIndex + 1] = overflowHtml + (pages[pageIndex + 1] || "");
    } else {
      // Append brand new A4 page
      pages.push(overflowHtml || "<p><br></p>");
    }

    yA4.set(docId, { ...current, pages });

    // Seamlessly focus the next page
    setTimeout(() => {
      const nextPageKey = `${docId}-p${pageIndex + 1}`;
      const nextEl = contentRefs.current[nextPageKey];
      if (nextEl) {
        nextEl.focus();
        try {
          const range = document.createRange();
          range.selectNodeContents(nextEl);
          range.collapse(false);
          const sel = window.getSelection();
          if (sel) {
            sel.removeAllRanges();
            sel.addRange(range);
          }
        } catch {}
      }
    }, 60);
  };

  const handleUpdateA4Title = (docId: string, title: string) => {
    const yA4 = ydoc.getMap<PlaygroundA4Doc>("playground-a4-docs");
    const current = yA4.get(docId);
    if (current) {
      yA4.set(docId, { ...current, title });
    }
  };

  const handleDeleteA4Page = (docId: string, pageIndex: number) => {
    const yA4 = ydoc.getMap<PlaygroundA4Doc>("playground-a4-docs");
    const current = yA4.get(docId);
    if (!current) return;
    if (current.pages.length <= 1) {
      yA4.delete(docId);
      if (selectedItem?.id === docId) setSelectedItem(null);
      return;
    }
    const remainingPages = current.pages.filter((_, i) => i !== pageIndex);
    yA4.set(docId, { ...current, pages: remainingPages });
  };

  const handleDeleteA4Doc = (docId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const yA4 = ydoc.getMap<PlaygroundA4Doc>("playground-a4-docs");
    yA4.delete(docId);
    if (selectedItem?.id === docId) setSelectedItem(null);
  };

  // Dọn sạch toàn bộ bàn vẽ (Xóa sạch tất cả Note, Bảng, Tờ A4, Hình khối)
  const handleClearCanvas = () => {
    if (window.confirm("Bạn có chắc chắn muốn xóa TOÀN BỘ Ghi chú, Bảng, Tờ A4 và Hình khối trên bàn vẽ không?")) {
      const yMeta = ydoc.getMap("playground-metadata");
      yMeta.set("initialized", true);
      const yNotes = ydoc.getMap<StickyNoteItem>("playground-notes");
      notes.forEach((n) => yNotes.delete(n.id));
      const yTables = ydoc.getMap<PlaygroundTableItem>("playground-tables");
      tables.forEach((t) => yTables.delete(t.id));
      const yA4 = ydoc.getMap<PlaygroundA4Doc>("playground-a4-docs");
      a4Docs.forEach((d) => yA4.delete(d.id));
      const yShapes = ydoc.getMap<PlaygroundShapeItem>("playground-shapes");
      shapes.forEach((s) => yShapes.delete(s.id));
      setSelectedItem(null);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const resetViewport = () => {
    setZoom(1);
    setPan({ x: 120, y: 100 });
    viewRef.current = { zoom: 1, pan: { x: 120, y: 100 } };
  };

  const cursorClass = isPanning
    ? "cursor-grabbing"
    : activeTool === "hand" || isSpacePressed
    ? "cursor-grab"
    : activeTool === "shape"
    ? "cursor-crosshair"
    : "cursor-default";

  if (accessState === "checking") {
    return (
      <div className="w-screen h-screen bg-[#090817] flex flex-col items-center justify-center font-retro-text text-slate-300 select-none">
        <PixelDiscordBot size={56} className="animate-bounce mb-4" />
        <div className="font-pixel text-xs text-cyan-300 mb-2 tracking-widest animate-pulse">
          KIỂM TRA QUYỀN TRUY CẬP...
        </div>
        <div className="text-xs text-slate-500 font-mono">
          Xác thực tài khoản và kiểm tra trạng thái bảo mật Canvas
        </div>
      </div>
    );
  }

  if (accessState === "forbidden") {
    const myCode = currentUser.accountCode || (getClientOwnerId() ? getClientOwnerId()!.slice(0, 8).toUpperCase() : "GUEST");

    return (
      <div className="min-h-screen bg-[#060a14] text-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 font-retro-text select-none">
        <div className="max-w-lg w-full bg-[#0d1120] border-4 border-[#1a2236] p-6 sm:p-8 shadow-[6px_6px_0_0_#000] text-center flex flex-col items-center gap-5">
          <div className="w-16 h-16 border-2 border-amber-500/60 bg-[#161b2e] flex items-center justify-center text-amber-400 shadow-[3px_3px_0_0_#d97706]">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h1 className="font-pixel text-base text-amber-400 tracking-wider">
              CANVAS NÀY Ở CHẾ ĐỘ PRIVATE
            </h1>
            <p className="text-xs text-slate-400 font-mono leading-relaxed max-w-sm mx-auto">
              Chủ sở hữu đã đặt canvas này ở chế độ riêng tư. Bạn cần được cấp quyền để có thể xem hoặc vẽ cùng.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
              <span className="inline-block bg-[#111826] border border-[#1f2d42] px-2.5 py-1 text-[10px] font-mono text-slate-400">
                Mã Canvas: #{roomId.slice(0, 8)}
              </span>
              <span className="inline-block bg-[#111826] border border-cyan-900/60 px-2.5 py-1 text-[10px] font-mono text-cyan-300">
                Tài khoản của bạn: #{myCode}
              </span>
            </div>
          </div>

          {/* ACCESS REQUEST SECTION */}
          {pendingRequest ? (
            <div className="w-full bg-[#151a2c] border-2 border-amber-500/60 p-4 text-left font-mono space-y-3 shadow-[3px_3px_0_0_#d97706]">
              <div className="flex items-center justify-between border-b border-amber-500/30 pb-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-amber-400 border border-black animate-pulse" />
                  <span className="font-pixel text-[11px] text-amber-300 tracking-wider">
                    ĐÃ GỬI YÊU CẦU TRUY CẬP
                  </span>
                </div>
                <span className="text-[9px] px-1.5 py-0.5 border border-amber-500/50 text-amber-300 font-pixel">
                  {pendingRequest.permission === "view" ? "XIN XEM" : "XIN SỬA"}
                </span>
              </div>

              <div className="text-xs text-slate-300 space-y-1">
                {pendingRequest.note && (
                  <div className="text-[11px] text-slate-400 italic bg-[#0d101a] p-2 border border-[#1b2338]">
                    &ldquo;{pendingRequest.note}&rdquo;
                  </div>
                )}
                <div className="flex items-center gap-2 text-[10px] text-slate-400 pt-1">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
                  <span>Đang đợi chủ phòng phê duyệt (tự động mở phòng khi được duyệt)...</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#1b2338]">
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="retro-btn px-3 py-1 text-[10px] font-pixel text-cyan-300 border border-cyan-500/50 hover:bg-cyan-500/10 cursor-pointer uppercase"
                >
                  KIỂM TRA LẠI NGAY
                </button>
                <button
                  type="button"
                  onClick={handleCancelAccessRequest}
                  className="text-slate-500 hover:text-rose-400 text-[10px] font-pixel px-2 py-1 cursor-pointer"
                >
                  HỦY YÊU CẦU
                </button>
              </div>
            </div>
          ) : (
            <div className="w-full bg-[#111625] border-2 border-[#202b45] p-4 text-left font-mono space-y-3 shadow-[3px_3px_0_0_#000]">
              <div className="flex items-center gap-1.5 text-cyan-300 font-pixel text-[11px] uppercase tracking-wider">
                <SendIcon className="w-3.5 h-3.5 text-cyan-400" />
                <span>GỬI YÊU CẦU QUYỀN TRUY CẬP</span>
              </div>

              <div className="space-y-2.5">
                <div>
                  <label className="text-[9px] font-pixel text-slate-400 uppercase tracking-wider block mb-1">
                    LOẠI QUYỀN MONG MUỐN:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRequestPermChoice("edit")}
                      className={`py-1.5 px-2 text-[10px] font-pixel border cursor-pointer flex items-center justify-center gap-1.5 transition ${
                        requestPermChoice === "edit"
                          ? "border-cyan-400 bg-cyan-950/40 text-cyan-300 shadow-[2px_2px_0_0_#00f0ff]"
                          : "border-[#1c273e] bg-[#0c101c] text-slate-400 hover:text-white"
                      }`}
                    >
                      <span>CHỈNH SỬA</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRequestPermChoice("view")}
                      className={`py-1.5 px-2 text-[10px] font-pixel border cursor-pointer flex items-center justify-center gap-1.5 transition ${
                        requestPermChoice === "view"
                          ? "border-sky-400 bg-sky-950/40 text-sky-300 shadow-[2px_2px_0_0_#38bdf8]"
                          : "border-[#1c273e] bg-[#0c101c] text-slate-400 hover:text-white"
                      }`}
                    >
                      <span>CHỈ XEM</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[9px] font-pixel text-slate-400 uppercase tracking-wider block mb-1">
                    LỜI NHẮN GỬI CHỦ PHÒNG (TÙY CHỌN):
                  </label>
                  <input
                    value={requestNote}
                    onChange={(e) => setRequestNote(e.target.value)}
                    placeholder="vd: Cho mình vào thảo luận đồ án cùng nhé..."
                    className="w-full bg-[#0a0d17] border border-[#202c46] text-white text-xs font-mono px-3 py-2 focus:outline-none focus:border-cyan-400"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSubmitAccessRequest();
                    }}
                  />
                </div>

                {requestErrorMsg && (
                  <div className="text-[10px] text-rose-400 font-mono bg-rose-950/40 border border-rose-800 p-2">
                    {requestErrorMsg}
                  </div>
                )}
                {requestSuccessMsg && (
                  <div className="text-[10px] text-emerald-400 font-mono bg-emerald-950/40 border border-emerald-800 p-2">
                    {requestSuccessMsg}
                  </div>
                )}

                <button
                  type="button"
                  disabled={requestSubmitting}
                  onClick={() => handleSubmitAccessRequest()}
                  className="retro-btn-amber w-full py-2.5 text-[11px] font-pixel uppercase cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  <SendIcon className="w-3.5 h-3.5 text-black" />
                  <span>{requestSubmitting ? "ĐANG GỬI YÊU CẦU..." : "GỬI YÊU CẦU TRUY CẬP"}</span>
                </button>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 w-full pt-1">
            <Link
              href="/pro"
              className="retro-btn flex-1 py-2 text-[10px] font-pixel uppercase text-center cursor-pointer flex items-center justify-center text-slate-300 hover:text-white"
            >
              ← VỀ FILE CỦA TÔI
            </Link>
            <button
              onClick={async () => {
                const res = await fetch("/api/files", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ title: "Untitled Canvas" }),
                });
                const data = await res.json().catch(() => ({}));
                if (data?.file) {
                  router.push(`/pro/${data.file.id}`);
                }
              }}
              className="retro-btn flex-1 py-2 text-[10px] font-pixel text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/10 uppercase cursor-pointer"
            >
              + TẠO CANVAS MỚI
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onContextMenu={handleContextMenu}
      className={`relative w-screen h-screen overflow-hidden select-none font-retro-text ${cursorClass}`}
      style={{
        backgroundColor: activeTheme.bgColor,
      }}
    >
      {/* VS CODE STYLE BACKGROUND WALLPAPER LAYER */}
      {canvasBg.imageUrl && (
        <div
          className="absolute inset-0 pointer-events-none overflow-hidden z-0 select-none transition-all duration-300"
          style={{
            opacity: canvasBg.imageOpacity ?? 0.22,
            filter: `blur(${canvasBg.imageBlur ?? 6}px)`,
            transform: "scale(1.06)", // scale slightly to avoid edge clipping from blur
          }}
        >
          {canvasBg.imageFit === "bottom-right" ? (
            <div
              className="absolute right-6 bottom-6 w-1/2 h-3/4 max-w-2xl bg-contain bg-no-repeat bg-right-bottom"
              style={{ backgroundImage: `url(${canvasBg.imageUrl})` }}
            />
          ) : canvasBg.imageFit === "center" ? (
            <div
              className="absolute inset-0 bg-no-repeat bg-center"
              style={{
                backgroundImage: `url(${canvasBg.imageUrl})`,
                backgroundSize: "contain",
              }}
            />
          ) : canvasBg.imageFit === "contain" ? (
            <div
              className="absolute inset-0 bg-contain bg-no-repeat bg-center"
              style={{ backgroundImage: `url(${canvasBg.imageUrl})` }}
            />
          ) : (
            // Default "cover"
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url(${canvasBg.imageUrl})` }}
            />
          )}
        </div>
      )}

      {/* Grid Pattern Layer (Overlaid transparently on top of wallpaper) */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          ...activeTheme.renderCss(zoom, pan, canvasBg.gridSize, canvasBg.showGrid),
          backgroundColor: "transparent",
        }}
      />

      {/* Subtle CRT scanline overlay placed at z-0 behind canvas items so paper is clean white */}
      {canvasBg.scanlines && (
        <div className="absolute inset-0 crt-scanlines pointer-events-none opacity-5 z-0" />
      )}

      {/* TOP HUD HEADER - RETRO ARCADE WORKSTATION BAR */}
      <header className="absolute top-0 left-0 right-0 h-11 bg-[#0c0f18] border-b-2 border-black retro-panel px-3 flex items-center justify-between z-40">
        <div className="flex items-center gap-2.5">
          <Link
            href="/pro"
            title="Quay lại Pro Arcade"
            className="retro-btn flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-pixel cursor-pointer"
          >
            <ArrowLeft className="w-3 h-3 text-cyan-400" />
            <span className="hidden sm:inline">THOÁT</span>
          </Link>

          <div className="retro-divider-v h-5" />

          {/* Machine Brand & Room Badge */}
          <div className="retro-panel-sunken flex items-center gap-2 px-2.5 py-1">
            <PixelDiscordBot size={20} />
            <span className="font-pixel text-[11px] text-cyan-400 tracking-wider">
              ARCADEDOCS.PRO
            </span>

            {/* File title — editable inline */}
            {fileInfo && (
              editingTitle ? (
                <div className="flex items-center gap-1">
                  <input
                    autoFocus
                    value={titleDraft}
                    onChange={(e) => setTitleDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleUpdateTitle(titleDraft);
                      if (e.key === "Escape") setEditingTitle(false);
                    }}
                    onBlur={() => handleUpdateTitle(titleDraft)}
                    className="bg-[#121624] border border-cyan-500/50 text-white text-[10px] font-mono px-2 py-0.5 w-40 focus:outline-none"
                  />
                </div>
              ) : (
                <span
                  className={`text-[10px] font-mono text-slate-300 truncate max-w-[160px] ${isOwner ? "cursor-pointer hover:text-cyan-300" : ""}`}
                  title={isOwner ? "Click để đổi tên" : fileInfo.title}
                  onClick={() => { if (isOwner) { setEditingTitle(true); setTitleDraft(fileInfo.title); }}}
                >
                  {fileInfo.title}
                </span>
              )
            )}
            {!fileInfo && (
              <span className="text-[10px] text-amber-300/80 font-mono px-1.5 bg-[#121624] border border-[#243048]">
                #{roomId}
              </span>
            )}

            {/* Role badge: OWNER vs GUEST */}
            {isOwner ? (
              <span
                className="text-[9px] font-pixel text-cyan-400 bg-cyan-950/50 border border-cyan-500/50 px-1.5 py-0.5 shadow-[1px_1px_0_0_#000]"
                title="Bạn là Chủ sở hữu của Canvas này"
              >
                👑 OWNER
              </span>
            ) : (
              <span
                className="text-[9px] font-pixel text-slate-400 bg-slate-900 border border-slate-700 px-1.5 py-0.5"
                title="Bạn đang tham gia với tư cách Khách"
              >
                GUEST
              </span>
            )}

            {/* Privacy badge & switch */}
            {fileInfo && isOwner && (
              <button
                onClick={handleTogglePrivacy}
                disabled={privacyLoading}
                className={`flex items-center gap-1 text-[9px] font-pixel px-1.5 py-0.5 border cursor-pointer transition disabled:opacity-50 ${
                  fileInfo.is_public
                    ? "border-emerald-600/50 text-emerald-400 hover:bg-emerald-500/10"
                    : "border-amber-600/50 text-amber-400 hover:bg-amber-500/10"
                }`}
                title={fileInfo.is_public ? "PUBLIC — ai có link đều vào được. Click để chuyển PRIVATE" : "PRIVATE — chỉ bạn mới mở được. Click để chuyển PUBLIC"}
              >
                {fileInfo.is_public ? <Globe className="w-2.5 h-2.5" /> : <Lock className="w-2.5 h-2.5" />}
                <span>{fileInfo.is_public ? "PUBLIC" : "PRIVATE"}</span>
              </button>
            )}
            {fileInfo && !isOwner && (
              <span
                className={`flex items-center gap-1 text-[9px] font-pixel px-1.5 py-0.5 border ${
                  fileInfo.is_public
                    ? "border-emerald-600/40 text-emerald-400"
                    : "border-amber-600/40 text-amber-400"
                }`}
                title={fileInfo.is_public ? "Phòng Public — Mọi người đều có thể truy cập" : "Phòng Private"}
              >
                {fileInfo.is_public ? <Globe className="w-2.5 h-2.5" /> : <Lock className="w-2.5 h-2.5" />}
                <span>{fileInfo.is_public ? "PUBLIC" : "PRIVATE"}</span>
              </span>
            )}

            {status === "connected" && (
              <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono pl-1">
                <span className="w-2 h-2 bg-emerald-400 border border-black animate-pulse" />
                ONLINE
              </span>
            )}
            {status === "connecting" && (
              <span className="text-[10px] text-amber-400 font-mono pl-1">
                CONNECTING...
              </span>
            )}
          </div>
        </div>

        {/* Players Online Count & Invite Button */}
        <div className="flex items-center gap-2.5">
          <div className="retro-panel-sunken flex items-center gap-2 px-2.5 py-1 text-xs font-mono">
            <Users className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-300 text-[11px] font-pixel text-[9px]">
              {onlineUsers.length + 1} USER{onlineUsers.length > 0 ? "S" : ""}
            </span>

            {/* Avatar của chính mình */}
            <span
              className="w-3 h-3 border border-black cursor-help"
              style={{ backgroundColor: currentUser.color }}
              title={`Bạn: ${currentUser.name}${currentUser.accountCode ? ` (#${currentUser.accountCode})` : ""}`}
            />

            {/* Avatar của những người dùng khác (mỗi người 1 ô, không bị lặp khi họ mở nhiều tab) */}
            {onlineUsers.map((u) => (
              <span
                key={u.id}
                className="w-3 h-3 border border-black animate-pulse cursor-help"
                style={{ backgroundColor: u.color }}
                title={`${u.name}${u.accountCode ? ` (#${u.accountCode})` : ""}`}
              />
            ))}
          </div>

          <button
            onClick={() => {
              setShowShareModal(true);
              loadOwnerAccessRequests();
            }}
            className="retro-btn-amber flex items-center gap-1.5 px-3 py-1 text-[10px] font-pixel uppercase tracking-wider cursor-pointer relative"
            title="Mở bảng cài đặt chia sẻ & thành viên"
          >
            <Share2 className="w-3.5 h-3.5 text-black" />
            <span>CHIA SẺ & MỜI</span>
            {isOwner && pendingRequests.length > 0 && (
              <span className="absolute -top-2 -right-2 px-1.5 py-0.2 bg-rose-500 text-white font-mono text-[9px] font-bold border border-black shadow-[2px_2px_0_0_#000] animate-bounce">
                {pendingRequests.length}
              </span>
            )}
          </button>
        </div>
      </header>


      {/* =========================================================================
          TOP UNIFIED ARCADE ACTION & FORMATTING TOOLBAR (MODULAR RETRO CONSOLE RACK)
          ========================================================================= */}
      <div
        onMouseDown={(e) => e.stopPropagation()}
        className="absolute top-11 left-0 right-0 h-11 bg-[#090b12] border-b-2 border-black retro-panel px-2.5 flex items-center justify-between z-40 text-xs font-mono select-none overflow-visible"
      >
        <div className="flex items-center gap-1 shrink-0">
          {/* MODULE 1: CANVAS TOOLS (CHỌN, KÉO, ZOOM, NỀN) - LUÔN HIỆN CHO CẢ VIEW ONLY */}
          <div className="flex items-center gap-0.5 p-0.5 bg-[#0e121d] border border-[#1b2236]">
            <button
              onClick={() => setActiveTool("select")}
              className={`retro-btn px-2 py-1 flex items-center gap-1 cursor-pointer ${
                activeTool === "select" ? "retro-btn-active" : ""
              }`}
              title="Công cụ Chọn (V)"
            >
              <MousePointer className="w-3.5 h-3.5" />
              <span className="hidden xl:inline text-[10px] font-pixel">CHỌN</span>
            </button>

            <button
              onClick={() => setActiveTool("hand")}
              className={`retro-btn px-2 py-1 flex items-center gap-1 cursor-pointer ${
                activeTool === "hand" ? "retro-btn-active" : ""
              }`}
              title="Công cụ Kéo Canvas (H / Giữ Space)"
            >
              <Hand className="w-3.5 h-3.5" />
              <span className="hidden xl:inline text-[10px] font-pixel">KÉO</span>
            </button>

            <div className="retro-divider-v h-4" />

            {/* Undo / Redo */}
            <button
              type="button"
              disabled={userPermission === "view"}
              onMouseDown={(e) => {
                e.preventDefault();
                applyFormatting("undo");
              }}
              className="retro-btn p-1 cursor-pointer disabled:opacity-30"
              title="Hoàn tác (Ctrl+Z)"
            >
              <Undo2 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              disabled={userPermission === "view"}
              onMouseDown={(e) => {
                e.preventDefault();
                applyFormatting("redo");
              }}
              className="retro-btn p-1 cursor-pointer disabled:opacity-30"
              title="Làm lại (Ctrl+Y)"
            >
              <Redo2 className="w-3.5 h-3.5" />
            </button>

            <div className="retro-divider-v h-4" />

            {/* Zoom Stepper */}
            <div className="retro-panel-sunken flex items-center px-1 py-0.5">
              <button
                onClick={() => {
                  const container = containerRef.current;
                  const rect = container?.getBoundingClientRect();
                  const cx = rect ? rect.left + rect.width / 2 : undefined;
                  const cy = rect ? rect.top + rect.height / 2 : undefined;
                  applyZoomAtPoint((z) => +(z - 0.15).toFixed(2), cx, cy);
                }}
                className="retro-btn p-0.5 text-slate-400 hover:text-white cursor-pointer"
                title="Thu nhỏ (Ctrl -)"
              >
                <ZoomOut className="w-3 h-3" />
              </button>
              <button
                onClick={resetViewport}
                className="px-1.5 text-[10px] font-pixel text-cyan-300 hover:text-white cursor-pointer"
                title="Khôi phục 100% (Ctrl 0)"
              >
                {Math.round(zoom * 100)}%
              </button>
              <button
                onClick={() => {
                  const container = containerRef.current;
                  const rect = container?.getBoundingClientRect();
                  const cx = rect ? rect.left + rect.width / 2 : undefined;
                  const cy = rect ? rect.top + rect.height / 2 : undefined;
                  applyZoomAtPoint((z) => +(z + 0.15).toFixed(2), cx, cy);
                }}
                className="retro-btn p-0.5 text-slate-400 hover:text-white cursor-pointer"
                title="Phóng to (Ctrl +)"
              >
                <ZoomIn className="w-3 h-3" />
              </button>
            </div>

            <div className="retro-divider-v h-4" />

            {/* Background Customizer Popover Toggle */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsBgDropdownOpen(!isBgDropdownOpen)}
                className={`retro-btn px-2 py-1 flex items-center gap-1.5 cursor-pointer ${
                  isBgDropdownOpen ? "retro-btn-active text-cyan-300" : "text-slate-300 hover:text-white"
                }`}
                title="Tùy biến Nền Canvas & Lưới (Background & Grid)"
              >
                <PaletteIcon className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden lg:inline text-[10px] font-pixel">NỀN</span>
                <span
                  className="w-2.5 h-2.5 border border-black inline-block ml-0.5 shadow-[1px_1px_0_0_#000]"
                  style={{ backgroundColor: activeTheme.accentColor }}
                />
              </button>

              {isBgDropdownOpen && (
                <div
                  className="absolute top-full mt-1.5 left-0 retro-window-frame bg-[#0a0d16] p-3 w-80 sm:w-96 z-50 text-xs shadow-2xl space-y-3"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between border-b border-[#1f273d] pb-2">
                    <div className="flex items-center gap-1.5 text-cyan-400 font-pixel text-[10px]">
                      <PaletteIcon className="w-3.5 h-3.5" />
                      <span>TÙY CHỈNH HÌNH NỀN CANVAS</span>
                    </div>
                    <button
                      onClick={() => setIsBgDropdownOpen(false)}
                      className="text-slate-500 hover:text-rose-400 p-0.5 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Tab Selector: VS Code Wallpaper vs Grid Theme */}
                  <div className="grid grid-cols-2 gap-1 p-0.5 bg-[#0e121d] border border-[#1b2236]">
                    <button
                      type="button"
                      onClick={() => setBgPopoverTab("wallpaper")}
                      className={`py-1.5 text-[9px] font-pixel flex items-center justify-center gap-1.5 cursor-pointer transition ${
                        bgPopoverTab === "wallpaper"
                          ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-[1px_1px_0_0_#00f0ff]"
                          : "text-slate-400 hover:text-slate-200 border border-transparent"
                      }`}
                    >
                      <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
                      <span>ẢNH NỀN (VS CODE)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setBgPopoverTab("grid")}
                      className={`py-1.5 text-[9px] font-pixel flex items-center justify-center gap-1.5 cursor-pointer transition ${
                        bgPopoverTab === "grid"
                          ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-[1px_1px_0_0_#00f0ff]"
                          : "text-slate-400 hover:text-slate-200 border border-transparent"
                      }`}
                    >
                      <GridIcon className="w-3.5 h-3.5 text-pink-400" />
                      <span>LƯỚI & THEME</span>
                    </button>
                  </div>

                  {/* TAB 1: ẢNH NỀN MỜ PHÍA SAU (VS CODE BACKGROUND EXTENSION STYLE) */}
                  {bgPopoverTab === "wallpaper" && (
                    <div className="space-y-3">
                      {/* Hidden File Input for local computer images */}
                      <input
                        ref={bgFileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleBgFileChange}
                      />

                      {canvasBg.imageUrl ? (
                        <div className="space-y-3">
                          {/* Live Preview of active wallpaper */}
                          <div className="relative border-2 border-black bg-[#0d101a] p-2 overflow-hidden shadow-[2px_2px_0_0_#000]">
                            <div className="flex items-center justify-between text-[9px] font-pixel text-slate-300 mb-1.5">
                              <span className="text-emerald-400 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                ẢNH NỀN ĐANG ÁP DỤNG
                              </span>
                              <button
                                type="button"
                                onClick={handleClearBgImage}
                                className="text-rose-400 hover:text-rose-300 cursor-pointer font-pixel text-[8px] flex items-center gap-1"
                              >
                                <Trash2 className="w-2.5 h-2.5" />
                                <span>GỠ BỎ ẢNH</span>
                              </button>
                            </div>

                            <div className="relative h-24 w-full rounded border border-[#222b40] overflow-hidden bg-black/50 flex items-center justify-center">
                              {/* Thumbnail preview with actual blur & opacity */}
                              <div
                                className="absolute inset-0 bg-cover bg-center"
                                style={{
                                  backgroundImage: `url(${canvasBg.imageUrl})`,
                                  opacity: canvasBg.imageOpacity ?? 0.22,
                                  filter: `blur(${canvasBg.imageBlur ?? 6}px)`,
                                  transform: "scale(1.08)",
                                }}
                              />
                              <div className="relative z-10 text-center font-mono text-[10px] text-slate-300 bg-black/60 px-2 py-1 border border-white/10 backdrop-blur-sm">
                                <span>Hiệu ứng mờ & trong suốt đang chạy</span>
                              </div>
                            </div>

                            <div className="mt-2 flex gap-2">
                              <button
                                type="button"
                                onClick={() => bgFileInputRef.current?.click()}
                                disabled={bgUploading}
                                className="retro-btn flex-1 py-1.5 text-[9px] font-pixel text-cyan-300 hover:text-white cursor-pointer flex items-center justify-center gap-1"
                              >
                                <UploadIcon className="w-3 h-3" />
                                <span>{bgUploading ? "ĐANG TẢI..." : "ĐỔI ẢNH TỪ MÁY"}</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setShowUrlInput(!showUrlInput)}
                                className="retro-btn px-2 py-1.5 text-[9px] font-pixel text-slate-400 hover:text-white cursor-pointer"
                                title="Nhập URL web"
                              >
                                URL
                              </button>
                            </div>
                          </div>

                          {/* Control: Độ mờ (Blur) */}
                          <div className="space-y-1.5 border-t border-[#1a2236] pt-2">
                            <div className="flex items-center justify-between text-[9px]">
                              <span className="font-pixel text-slate-400 uppercase">
                                ĐỘ MỜ (BLUR)
                              </span>
                              <span className="font-mono text-cyan-400 font-bold">
                                {canvasBg.imageBlur ?? 6}PX
                              </span>
                            </div>
                            <div className="grid grid-cols-4 gap-1 font-mono text-[9px]">
                              {[
                                { label: "RÕ (0PX)", val: 0 },
                                { label: "NHẸ (4PX)", val: 4 },
                                { label: "CHUẨN (8PX)", val: 8 },
                                { label: "ẢO (16PX)", val: 16 },
                              ].map((item) => (
                                <button
                                  key={item.val}
                                  type="button"
                                  onClick={() => updateCanvasBg({ imageBlur: item.val })}
                                  className={`py-1 text-center border cursor-pointer transition ${
                                    (canvasBg.imageBlur ?? 6) === item.val
                                      ? "border-cyan-400 bg-cyan-950/50 text-cyan-300 font-bold shadow-[1px_1px_0_0_#00f0ff]"
                                      : "border-[#1c2438] bg-[#0e121d] text-slate-400 hover:text-white"
                                  }`}
                                >
                                  {item.label}
                                </button>
                              ))}
                            </div>
                            <input
                              type="range"
                              min={0}
                              max={24}
                              step={1}
                              value={canvasBg.imageBlur ?? 6}
                              onChange={(e) => updateCanvasBg({ imageBlur: Number(e.target.value) })}
                              className="w-full accent-cyan-400 h-1 bg-slate-800 cursor-pointer"
                            />
                          </div>

                          {/* Control: Độ trong suốt (Opacity) */}
                          <div className="space-y-1.5 border-t border-[#1a2236] pt-2">
                            <div className="flex items-center justify-between text-[9px]">
                              <span className="font-pixel text-slate-400 uppercase">
                                ĐỘ TRONG SUỐT (OPACITY)
                              </span>
                              <span className="font-mono text-amber-400 font-bold">
                                {Math.round((canvasBg.imageOpacity ?? 0.22) * 100)}%
                              </span>
                            </div>
                            <div className="grid grid-cols-4 gap-1 font-mono text-[9px]">
                              {[
                                { label: "10% (MỜ)", val: 0.1 },
                                { label: "22% (CHUẨN)", val: 0.22 },
                                { label: "35% (RÕ)", val: 0.35 },
                                { label: "50% (ĐẬM)", val: 0.5 },
                              ].map((item) => (
                                <button
                                  key={item.val}
                                  type="button"
                                  onClick={() => updateCanvasBg({ imageOpacity: item.val })}
                                  className={`py-1 text-center border cursor-pointer transition ${
                                    Math.abs((canvasBg.imageOpacity ?? 0.22) - item.val) < 0.04
                                      ? "border-amber-400 bg-amber-950/50 text-amber-300 font-bold shadow-[1px_1px_0_0_#f59e0b]"
                                      : "border-[#1c2438] bg-[#0e121d] text-slate-400 hover:text-white"
                                  }`}
                                >
                                  {item.label}
                                </button>
                              ))}
                            </div>
                            <input
                              type="range"
                              min={0.05}
                              max={0.7}
                              step={0.02}
                              value={canvasBg.imageOpacity ?? 0.22}
                              onChange={(e) => updateCanvasBg({ imageOpacity: Number(e.target.value) })}
                              className="w-full accent-amber-400 h-1 bg-slate-800 cursor-pointer"
                            />
                          </div>

                          {/* Control: Vị trí / Căn chỉnh (Position & Fit) */}
                          <div className="space-y-1.5 border-t border-[#1a2236] pt-2">
                            <div className="flex items-center justify-between text-[9px]">
                              <span className="font-pixel text-slate-400 uppercase">
                                VỊ TRÍ & HIỂN THỊ (VS CODE STYLE)
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-1 font-mono text-[9px]">
                              {[
                                { id: "cover", name: "PHỦ KÍN (COVER)", desc: "Tràn toàn bộ màn hình" },
                                { id: "bottom-right", name: "GÓC PHẢI DƯỚI", desc: "Anime VS Code style" },
                                { id: "center", name: "CHÍNH GIỮA", desc: "Giữ tỷ lệ ảnh gốc" },
                                { id: "contain", name: "VỪA KHUNG (CONTAIN)", desc: "Không cắt xén ảnh" },
                              ].map((f) => {
                                const active = (canvasBg.imageFit ?? "cover") === f.id;
                                return (
                                  <button
                                    key={f.id}
                                    type="button"
                                    onClick={() => updateCanvasBg({ imageFit: f.id as any })}
                                    className={`p-1.5 text-left border cursor-pointer transition ${
                                      active
                                        ? "border-cyan-400 bg-cyan-950/40 text-cyan-300 font-bold"
                                        : "border-[#1c2438] bg-[#0e121d] text-slate-400 hover:text-slate-200"
                                    }`}
                                  >
                                    <div className="font-pixel text-[8px] truncate">{f.name}</div>
                                    <div className="text-[7px] text-slate-500 truncate">{f.desc}</div>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {/* Empty State: Prompt user to pick file from computer */}
                          <div
                            onClick={() => bgFileInputRef.current?.click()}
                            className="border-2 border-dashed border-[#293652] hover:border-cyan-400 bg-[#0d101a] p-4 text-center cursor-pointer transition group"
                          >
                            <div className="w-10 h-10 mx-auto mb-2 rounded bg-cyan-950/40 border border-cyan-500/40 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                              <UploadIcon className="w-5 h-5" />
                            </div>
                            <div className="font-pixel text-[10px] text-cyan-300 mb-1">
                              {bgUploading ? "ĐANG TẢI ẢNH LÊN..." : "+ CHỌN ẢNH TỪ MÁY TÍNH"}
                            </div>
                            <div className="text-[9px] font-mono text-slate-500 leading-tight">
                              Hỗ trợ JPG, PNG, WEBP, GIF. Tự động lưu và làm mờ phông nền phía sau giống VS Code.
                            </div>
                          </div>

                          {bgUploadError && (
                            <div className="text-[10px] text-rose-400 font-mono bg-rose-950/40 border border-rose-800 p-2">
                              {bgUploadError}
                            </div>
                          )}

                          {/* Alternative: Enter Image URL */}
                          {showUrlInput ? (
                            <div className="p-2 bg-[#0e121d] border border-[#1c2438] space-y-1.5">
                              <div className="text-[9px] font-pixel text-slate-400">ĐƯỜNG DẪN ẢNH (URL):</div>
                              <div className="flex gap-1">
                                <input
                                  type="text"
                                  value={bgUrlInput}
                                  onChange={(e) => setBgUrlInput(e.target.value)}
                                  placeholder="https://images.unsplash.com/..."
                                  className="bg-[#0a0d16] border border-[#222b40] text-slate-200 text-[10px] font-mono px-2 py-1 flex-1 focus:outline-none focus:border-cyan-400"
                                />
                                <button
                                  type="button"
                                  onClick={handleApplyBgUrl}
                                  className="retro-btn-cyan px-2 py-1 text-[9px] font-pixel cursor-pointer"
                                >
                                  ÁP DỤNG
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setShowUrlInput(true)}
                              className="w-full py-1 text-[9px] font-mono text-slate-500 hover:text-cyan-400 text-center cursor-pointer border border-[#1b2236] bg-[#0c0f1a]"
                            >
                              + Hoặc dán link URL ảnh từ Web
                            </button>
                          )}

                          {/* Explanatory note */}
                          <div className="p-2 bg-[#0a0f1d] border border-[#152033] text-[9px] font-mono text-slate-400 leading-relaxed">
                            <span className="text-cyan-400 font-pixel">MẸO:</span> Tính năng này cho phép bạn đặt hình nền tùy chỉnh (như Anime Wallpaper, Cyberpunk, Pixel Art) mờ dịu mắt phía sau canvas, giữ cho chữ và tài liệu luôn đọc được rõ ràng.
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 2: LƯỚI THEME & MẬT ĐỘ (RETRO PRESETS) */}
                  {bgPopoverTab === "grid" && (
                    <div className="space-y-3">
                      {/* Theme Grid */}
                      <div className="space-y-1.5">
                        <div className="text-[9px] font-pixel text-slate-400 uppercase tracking-wider">
                          PHONG CÁCH NỀN ({CANVAS_BG_THEMES.length} THEMES)
                        </div>
                        <div className="grid grid-cols-2 gap-1.5 max-h-44 overflow-y-auto pr-0.5">
                          {CANVAS_BG_THEMES.map((theme) => {
                            const isSelected = canvasBg.type === theme.id;
                            return (
                              <button
                                key={theme.id}
                                type="button"
                                onClick={() => updateCanvasBg({ type: theme.id })}
                                className={`p-2 text-left border flex flex-col gap-1 transition cursor-pointer relative ${
                                  isSelected
                                    ? "border-cyan-400 bg-[#121929] shadow-[2px_2px_0_0_#00f0ff]"
                                    : "border-[#1b2338] bg-[#0d101a] hover:border-slate-600"
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-pixel text-[10px] text-slate-200 truncate">
                                    {theme.name}
                                  </span>
                                  <span
                                    className="w-2.5 h-2.5 border border-black shrink-0"
                                    style={{ backgroundColor: theme.accentColor }}
                                  />
                                </div>
                                <span className="text-[8px] font-mono text-slate-500 truncate">
                                  {theme.subtitle}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Grid Density */}
                      <div className="space-y-1.5 border-t border-[#1a2236] pt-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-pixel text-slate-400 uppercase tracking-wider">
                            MẬT ĐỘ LƯỚI
                          </span>
                          <span className="text-[9px] font-mono text-cyan-400 font-bold">
                            {canvasBg.gridSize}PX
                          </span>
                        </div>
                        <div className="grid grid-cols-5 gap-1 font-mono text-[10px]">
                          {([16, 24, 32, 48, 64] as const).map((sz) => (
                            <button
                              key={sz}
                              type="button"
                              onClick={() => updateCanvasBg({ gridSize: sz })}
                              className={`py-1 border text-center transition cursor-pointer ${
                                canvasBg.gridSize === sz
                                  ? "border-cyan-400 bg-cyan-950/40 text-cyan-300 font-bold"
                                  : "border-[#1c2438] bg-[#0e121d] text-slate-400 hover:text-white"
                              }`}
                            >
                              {sz}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Toggles: Show Grid & CRT Scanlines */}
                      <div className="border-t border-[#1a2236] pt-2 space-y-1.5">
                        {/* Toggle Show Grid */}
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-pixel text-slate-300">HIỆN ĐƯỜNG LƯỚI</span>
                          <button
                            type="button"
                            onClick={() => updateCanvasBg({ showGrid: !canvasBg.showGrid })}
                            className={`px-2 py-0.5 text-[9px] font-pixel border cursor-pointer ${
                              canvasBg.showGrid
                                ? "border-emerald-500 bg-emerald-950/40 text-emerald-400"
                                : "border-slate-700 bg-slate-900 text-slate-500"
                            }`}
                          >
                            {canvasBg.showGrid ? "BẬT" : "TẮT"}
                          </button>
                        </div>

                        {/* Toggle CRT Scanlines */}
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-pixel text-slate-300">QUÉT TIA CRT (ARCADE)</span>
                          <button
                            type="button"
                            onClick={() => updateCanvasBg({ scanlines: !canvasBg.scanlines })}
                            className={`px-2 py-0.5 text-[9px] font-pixel border cursor-pointer ${
                              canvasBg.scanlines
                                ? "border-cyan-500 bg-cyan-950/40 text-cyan-300"
                                : "border-slate-700 bg-slate-900 text-slate-500"
                            }`}
                          >
                            {canvasBg.scanlines ? "BẬT" : "TẮT"}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* NẾU LÀ VIEW ONLY: HIỂN THỊ BANNER THAY CHO CÁC CÔNG CỤ EDIT */}
          {userPermission === "view" && (
            <div className="flex items-center gap-2 px-3 py-1 bg-[#121624] border border-amber-500/50 text-amber-300 ml-2">
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-pixel text-[10px]">CHẾ ĐỘ CHỈ XEM:</span>
              <span className="text-slate-300 text-[11px] font-mono hidden md:inline">Bạn đang theo dõi trực tiếp bản vẽ của chủ phòng</span>
              {pendingRequest ? (
                <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/50 text-[9px] font-pixel animate-pulse">
                  ĐÃ XIN QUYỀN SỬA (CHỜ DUYỆT)
                </span>
              ) : (
                <button
                  type="button"
                  disabled={requestSubmitting}
                  onClick={() => handleSubmitAccessRequest("edit")}
                  className="retro-btn-amber px-2.5 py-0.5 text-[9px] font-pixel uppercase cursor-pointer flex items-center gap-1 ml-1"
                >
                  <SendIcon className="w-3 h-3 text-black" />
                  <span>{requestSubmitting ? "ĐANG GỬI..." : "YÊU CẦU QUYỀN SỬA"}</span>
                </button>
              )}
            </div>
          )}

          <div className="retro-divider-v h-6 mx-0.5" />

          {/* MODULE 2: TYPOGRAPHY (FONT & SIZE) */}
          <div className="flex items-center gap-0.5 p-0.5 bg-[#0e121d] border border-[#1b2236]">
            {/* Font family dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setIsFontFamilyDropdownOpen(!isFontFamilyDropdownOpen);
                  setIsFontSizeDropdownOpen(false);
                  setIsTextColorDropdownOpen(false);
                  setIsHighlightDropdownOpen(false);
                }}
                className="retro-btn flex items-center justify-between gap-1 px-2 py-1 w-28 sm:w-32 text-left cursor-pointer text-[11px]"
                title="Phông chữ (Font Family)"
              >
                <span className="truncate">{fontFamily}</span>
                <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
              </button>

              {isFontFamilyDropdownOpen && (
                <div
                  className="absolute top-full mt-1 left-0 retro-window-frame bg-[#0d101a] p-1.5 w-48 z-50 max-h-64 overflow-y-auto text-xs shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="px-2 py-1 text-[9px] font-pixel text-cyan-400 border-b border-[#1f273d] mb-1">
                    PHÔNG CHỮ
                  </div>
                  {FONT_FAMILIES.map((f) => (
                    <button
                      key={f.name}
                      type="button"
                      onClick={() => handleApplyFontFamily(f.value, f.name)}
                      className={`w-full text-left px-2 py-1.5 flex items-center justify-between transition cursor-pointer hover:bg-cyan-500/20 hover:text-cyan-300 ${
                        fontFamily === f.name ? "bg-cyan-500/30 text-cyan-300 font-bold" : "text-slate-300"
                      }`}
                      style={{ fontFamily: f.value }}
                    >
                      <span>{f.name}</span>
                      {fontFamily === f.name && <Check className="w-3 h-3 text-cyan-400" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Font Size Stepper */}
            <div className="retro-panel-sunken flex items-center px-0.5 py-0.5">
              <button
                type="button"
                onClick={() => handleApplyFontSize(fontSize - 1)}
                className="retro-btn px-1.5 py-0.5 text-slate-400 hover:text-white cursor-pointer"
                title="Giảm cỡ chữ"
              >
                <Minus className="w-2.5 h-2.5" />
              </button>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setIsFontSizeDropdownOpen(!isFontSizeDropdownOpen);
                    setIsFontFamilyDropdownOpen(false);
                    setIsTextColorDropdownOpen(false);
                    setIsHighlightDropdownOpen(false);
                  }}
                  className="px-2 py-0.5 text-[11px] font-bold text-amber-300 hover:text-white cursor-pointer min-w-[28px] text-center"
                  title="Cỡ chữ (Font Size)"
                >
                  {fontSize}
                </button>

                {isFontSizeDropdownOpen && (
                  <div
                    className="absolute top-full mt-1 left-1/2 -translate-x-1/2 retro-window-frame bg-[#0d101a] p-1 w-20 z-50 max-h-56 overflow-y-auto text-xs text-center shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {FONT_SIZES.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => handleApplyFontSize(s)}
                        className={`w-full py-1 transition cursor-pointer hover:bg-cyan-500/20 hover:text-cyan-300 ${
                          fontSize === s ? "bg-cyan-500/30 text-cyan-300 font-bold" : "text-slate-300"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => handleApplyFontSize(fontSize + 1)}
                className="retro-btn px-1.5 py-0.5 text-slate-400 hover:text-white cursor-pointer"
                title="Tăng cỡ chữ"
              >
                <Plus className="w-2.5 h-2.5" />
              </button>
            </div>
          </div>

          <div className="retro-divider-v h-6 mx-0.5" />

          {/* MODULE 3: TEXT FORMATTING & COLORS */}
          <div className="flex items-center gap-0.5 p-0.5 bg-[#0e121d] border border-[#1b2236]">
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                applyFormatting("bold");
              }}
              className="retro-btn p-1.5 cursor-pointer"
              title="In đậm (Bold)"
            >
              <Bold className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                applyFormatting("italic");
              }}
              className="retro-btn p-1.5 cursor-pointer"
              title="In nghiêng (Italic)"
            >
              <Italic className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                applyFormatting("underline");
              }}
              className="retro-btn p-1.5 cursor-pointer"
              title="Gạch chân (Underline)"
            >
              <Underline className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                applyFormatting("strikeThrough");
              }}
              className="retro-btn p-1.5 cursor-pointer"
              title="Gạch ngang (Strikethrough)"
            >
              <Strikethrough className="w-3.5 h-3.5" />
            </button>

            <div className="retro-divider-v h-4" />

            {/* TEXT COLOR PICKER */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setIsTextColorDropdownOpen(!isTextColorDropdownOpen);
                  setIsHighlightDropdownOpen(false);
                  setIsFontFamilyDropdownOpen(false);
                  setIsFontSizeDropdownOpen(false);
                }}
                className="retro-btn flex flex-col items-center justify-center p-1 cursor-pointer"
                title="Màu chữ (Text Color)"
              >
                <span className="font-bold text-[11px] leading-tight">A</span>
                <span
                  className="w-3.5 h-1 border border-black"
                  style={{ backgroundColor: textColor }}
                />
              </button>

              {isTextColorDropdownOpen && (
                <div
                  className="absolute top-full mt-1 left-0 retro-window-frame bg-[#0d101a] p-2.5 w-56 z-50 shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="text-[9px] font-pixel text-cyan-400 border-b border-[#1f273d] pb-1 mb-2">
                    MÀU CHỮ (TEXT COLOR)
                  </div>
                  <div className="grid grid-cols-10 gap-1">
                    {GOOGLE_DOCS_COLORS.map((c, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleApplyTextColor(c)}
                        className={`w-4 h-4 border border-black transition-transform hover:scale-125 cursor-pointer ${
                          textColor === c ? "ring-2 ring-cyan-400" : ""
                        }`}
                        style={{ backgroundColor: c }}
                        title={c}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* HIGHLIGHT COLOR PICKER */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setIsHighlightDropdownOpen(!isHighlightDropdownOpen);
                  setIsTextColorDropdownOpen(false);
                  setIsFontFamilyDropdownOpen(false);
                  setIsFontSizeDropdownOpen(false);
                }}
                className="retro-btn flex flex-col items-center justify-center p-1 cursor-pointer"
                title="Màu đánh dấu / Tô nền (Highlight)"
              >
                <Highlighter className="w-3.5 h-3.5" />
                <span
                  className="w-3.5 h-1 border border-black"
                  style={{ backgroundColor: highlightColor === "transparent" ? "#64748b" : highlightColor }}
                />
              </button>

              {isHighlightDropdownOpen && (
                <div
                  className="absolute top-full mt-1 left-0 retro-window-frame bg-[#0d101a] p-2.5 w-52 z-50 shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="text-[9px] font-pixel text-amber-400 border-b border-[#1f273d] pb-1 mb-2 flex items-center justify-between">
                    <span>MÀU TÔ NỀN</span>
                    <button
                      onClick={() => handleApplyHighlightColor("transparent")}
                      className="text-[9px] text-slate-400 hover:text-white underline cursor-pointer"
                    >
                      Bỏ tô
                    </button>
                  </div>
                  <div className="grid grid-cols-5 gap-1.5">
                    {HIGHLIGHT_COLORS.map((c, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleApplyHighlightColor(c)}
                        className={`h-5 border border-black transition-transform hover:scale-110 cursor-pointer flex items-center justify-center text-[10px] ${
                          c === "transparent" ? "border-dashed border-slate-600 text-slate-400" : ""
                        }`}
                        style={{ backgroundColor: c }}
                        title={c === "transparent" ? "Không tô màu" : c}
                      >
                        {c === "transparent" ? "∅" : ""}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="retro-divider-v h-6 mx-0.5" />

          {/* MODULE 4: ALIGNMENT & LISTS */}
          <div className="hidden lg:flex items-center gap-0.5 p-0.5 bg-[#0e121d] border border-[#1b2236]">
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                applyFormatting("justifyLeft");
                if (selectedItem?.type === "shape") {
                  handleUpdateShapeTextAlign(selectedItem.id, "left");
                }
              }}
              className="retro-btn p-1.5 cursor-pointer"
              title="Căn lề trái"
            >
              <AlignLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                applyFormatting("justifyCenter");
                if (selectedItem?.type === "shape") {
                  handleUpdateShapeTextAlign(selectedItem.id, "center");
                }
              }}
              className="retro-btn p-1.5 cursor-pointer"
              title="Căn giữa"
            >
              <AlignCenter className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                applyFormatting("justifyRight");
                if (selectedItem?.type === "shape") {
                  handleUpdateShapeTextAlign(selectedItem.id, "right");
                }
              }}
              className="retro-btn p-1.5 cursor-pointer"
              title="Căn lề phải"
            >
              <AlignRight className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                applyFormatting("justifyFull");
              }}
              className="retro-btn p-1.5 cursor-pointer"
              title="Căn đều 2 bên"
            >
              <AlignJustify className="w-3.5 h-3.5" />
            </button>

            <div className="retro-divider-v h-4" />

            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                applyFormatting("insertUnorderedList");
              }}
              className="retro-btn p-1.5 cursor-pointer"
              title="Danh sách dấu đầu dòng"
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                applyFormatting("insertOrderedList");
              }}
              className="retro-btn p-1.5 cursor-pointer"
              title="Danh sách đánh số"
            >
              <ListOrdered className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                applyFormatting("outdent");
              }}
              className="retro-btn p-1.5 cursor-pointer"
              title="Giảm thụt lề"
            >
              <Outdent className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                applyFormatting("indent");
              }}
              className="retro-btn p-1.5 cursor-pointer"
              title="Tăng thụt lề"
            >
              <Indent className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                applyFormatting("removeFormat");
              }}
              className="retro-btn p-1.5 text-slate-400 hover:text-rose-400 cursor-pointer"
              title="Xóa định dạng"
            >
              <RemoveFormatting className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="retro-divider-v h-6 mx-0.5" />

          {/* MODULE 5: OBJECT CREATORS (A4, NOTE, SHAPES, TABLES) */}
          <div className="flex items-center gap-1 p-0.5 bg-[#0e121d] border border-[#1b2236]">
            {/* TỜ A4 */}
            <button
              onClick={() => handleAddA4DocAt()}
              className="retro-btn flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-pixel text-cyan-300 hover:text-white cursor-pointer shrink-0"
              title="Thêm tờ giấy A4 độc lập mới"
            >
              <FileText className="w-3.5 h-3.5 text-cyan-400" />
              <span>+ TỜ A4</span>
            </button>

            {/* STICKY NOTE */}
            <button
              onClick={() => handleAddNoteAt()}
              className="retro-btn flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-pixel text-pink-300 hover:text-white cursor-pointer shrink-0"
              title="Thêm ghi chú 8-Bit mới"
            >
              <StickyNote className="w-3.5 h-3.5 text-pink-400" />
              <span>+ NOTE</span>
            </button>

            {/* HÌNH KHỐI (SHAPES PALETTE) */}
            <div className="relative">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsShapePaletteOpen(!isShapePaletteOpen);
                  setIsTableDropdownOpen(false);
                  setIsFontFamilyDropdownOpen(false);
                  setIsFontSizeDropdownOpen(false);
                  setIsTextColorDropdownOpen(false);
                  setIsHighlightDropdownOpen(false);
                }}
                className={`retro-btn flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-pixel text-amber-300 hover:text-white cursor-pointer shrink-0 ${
                  activeTool === "shape" || isShapePaletteOpen ? "retro-btn-active" : ""
                }`}
                title="Bảng hình khối & Mũi tên: Chọn hình và kéo vẽ trên canvas để gõ text"
              >
                <div className="w-3.5 h-3.5 flex items-center justify-center">
                  <ShapeMiniIcon type={selectedShapeType} color="#f59e0b" size={14} />
                </div>
                <span>HÌNH KHỐI</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {isShapePaletteOpen && (
                <div
                  className="absolute top-full mt-1.5 left-0 retro-window-frame bg-[#0d101a] p-3 w-[310px] shadow-2xl z-50 font-mono text-xs"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#1f273d]">
                    <div className="flex items-center gap-1.5 text-[10px] font-pixel text-amber-400">
                      <span>BẢNG HÌNH KHỐI ARCADE</span>
                    </div>
                    <span className="text-[9px] text-amber-300/80 font-mono">KÉO ĐỂ VẼ</span>
                  </div>

                  <div className="text-[11px] text-slate-400 mb-2 leading-tight">
                    Chọn 1 hình/mũi tên rồi <b className="text-amber-300">kéo 1 đoạn</b> trên canvas để vẽ & gõ text:
                  </div>

                  {/* Grid 6 columns with all shapes */}
                  <div className="grid grid-cols-6 gap-1 p-1.5 retro-panel-sunken max-h-60 overflow-y-auto">
                    {SHAPES_LIST.map((shape) => {
                      const isSelected = selectedShapeType === shape.type;
                      return (
                        <button
                          key={shape.type}
                          type="button"
                          onClick={() => {
                            setSelectedShapeType(shape.type);
                            setActiveTool("shape");
                            setIsShapePaletteOpen(false);
                          }}
                          className={`p-1.5 flex flex-col items-center justify-center transition-all cursor-pointer ${
                            isSelected
                              ? "retro-btn-active border border-amber-400"
                              : "retro-btn hover:border-slate-500"
                          }`}
                          title={shape.label}
                        >
                          <ShapeMiniIcon
                            type={shape.type}
                            color={isSelected ? "#fbbf24" : "#cbd5e1"}
                            size={18}
                          />
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-[#1f273d] flex items-center justify-between text-[10px] text-slate-400">
                    <span>Gõ chữ trực tiếp trong hình</span>
                    <button
                      onClick={() => {
                        const canvasX = Math.round((-pan.x + window.innerWidth / 2) / zoom);
                        const canvasY = Math.round((-pan.y + window.innerHeight / 2) / zoom);

                        if (isArrowConnector(selectedShapeType)) {
                          const newArrow: PlaygroundShapeItem = {
                            id: "arrow-" + Date.now(),
                            type: selectedShapeType,
                            x: canvasX - 100,
                            y: canvasY - 15,
                            width: 200,
                            height: 30,
                            startX: canvasX - 100,
                            startY: canvasY,
                            endX: canvasX + 100,
                            endY: canvasY,
                            color: "#ff2a4b",
                            content: "",
                            textAlign: "left",
                            verticalAlign: "top",
                          };
                          const yShapes = ydoc.getMap<PlaygroundShapeItem>("playground-shapes");
                          yShapes.set(newArrow.id, newArrow);
                          setSelectedItem({ type: "shape", id: newArrow.id });
                          setIsShapePaletteOpen(false);
                          return;
                        }

                        const newShape: PlaygroundShapeItem = {
                          id: "shape-" + Date.now(),
                          type: selectedShapeType,
                          x: canvasX - 90,
                          y: canvasY - 80,
                          width: 180,
                          height: 160,
                          color: "#00f0ff",
                          content: "",
                          fontSize,
                          fontFamily,
                          textColor,
                          textAlign: "left",
                          verticalAlign: "top",
                        };
                        const yShapes = ydoc.getMap<PlaygroundShapeItem>("playground-shapes");
                        yShapes.set(newShape.id, newShape);
                        setSelectedItem({ type: "shape", id: newShape.id });
                        setIsShapePaletteOpen(false);
                      }}
                      className="text-amber-400 hover:text-amber-300 font-pixel text-[9px] cursor-pointer"
                    >
                      + ĐẶT NHANH
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* BẢNG (TABLE) */}
            <div className="relative">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsTableDropdownOpen(!isTableDropdownOpen);
                  setIsShapePaletteOpen(false);
                  setIsFontFamilyDropdownOpen(false);
                  setIsFontSizeDropdownOpen(false);
                  setIsTextColorDropdownOpen(false);
                  setIsHighlightDropdownOpen(false);
                }}
                className={`retro-btn flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-pixel text-emerald-300 hover:text-white cursor-pointer shrink-0 ${
                  isTableDropdownOpen ? "retro-btn-active" : ""
                }`}
                title="Chức năng: Bảng dữ liệu 8-Bit (Table)"
              >
                <TableIcon className="w-3.5 h-3.5 text-emerald-400" />
                <span>BẢNG</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {isTableDropdownOpen && (
                <div
                  className="absolute top-full mt-1.5 left-0 retro-window-frame bg-[#0d101a] p-2 w-64 shadow-2xl z-50 font-mono text-xs text-slate-200"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="px-2 py-1 text-[9px] font-pixel text-emerald-400 border-b border-[#1f273d] mb-1.5 flex items-center justify-between">
                    <span>BẢNG DỮ LIỆU</span>
                    <span className="text-slate-500 text-[9px]">8-BIT GRID</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      handleAddTableAt();
                      setIsTableDropdownOpen(false);
                    }}
                    className="retro-btn w-full text-left px-2.5 py-2 mb-1 flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <TableIcon className="w-3.5 h-3.5 text-emerald-400" />
                      <span>+ Thêm Bảng trên Canvas</span>
                    </div>
                    <span className="text-[9px] text-emerald-400 font-pixel">GRID</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const key = lastActiveRefKey.current;
                      if (key && (key.startsWith("a4-") || key.includes("-p"))) {
                        const el = contentRefs.current[key];
                        if (el) {
                          document.execCommand(
                            "insertHTML",
                            false,
                            `<table style="border-collapse:collapse;width:100%;margin:16px 0;border:2px solid #000;font-size:13px;"><thead><tr style="background:#f1f5f9;"><th style="border:1px solid #94a3b8;padding:8px;text-align:left;">Tiêu đề 1</th><th style="border:1px solid #94a3b8;padding:8px;text-align:left;">Tiêu đề 2</th><th style="border:1px solid #94a3b8;padding:8px;text-align:left;">Tiêu đề 3</th></tr></thead><tbody><tr><td style="border:1px solid #cbd5e1;padding:8px;">Dữ liệu 1</td><td style="border:1px solid #cbd5e1;padding:8px;">Dữ liệu 2</td><td style="border:1px solid #cbd5e1;padding:8px;">Dữ liệu 3</td></tr><tr><td style="border:1px solid #cbd5e1;padding:8px;">Dữ liệu 4</td><td style="border:1px solid #cbd5e1;padding:8px;">Dữ liệu 5</td><td style="border:1px solid #cbd5e1;padding:8px;">Dữ liệu 6</td></tr></tbody></table><p><br></p>`
                          );
                          const [docId, pageStr] = key.split("-p");
                          const pageIndex = parseInt(pageStr, 10) || 0;
                          handleUpdateA4Page(docId, pageIndex, el.innerHTML);
                        }
                      } else {
                        handleAddTableAt();
                      }
                      setIsTableDropdownOpen(false);
                    }}
                    className="retro-btn w-full text-left px-2.5 py-2 flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5 text-cyan-400" />
                      <span>+ Chèn Bảng vào tờ A4</span>
                    </div>
                    <span className="text-[9px] text-cyan-400 font-pixel">A4</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="retro-divider-v h-6 mx-0.5" />

          {/* MODULE 6: DỌN SẠCH BÀN VẼ */}
          <button
            type="button"
            onClick={handleClearCanvas}
            className="retro-btn-danger flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-pixel cursor-pointer shrink-0"
            title="Xóa toàn bộ đối tượng trên bàn vẽ"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden xl:inline">DỌN SẠCH</span>
          </button>
        </div>

        {/* Right Side: Quick info / Shortcuts */}
        <div className="hidden 2xl:flex items-center gap-3 text-[11px] text-slate-500 font-mono shrink-0 pl-3">
          <span>Space + Kéo: Pan</span>
          <span>•</span>
          <span>Ctrl + Cuộn: Zoom</span>
        </div>
      </div>

      {/* INFINITE CANVAS LAYER */}
      <div
        className="absolute top-0 left-0 w-full h-full pointer-events-none z-10"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: "0 0",
        }}
      >
        {/* Retro Arcade Workstation Empty State (Only displayed when canvas has 0 objects) */}
        {notes.length === 0 && tables.length === 0 && a4Docs.length === 0 && shapes.length === 0 && (
          <div className="absolute top-28 left-28 pointer-events-auto select-none p-5 bg-[#0e121d] retro-window-frame shadow-[5px_5px_0_0_#000] max-w-lg">
            <div className="retro-window-header -mx-5 -mt-5 px-3 py-2 flex items-center justify-between mb-4 border-b-2 border-black">
              <div className="flex items-center gap-2">
                <PixelGhostBot size={20} color="#00f0ff" />
                <span className="font-pixel text-[10px] text-cyan-300 tracking-wider">
                  CANVAS KHỞI TẠO • SẴN SÀNG
                </span>
              </div>
              <span className="font-pixel text-[9px] text-emerald-400">READY</span>
            </div>

            <p className="text-xs text-slate-400 font-mono mb-4 leading-relaxed">
              Không gian bàn vẽ vô tận đã được khởi tạo và kết nối Yjs CRDT. Chọn nhanh công cụ bên dưới hoặc dùng thanh Console phía trên để bắt đầu thiết kế:
            </p>

            <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
              <button
                type="button"
                onClick={() => handleAddA4DocAt(350, 120)}
                className="retro-btn flex items-center gap-2 px-3 py-2.5 cursor-pointer"
              >
                <FileText className="w-4 h-4 text-cyan-400" />
                <span className="font-pixel text-[9px] text-slate-200">+ TỜ A4 MỚI</span>
              </button>
              <button
                type="button"
                onClick={() => handleAddNoteAt(300, 200)}
                className="retro-btn flex items-center gap-2 px-3 py-2.5 cursor-pointer"
              >
                <StickyNote className="w-4 h-4 text-pink-400" />
                <span className="font-pixel text-[9px] text-slate-200">+ STICKY NOTE</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsShapePaletteOpen(true);
                }}
                className="retro-btn flex items-center gap-2 px-3 py-2.5 cursor-pointer"
              >
                <ShapeMiniIcon type="line-arrow" color="#f59e0b" size={16} />
                <span className="font-pixel text-[9px] text-slate-200">HÌNH & MŨI TÊN</span>
              </button>
              <button
                type="button"
                onClick={() => handleAddTableAt(350, 250)}
                className="retro-btn flex items-center gap-2 px-3 py-2.5 cursor-pointer"
              >
                <TableIcon className="w-4 h-4 text-emerald-400" />
                <span className="font-pixel text-[9px] text-slate-200">+ BẢNG 8-BIT</span>
              </button>
            </div>

            <div className="mt-4 pt-3 border-t border-[#1f273d] flex items-center justify-between text-[10px] text-slate-500 font-mono">
              <span>Space + Kéo: Pan • Cuộn: Zoom</span>
              <span className="text-cyan-400/80 font-pixel text-[9px]">ARCADEDOCS.PRO</span>
            </div>
          </div>
        )}

        {/* 1. Render Draggable & Resizable Sticky Notes */}
        {notes.map((note) => {
          const width = note.width || 280;
          const height = note.height || 180;

          return (
            <div
              key={note.id}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedItem({ type: "note", id: note.id });
              }}
              className={`absolute bg-[#101422] p-2.5 flex flex-col justify-between pointer-events-auto transition-all select-none group border-2 border-black ${
                selectedItem?.id === note.id
                  ? "outline outline-2 outline-cyan-400 shadow-[4px_4px_0_0_#00f0ff80]"
                  : "hover:outline hover:outline-1 hover:outline-slate-600"
              }`}
              style={{
                left: `${note.x}px`,
                top: `${note.y}px`,
                width: `${width}px`,
                height: `${height}px`,
                boxShadow: `3px 3px 0 0 #000000`,
              }}
            >
              {/* Header Handle: Retro Floppy Label Strip */}
              <div
                onMouseDown={(e) => handleNoteMouseDown(e, note.id, note.x, note.y)}
                className="retro-window-header flex items-center justify-between px-2 py-1.5 cursor-grab active:cursor-grabbing select-none -mx-2.5 -mt-2.5 mb-2 border-b-2 border-black"
                title="Bấm giữ thanh tiêu đề này để di chuyển Note"
              >
                <div className="flex items-center gap-1.5 flex-1 mr-2 overflow-hidden">
                  <span
                    className="w-2.5 h-2.5 border border-black shrink-0"
                    style={{ backgroundColor: note.color }}
                  />
                  <input
                    type="text"
                    value={note.title}
                    onMouseDown={(e) => e.stopPropagation()}
                    onChange={(e) => handleUpdateNote(note.id, "title", e.target.value)}
                    className="bg-transparent font-pixel text-[9px] focus:outline-none w-full truncate font-bold uppercase tracking-wider"
                    style={{ color: note.color }}
                  />
                </div>

                <button
                  onClick={(e) => handleDeleteNote(note.id, e)}
                  onMouseDown={(e) => e.stopPropagation()}
                  className="text-slate-500 hover:text-rose-400 transition cursor-pointer p-0.5 shrink-0"
                  title="Xóa note"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Note Content */}
              <NoteContent
                noteId={note.id}
                initialContent={note.content}
                onUpdate={handleUpdateNote}
                onCheckSelection={checkSelection}
                onFocusElement={(id) => {
                  lastActiveRefKey.current = id;
                  updateFormattingFromSelection();
                }}
                contentRefs={contentRefs}
              />

              {/* Resize Handle */}
              <div
                onMouseDown={(e) => handleResizeNoteMouseDown(e, note.id, width, height)}
                className="absolute -bottom-1 -right-1 w-5 h-5 cursor-se-resize flex items-end justify-end p-0.5 z-20 group/resizer"
                title="Kéo góc này để thay đổi kích thước Note"
              >
                <div
                  className="w-2.5 h-2.5 transition-transform group-hover/resizer:scale-125 border border-black"
                  style={{ backgroundColor: note.color }}
                />
              </div>
            </div>
          );
        })}

        {/* 2. Render Draggable & Resizable 8-Bit Tables */}
        {tables.map((table) => {
          const width = table.width || 440;
          const height = table.height || 220;

          return (
            <div
              key={table.id}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedItem({ type: "table", id: table.id });
              }}
              className={`absolute bg-[#101422] p-2.5 flex flex-col justify-between pointer-events-auto select-none group transition-all border-2 border-black ${
                selectedItem?.id === table.id
                  ? "outline outline-2 outline-cyan-400 shadow-[4px_4px_0_0_#00f0ff80]"
                  : "hover:outline hover:outline-1 hover:outline-slate-600"
              }`}
              style={{
                left: `${table.x}px`,
                top: `${table.y}px`,
                width: `${width}px`,
                minHeight: `${height}px`,
                boxShadow: `3px 3px 0 0 #000000`,
              }}
            >
              {/* Table Header Handle — drag only, nút bấm chuyển lên floating toolbar */}
              <div
                onMouseDown={(e) => handleTableMouseDown(e, table.id, table.x, table.y)}
                className="retro-window-header flex items-center justify-between px-2 py-1.5 cursor-grab active:cursor-grabbing select-none -mx-2.5 -mt-2.5 mb-2 border-b-2 border-black"
                title="Bấm giữ thanh này để di chuyển bảng"
              >
                <div className="flex items-center gap-1.5 flex-1 overflow-hidden">
                  <TableIcon className="w-3.5 h-3.5 shrink-0" style={{ color: table.color }} />
                  <span className="font-pixel text-[9px] truncate uppercase tracking-wider" style={{ color: table.color }}>
                    {table.title}
                  </span>
                </div>
                <button
                  onClick={(e) => handleDeleteTable(table.id, e)}
                  onMouseDown={(e) => e.stopPropagation()}
                  className="text-slate-500 hover:text-rose-400 transition cursor-pointer p-0.5 shrink-0"
                  title="Xóa bảng"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* FLOATING TOOLBAR — hiện phía trên bảng khi selected */}
              {selectedItem?.id === table.id && (
                <div
                  onMouseDown={(e) => e.stopPropagation()}
                  className="absolute -top-10 left-0 right-0 flex items-center gap-1.5 retro-window-frame bg-[#0d101a] px-2 py-1 shadow-[3px_3px_0_0_#000] z-30 text-xs font-mono select-none whitespace-nowrap overflow-x-auto"
                >
                  {/* L / C / R */}
                  <div className="flex items-center border border-[#2a3550] overflow-hidden shrink-0">
                    {(["left", "center", "right"] as const).map((a) => (
                      <button
                        key={a}
                        onClick={() => handleUpdateTableCellAlign(table.id, a)}
                        className={`px-2 py-0.5 text-[10px] font-pixel cursor-pointer transition ${
                          (table.cellAlign ?? "left") === a
                            ? "bg-cyan-500/25 text-cyan-300"
                            : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
                        }`}
                        title={a === "left" ? "Căn trái" : a === "center" ? "Căn giữa" : "Căn phải"}
                      >
                        {a === "left" ? "L" : a === "center" ? "C" : "R"}
                      </button>
                    ))}
                  </div>

                  <div className="retro-divider-v h-4 shrink-0" />

                  {/* Row / Col controls */}
                  <button
                    onClick={() => handleAddTableCol(table.id)}
                    className="retro-btn px-1.5 py-0.5 text-[9px] font-pixel text-cyan-300 cursor-pointer shrink-0"
                    title="Thêm cột"
                  >+ CỘT</button>
                  {table.headers.length > 1 && (
                    <button
                      onClick={() => handleDeleteTableCol(table.id)}
                      className="retro-btn px-1.5 py-0.5 text-[9px] font-pixel text-rose-400 cursor-pointer shrink-0"
                      title="Xóa cột cuối"
                    >- CỘT</button>
                  )}
                  <button
                    onClick={() => handleAddTableRow(table.id)}
                    className="retro-btn px-1.5 py-0.5 text-[9px] font-pixel text-cyan-300 cursor-pointer shrink-0"
                    title="Thêm hàng"
                  >+ HÀNG</button>
                  {table.rows.length > 1 && (
                    <button
                      onClick={() => handleDeleteTableRow(table.id)}
                      className="retro-btn px-1.5 py-0.5 text-[9px] font-pixel text-rose-400 cursor-pointer shrink-0"
                      title="Xóa hàng cuối"
                    >- HÀNG</button>
                  )}
                </div>
              )}

              {/* Table Body Grid */}
              <div className="overflow-x-auto flex-1 w-full mb-1">
                <table className="w-full border-collapse border border-[#253049] text-xs font-mono">
                  <thead>
                    <tr className="bg-[#0b0e18]">
                      {table.headers.map((header, colIndex) => (
                        <th key={colIndex} className="border border-[#253049] p-1">
                          <input
                            type="text"
                            value={header}
                            onMouseDown={(e) => e.stopPropagation()}
                            onChange={(e) => handleUpdateTableHeader(table.id, colIndex, e.target.value)}
                            className="w-full bg-transparent font-bold text-cyan-300 focus:outline-none px-1 text-xs"
                            style={{ textAlign: table.cellAlign ?? "left" }}
                          />
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {table.rows.map((row, rowIndex) => (
                      <tr key={rowIndex} className="hover:bg-[#161c2d]/60">
                        {row.map((cell, colIndex) => (
                          <td key={colIndex} className="border border-[#253049] p-1">
                            <input
                              type="text"
                              value={cell}
                              onMouseDown={(e) => e.stopPropagation()}
                              onChange={(e) => handleUpdateTableCell(table.id, rowIndex, colIndex, e.target.value)}
                              className="w-full bg-transparent text-slate-200 focus:outline-none px-1 text-xs focus:bg-[#1a2236]"
                              style={{ textAlign: table.cellAlign ?? "left" }}
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Resize Handle */}
              <div
                onMouseDown={(e) => handleResizeTableMouseDown(e, table.id, width, height)}
                className="absolute -bottom-1 -right-1 w-5 h-5 cursor-se-resize flex items-end justify-end p-0.5 z-20 group/resizer"
                title="Kéo góc này để thay đổi kích thước Bảng"
              >
                <div
                  className="w-2.5 h-2.5 transition-transform group-hover/resizer:scale-125 border border-black"
                  style={{ backgroundColor: table.color }}
                />
              </div>
            </div>
          );
        })}

        {/* 3. Render Independent A4 Documents that can be attached to the bottom to form continuous pages */}
        {a4Docs.map((doc) => {
          const availableOtherDocs = a4Docs.filter((d) => d.id !== doc.id);
          const isSnapBottomTarget = snapBottomTargetId === doc.id;

          return (
            <div
              key={doc.id}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedItem({ type: "a4", id: doc.id });
              }}
              className={`absolute flex flex-col items-center pointer-events-auto transition-all ${
                selectedItem?.id === doc.id
                  ? "outline outline-3 outline-cyan-400 shadow-[0_0_30px_rgba(0,240,255,0.3)]"
                  : ""
              }`}
              style={{
                left: `${doc.x}px`,
                top: `${doc.y}px`,
              }}
            >
              {/* A4 Document Top Header Handle: Retro Workstation Window Titlebar */}
              <div
                onMouseDown={(e) => handleA4MouseDown(e, doc.id, doc.x, doc.y)}
                className="w-[794px] retro-window-header border-2 border-black px-3 py-1.5 flex items-center justify-between cursor-grab active:cursor-grabbing select-none mb-1 shadow-[3px_3px_0_0_#000]"
              >
                <div className="flex items-center gap-2 flex-1 mr-4 overflow-hidden">
                  <FileText className="w-4 h-4 text-cyan-400 shrink-0" />
                  <input
                    type="text"
                    value={doc.title}
                    onMouseDown={(e) => e.stopPropagation()}
                    onChange={(e) => handleUpdateA4Title(doc.id, e.target.value)}
                    className="bg-transparent font-pixel text-xs text-slate-100 focus:outline-none w-full truncate font-bold uppercase tracking-wider"
                  />
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[9px] font-pixel text-cyan-300 bg-[#070a12] px-2 py-0.5 border border-black">
                    {doc.pages.length} TRANG {doc.pages.length > 1 ? "LIÊN TỤC" : ""}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleAddA4Page(doc.id)}
                    onMouseDown={(e) => e.stopPropagation()}
                    className="retro-btn flex items-center gap-1 text-[9px] font-pixel px-2 py-1 text-emerald-300 hover:text-white cursor-pointer"
                    title="Thêm một trang A4 mới vào cuối tài liệu này"
                  >
                    <Plus className="w-3 h-3 text-emerald-400" />
                    <span>+ TRANG</span>
                  </button>

                  {/* Nút Ghép nhanh tờ này vào cuối tờ khác nếu có */}
                  {availableOtherDocs.length === 1 ? (
                    <button
                      onClick={() => handleAttachDocToBottom(availableOtherDocs[0].id, doc.id)}
                      onMouseDown={(e) => e.stopPropagation()}
                      className="retro-btn flex items-center gap-1 text-[9px] font-pixel px-2 py-1 text-cyan-300 cursor-pointer"
                      title={`Ghép nối tờ này vào cuối ${availableOtherDocs[0].title}`}
                    >
                      <ArrowDown className="w-3 h-3 text-cyan-400" />
                      <span>GHÉP VÀO CUỐI {availableOtherDocs[0].title.slice(0, 6)}...</span>
                    </button>
                  ) : availableOtherDocs.length > 1 ? (
                    <div className="relative">
                      <button
                        onClick={() => setHeaderAttachPickerId(headerAttachPickerId === doc.id ? null : doc.id)}
                        onMouseDown={(e) => e.stopPropagation()}
                        className="retro-btn flex items-center gap-1 text-[9px] font-pixel px-2 py-1 text-cyan-300 cursor-pointer"
                      >
                        <ArrowDown className="w-3 h-3 text-cyan-400" />
                        <span>GHÉP VÀO CUỐI...</span>
                      </button>
                      {headerAttachPickerId === doc.id && (
                        <div
                          className="absolute top-full mt-1 right-0 retro-window-frame bg-[#0d101a] p-2 w-64 shadow-2xl z-50 font-mono text-xs"
                          onMouseDown={(e) => e.stopPropagation()}
                        >
                          <div className="text-[9px] font-pixel text-cyan-300 px-2 py-1 border-b border-[#1f273d] mb-1">
                            GHÉP NỐI VÀO CUỐI TỜ NÀO:
                          </div>
                          {availableOtherDocs.map((other) => (
                            <button
                              key={other.id}
                              onClick={() => {
                                handleAttachDocToBottom(other.id, doc.id);
                                setHeaderAttachPickerId(null);
                              }}
                              className="retro-btn w-full text-left px-2.5 py-1.5 mb-1 hover:bg-cyan-500/20 text-slate-200 flex items-center justify-between cursor-pointer"
                            >
                              <span className="truncate mr-2">{other.title}</span>
                              <span className="text-[9px] text-cyan-400 font-pixel shrink-0">⬇️ NỐI</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : null}

                  <button
                    onClick={(e) => handleDeleteA4Doc(doc.id, e)}
                    onMouseDown={(e) => e.stopPropagation()}
                    className="text-slate-400 hover:text-rose-400 p-0.5 cursor-pointer"
                    title="Xóa toàn bộ tờ A4 này"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Render Sheets in this document continuously */}
              {doc.pages.map((pageContent, pageIndex) => (
                <React.Fragment key={pageIndex}>
                  {/* Page Break Bar between consecutive continuous pages */}
                  {pageIndex > 0 && (
                    <div className="w-[794px] my-3 py-1.5 px-3 retro-window-header border-2 border-black flex items-center justify-between font-mono text-[11px] text-slate-300 shadow-[2px_2px_0_0_#000]">
                      <span className="flex items-center gap-1.5 font-pixel text-[9px] text-cyan-300">
                        <span className="w-2 h-2 bg-cyan-400 border border-black" />
                        ── HẾT TRANG {pageIndex} • BẮT ĐẦU TRANG {pageIndex + 1} LIÊN TỤC ──
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleSplitPageToNewDoc(doc.id, pageIndex)}
                          onMouseDown={(e) => e.stopPropagation()}
                          className="retro-btn flex items-center gap-1.5 text-[9px] font-pixel px-2 py-1 text-indigo-300 cursor-pointer"
                          title="Tách rời trang này thành một tờ A4 độc lập riêng"
                        >
                          <Scissors className="w-3 h-3" />
                          <span>TÁCH TỜ {pageIndex + 1}</span>
                        </button>
                        <button
                          onClick={() => handleDeleteA4Page(doc.id, pageIndex)}
                          onMouseDown={(e) => e.stopPropagation()}
                          className="retro-btn-danger flex items-center gap-1.5 text-[9px] font-pixel px-2 py-1 text-rose-400 cursor-pointer"
                          title="Xóa vĩnh viễn trang này khỏi tài liệu"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>XÓA TRANG {pageIndex + 1}</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Individual A4 Sheet - Strict 1-Page A4 Height & Styling */}
                  <div
                    className="relative retro-a4-sheet text-slate-900 mb-2 group/page"
                    style={{
                      width: "794px",
                      height: "1123px",
                      maxHeight: "1123px",
                      overflow: "hidden",
                      padding: "64px",
                      boxSizing: "border-box",
                    }}
                  >
                    {/* Page Number Watermark */}
                    <div className="absolute top-4 right-8 text-[10px] text-slate-400 font-pixel select-none">
                      TRANG {pageIndex + 1} / {doc.pages.length}
                    </div>

                    {/* A4 Page Content Area */}
                    <A4PageContent
                      docId={doc.id}
                      pageIndex={pageIndex}
                      initialContent={pageContent}
                      onUpdatePage={handleUpdateA4Page}
                      onPageOverflow={handleA4PageOverflow}
                      onDeletePage={handleDeleteA4Page}
                      onCheckSelection={checkSelection}
                      onFocusElement={(k) => {
                        lastActiveRefKey.current = k;
                        updateFormattingFromSelection();
                      }}
                      contentRefs={contentRefs}
                    />
                  </div>
                </React.Fragment>
              ))}

              {/* =========================================================================
                  BOTTOM ATTACHMENT CONNECTOR SLOT (TRACTOR-FEED RETRO CONTINUOUS PAPER)
                  ========================================================================= */}
              <div className="w-[794px] mt-2 mb-8 flex flex-col items-center">
                {isSnapBottomTarget ? (
                  <div className="w-full py-6 bg-cyan-950/40 border-2 border-dashed border-cyan-400 flex items-center justify-center gap-2 text-cyan-300 font-pixel text-[10px] animate-pulse shadow-[0_0_25px_rgba(0,240,255,0.4)]">
                    <ArrowDown className="w-4 h-4 animate-bounce text-cyan-400" />
                    <span>⬇️ THẢ CHUỘT TẠI ĐÂY ĐỂ GHÉP LIÊN TỤC (TRACTOR FEED) ⬇️</span>
                  </div>
                ) : (
                  availableOtherDocs.length > 0 && (
                    <div className="relative w-full">
                      <button
                        onClick={() => setAttachPickerDocId(attachPickerDocId === doc.id ? null : doc.id)}
                        onMouseDown={(e) => e.stopPropagation()}
                        className="tractor-feed-slot w-full py-2.5 px-4 flex items-center justify-center gap-2 text-slate-300 hover:text-cyan-300 font-pixel text-[9px] uppercase tracking-wider cursor-pointer"
                      >
                        <ArrowDown className="w-3.5 h-3.5 text-cyan-400" />
                        <span>════ ⯆ GHÉP TỜ A4 KHÁC VÀO CUỐI TỜ NÀY (TRANG LIÊN TỤC) ⯆ ════</span>
                      </button>

                      {/* Popover danh sách tờ A4 khác có thể ghép vào cuối */}
                      {attachPickerDocId === doc.id && (
                        <div
                          className="absolute top-full mt-1.5 left-1/2 -translate-x-1/2 retro-window-frame bg-[#0d101a] p-2 w-72 shadow-2xl z-50 font-mono text-xs"
                          onMouseDown={(e) => e.stopPropagation()}
                        >
                          <div className="text-[9px] font-pixel text-cyan-300 px-2 py-1 border-b border-[#1f273d] mb-1">
                            CHỌN TỜ A4 GHÉP VÀO CUỐI:
                          </div>
                          {availableOtherDocs.map((other) => (
                            <button
                              key={other.id}
                              onClick={() => handleAttachDocToBottom(doc.id, other.id)}
                              className="retro-btn w-full text-left px-2.5 py-1.5 mb-1 flex items-center justify-between cursor-pointer hover:text-cyan-300"
                            >
                              <span className="truncate mr-2">{other.title}</span>
                              <span className="text-[9px] text-cyan-400 font-pixel shrink-0">⬇️ GHÉP</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                )}
              </div>
            </div>
          );
        })}

        {/* 4. LIVE DRAWING PREVIEW FOR NEW SHAPE */}
        {isDrawingShape && (() => {
          if (isArrowConnector(selectedShapeType)) {
            const dx = drawCurrentPos.x - drawStartPos.x;
            const dy = drawCurrentPos.y - drawStartPos.y;
            const angle = Math.atan2(dy, dx) * (180 / Math.PI);
            const length = Math.round(Math.hypot(dx, dy));
            const hasArrowEnd = selectedShapeType === "line-arrow" || selectedShapeType === "arrow-bidirectional";
            const hasArrowStart = selectedShapeType === "arrow-bidirectional";

            const angleRad = Math.atan2(dy, dx);
            const shaftStartX = hasArrowStart ? drawStartPos.x + Math.cos(angleRad) * 10 : drawStartPos.x;
            const shaftStartY = hasArrowStart ? drawStartPos.y + Math.sin(angleRad) * 10 : drawStartPos.y;
            const shaftEndX = hasArrowEnd ? drawCurrentPos.x - Math.cos(angleRad) * 10 : drawCurrentPos.x;
            const shaftEndY = hasArrowEnd ? drawCurrentPos.y - Math.sin(angleRad) * 10 : drawCurrentPos.y;

            return (
              <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-40">
                <svg
                  className="absolute top-0 left-0 w-full h-full overflow-visible"
                  style={{ width: "1px", height: "1px" }}
                >
                  <line
                    x1={shaftStartX}
                    y1={shaftStartY + 2}
                    x2={shaftEndX}
                    y2={shaftEndY + 2}
                    stroke="#000000"
                    strokeWidth={4.5}
                    opacity={0.6}
                    strokeLinecap="round"
                  />
                  <line
                    x1={shaftStartX}
                    y1={shaftStartY}
                    x2={shaftEndX}
                    y2={shaftEndY}
                    stroke="#ff2a4b"
                    strokeWidth={3.5}
                    strokeLinecap="round"
                  />
                  {hasArrowEnd && (
                    <g transform={`translate(${drawCurrentPos.x}, ${drawCurrentPos.y}) rotate(${angle})`}>
                      <polygon points="0,0 -18,-8.5 -18,8.5" fill="#ff2a4b" stroke="#000000" strokeWidth={1.5} />
                    </g>
                  )}
                  {hasArrowStart && (
                    <g transform={`translate(${drawStartPos.x}, ${drawStartPos.y}) rotate(${angle + 180})`}>
                      <polygon points="0,0 -18,-8.5 -18,8.5" fill="#ff2a4b" stroke="#000000" strokeWidth={1.5} />
                    </g>
                  )}
                  <circle cx={drawStartPos.x} cy={drawStartPos.y} r={6} fill="#ffffff" stroke="#000000" strokeWidth={2} />
                  <circle cx={drawCurrentPos.x} cy={drawCurrentPos.y} r={6} fill="#ffffff" stroke="#000000" strokeWidth={2} />
                </svg>
                <div
                  className="absolute bg-rose-600 text-white text-[9px] font-pixel px-1.5 py-0.5 rounded shadow whitespace-nowrap"
                  style={{
                    left: `${(drawStartPos.x + drawCurrentPos.x) / 2}px`,
                    top: `${(drawStartPos.y + drawCurrentPos.y) / 2 - 20}px`,
                    transform: "translate(-50%, -100%)",
                  }}
                >
                  {length} px ({Math.round(angle)}°)
                </div>
              </div>
            );
          }

          const minX = Math.min(drawStartPos.x, drawCurrentPos.x);
          const minY = Math.min(drawStartPos.y, drawCurrentPos.y);
          const width = Math.max(1, Math.abs(drawCurrentPos.x - drawStartPos.x));
          const height = Math.max(1, Math.abs(drawCurrentPos.y - drawStartPos.y));

          return (
            <div
              className="absolute pointer-events-none z-40 border border-dashed border-amber-400"
              style={{
                left: `${minX}px`,
                top: `${minY}px`,
                width: `${width}px`,
                height: `${height}px`,
                background: "rgba(245, 158, 11, 0.08)",
              }}
            >
              <svg
                width="100%"
                height="100%"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                className="overflow-visible w-full h-full drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]"
              >
                {renderShapeSvgGeometry(selectedShapeType, "#f59e0b", "rgba(245, 158, 11, 0.2)")}
              </svg>
              <div className="absolute -top-6 left-0 bg-amber-500 text-black text-[9px] font-pixel px-1.5 py-0.5 rounded shadow whitespace-nowrap">
                {Math.round(width)} × {Math.round(height)} px
              </div>
            </div>
          );
        })()}

        {/* 5. RENDER CUSTOM EDITABLE SHAPES & ARROWS */}
        {shapes.map((shape) => {
          if (isArrowConnector(shape.type)) {
            return (
              <ArrowConnectorView
                key={shape.id}
                shape={shape}
                isSelected={selectedItem?.type === "shape" && selectedItem.id === shape.id}
                zoom={zoom}
                isSpacePressed={isSpacePressed}
                activeTool={activeTool}
                onSelect={(id) => setSelectedItem({ type: "shape", id })}
                onUpdateEndpoints={handleUpdateArrowEndpoints}
                onUpdateColor={handleUpdateShapeColor}
                onUpdateType={handleUpdateShapeType}
                onUpdateStrokeDash={handleUpdateShapeStrokeDash}
                onDelete={handleDeleteShape}
              />
            );
          }

          return (
            <ShapeItemView
              key={shape.id}
              shape={shape}
              isSelected={selectedItem?.type === "shape" && selectedItem.id === shape.id}
              onSelect={(id) => setSelectedItem({ type: "shape", id })}
              onMouseDown={handleShapeMouseDown}
              onResizeMouseDown={handleResizeShapeMouseDown}
              onDelete={handleDeleteShape}
              onUpdateContent={handleUpdateShapeContent}
              onUpdateColor={handleUpdateShapeColor}
              onUpdateType={handleUpdateShapeType}
              onUpdateTextAlign={handleUpdateShapeTextAlign}
              onUpdateVerticalAlign={handleUpdateShapeVerticalAlign}
              onCheckSelection={checkSelection}
              onFocusElement={(k) => {
                lastActiveRefKey.current = k;
                updateFormattingFromSelection();
              }}
              contentRefs={contentRefs}
            />
          );
        })}

        {/* MULTIPLAYER LIVE CURSORS (FIGMA STYLE) */}
        {remotePlayers.map(({ clientId, user, cursor }) => {
          if (!cursor) return null;
          return (
            <div
              key={clientId}
              className="absolute pointer-events-none transition-all duration-75 ease-out z-50 flex items-start gap-1"
              style={{
                left: `${cursor.x}px`,
                top: `${cursor.y}px`,
              }}
            >
              <PixelCursor color={user.color || "#00f0ff"} />
              <span
                className="px-2 py-0.5 rounded text-[10px] font-pixel text-white shadow-md uppercase tracking-wider whitespace-nowrap"
                style={{ backgroundColor: user.color || "#00f0ff" }}
              >
                {user.name}
              </span>
            </div>
          );
        })}
      </div>

      {/* =========================================================================
          FLOATING BUBBLE TOOLBAR ON TEXT SELECTION (BOLD, ITALIC, UNDERLINE, ALIGN)
          ========================================================================= */}
      {floatingMenu && (
        <div
          className="fixed z-50 -translate-x-1/2 retro-window-frame bg-[#0d101a] p-1 shadow-[3px_3px_0_0_#000] border-2 border-black flex items-center gap-1 select-none"
          style={{
            left: `${floatingMenu.x}px`,
            top: `${floatingMenu.y}px`,
          }}
          onMouseDown={(e) => {
            e.preventDefault();
          }}
        >
          {/* Bold */}
          <button
            type="button"
            onClick={() => applyFormatting("bold")}
            className="retro-btn p-1 cursor-pointer"
            title="In đậm (Bold)"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>

          {/* Italic */}
          <button
            type="button"
            onClick={() => applyFormatting("italic")}
            className="retro-btn p-1 cursor-pointer"
            title="In nghiêng (Italic)"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>

          {/* Underline */}
          <button
            type="button"
            onClick={() => applyFormatting("underline")}
            className="retro-btn p-1 cursor-pointer"
            title="Gạch chân (Underline)"
          >
            <Underline className="w-3.5 h-3.5" />
          </button>

          {/* Strikethrough */}
          <button
            type="button"
            onClick={() => applyFormatting("strikeThrough")}
            className="retro-btn p-1 cursor-pointer"
            title="Gạch ngang (Strikethrough)"
          >
            <Strikethrough className="w-3.5 h-3.5" />
          </button>

          <div className="retro-divider-v h-4" />

          {/* Align Left */}
          <button
            type="button"
            onClick={() => applyFormatting("justifyLeft")}
            className="retro-btn p-1 cursor-pointer"
            title="Căn trái"
          >
            <AlignLeft className="w-3.5 h-3.5" />
          </button>

          {/* Align Center */}
          <button
            type="button"
            onClick={() => applyFormatting("justifyCenter")}
            className="retro-btn p-1 cursor-pointer"
            title="Căn giữa"
          >
            <AlignCenter className="w-3.5 h-3.5" />
          </button>

          {/* Align Right */}
          <button
            type="button"
            onClick={() => applyFormatting("justifyRight")}
            className="retro-btn p-1 cursor-pointer"
            title="Căn phải"
          >
            <AlignRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* =========================================================================
          CUSTOM 8-BIT CONTEXT MENU (RIGHT-CLICK POPUP)
          ========================================================================= */}
      {contextMenu && (
        <div
          className="fixed z-50 retro-window-frame bg-[#0d101a] p-1.5 shadow-[5px_5px_0_0_#000] border-2 border-black w-64 select-none font-mono text-xs text-slate-200"
          style={{
            left: `${Math.min(contextMenu.x, typeof window !== "undefined" ? window.innerWidth - 270 : contextMenu.x)}px`,
            top: `${Math.min(contextMenu.y, typeof window !== "undefined" ? window.innerHeight - 360 : contextMenu.y)}px`,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-2.5 py-1 text-[9px] font-pixel text-cyan-400 border-b border-[#1f273d] pb-1 mb-1.5 flex items-center justify-between">
            <span>ARCADE ACTIONS</span>
            <span className="text-slate-500 text-[8px]">8-BIT</span>
          </div>

          <button
            onClick={() => {
              handleAddA4DocAt(contextMenu.canvasX, contextMenu.canvasY);
              setContextMenu(null);
            }}
            className="retro-btn w-full px-2.5 py-1.5 mb-1 text-left flex items-center justify-between cursor-pointer hover:text-cyan-300"
          >
            <div className="flex items-center gap-2">
              <FileText className="w-3.5 h-3.5 text-cyan-400" />
              <span>Thêm Tờ Giấy A4 Mới</span>
            </div>
            <span className="text-[9px] font-pixel text-cyan-400">A4</span>
          </button>

          <button
            onClick={() => {
              handleAddNoteAt(contextMenu.canvasX, contextMenu.canvasY);
              setContextMenu(null);
            }}
            className="retro-btn w-full px-2.5 py-1.5 mb-1 text-left flex items-center justify-between cursor-pointer hover:text-pink-300"
          >
            <div className="flex items-center gap-2">
              <StickyNote className="w-3.5 h-3.5 text-pink-400" />
              <span>Thêm Note 8-Bit</span>
            </div>
            <span className="text-[9px] font-pixel text-pink-400">N</span>
          </button>

          <button
            onClick={() => {
              if (isArrowConnector(selectedShapeType)) {
                const newArrow: PlaygroundShapeItem = {
                  id: "arrow-" + Date.now(),
                  type: selectedShapeType,
                  x: contextMenu.canvasX - 100,
                  y: contextMenu.canvasY - 15,
                  width: 200,
                  height: 30,
                  startX: contextMenu.canvasX - 100,
                  startY: contextMenu.canvasY,
                  endX: contextMenu.canvasX + 100,
                  endY: contextMenu.canvasY,
                  color: "#ff2a4b",
                  content: "",
                };
                const yShapes = ydoc.getMap<PlaygroundShapeItem>("playground-shapes");
                yShapes.set(newArrow.id, newArrow);
                setSelectedItem({ type: "shape", id: newArrow.id });
                setContextMenu(null);
                return;
              }

              const newShape: PlaygroundShapeItem = {
                id: "shape-" + Date.now(),
                type: selectedShapeType,
                x: contextMenu.canvasX - 90,
                y: contextMenu.canvasY - 80,
                width: 180,
                height: 160,
                color: "#f59e0b",
                content: "",
              };
              const yShapes = ydoc.getMap<PlaygroundShapeItem>("playground-shapes");
              yShapes.set(newShape.id, newShape);
              setSelectedItem({ type: "shape", id: newShape.id });
              setContextMenu(null);
            }}
            className="retro-btn w-full px-2.5 py-1.5 mb-1 text-left flex items-center justify-between cursor-pointer hover:text-amber-300"
          >
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 flex items-center justify-center">
                <ShapeMiniIcon type={selectedShapeType} color="#f59e0b" size={14} />
              </div>
              <span>Thêm Hình ({selectedShapeType})</span>
            </div>
            <span className="text-[9px] font-pixel text-amber-400">S</span>
          </button>

          <button
            onClick={() => {
              handleAddTableAt(contextMenu.canvasX, contextMenu.canvasY);
              setContextMenu(null);
            }}
            className="retro-btn w-full px-2.5 py-1.5 mb-1 text-left flex items-center justify-between cursor-pointer hover:text-emerald-300"
          >
            <div className="flex items-center gap-2">
              <TableIcon className="w-3.5 h-3.5 text-emerald-400" />
              <span>Thêm Bảng 8-Bit</span>
            </div>
            <span className="text-[9px] font-pixel text-emerald-400">T</span>
          </button>

          <button
            onClick={() => {
              handleClearCanvas();
              setContextMenu(null);
            }}
            className="retro-btn-danger w-full px-2.5 py-1.5 mb-1 text-left flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              <span>Dọn sạch bàn vẽ</span>
            </div>
            <span className="text-[9px] font-pixel text-rose-400">CLEAR</span>
          </button>

          <div className="retro-divider-h my-1" />

          {/* Phóng to: Zoom chính xác tại tọa độ chuột vừa click! */}
          <button
            onClick={() => {
              applyZoomAtPoint((z) => +(z + 0.15).toFixed(2), contextMenu.x, contextMenu.y);
              setContextMenu(null);
            }}
            className="retro-btn w-full px-2.5 py-1 text-left flex items-center justify-between cursor-pointer mb-0.5"
          >
            <div className="flex items-center gap-2">
              <ZoomIn className="w-3.5 h-3.5 text-slate-400" />
              <span>Phóng to</span>
            </div>
            <span className="text-[9px] text-slate-400 font-mono">Ctrl +</span>
          </button>

          {/* Thu nhỏ: Zoom chính xác tại tọa độ chuột vừa click! */}
          <button
            onClick={() => {
              applyZoomAtPoint((z) => +(z - 0.15).toFixed(2), contextMenu.x, contextMenu.y);
              setContextMenu(null);
            }}
            className="retro-btn w-full px-2.5 py-1 text-left flex items-center justify-between cursor-pointer mb-0.5"
          >
            <div className="flex items-center gap-2">
              <ZoomOut className="w-3.5 h-3.5 text-slate-400" />
              <span>Thu nhỏ</span>
            </div>
            <span className="text-[9px] text-slate-400 font-mono">Ctrl -</span>
          </button>

          <button
            onClick={() => {
              resetViewport();
              setContextMenu(null);
            }}
            className="retro-btn w-full px-2.5 py-1 text-left flex items-center justify-between cursor-pointer mb-0.5"
          >
            <div className="flex items-center gap-2">
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span>Khôi phục 100%</span>
            </div>
            <span className="text-[9px] text-slate-400 font-mono">Ctrl 0</span>
          </button>

          <div className="retro-divider-h my-1" />

          {/* Đổi Background */}
          <button
            onClick={() => {
              setIsBgDropdownOpen(true);
              setContextMenu(null);
            }}
            className="retro-btn w-full px-2.5 py-1 text-left flex items-center justify-between cursor-pointer mb-0.5"
          >
            <div className="flex items-center gap-2">
              <PaletteIcon className="w-3.5 h-3.5 text-cyan-400" />
              <span>Đổi background...</span>
            </div>
            <span className="text-[9px] text-cyan-400 font-pixel">BG</span>
          </button>

          <button
            onClick={() => {
              handleCopyLink();
              setContextMenu(null);
            }}
            className="retro-btn-amber w-full px-2.5 py-1 text-left flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Share2 className="w-3.5 h-3.5 text-black" />
              <span>Copy Link phòng</span>
            </div>
            <span className="text-[9px] text-black font-pixel">SHARE</span>
          </button>
        </div>
      )}

      {/* FIXED BOTTOM RETRO WORKSTATION HUD */}
      <footer className="fixed bottom-3 left-4 right-4 flex items-center justify-between pointer-events-none z-30 select-none text-[11px] font-mono">
        {/* Left Status Indicators (Retro Telemetry Readout) */}
        <div className="flex items-center gap-2 bg-[#0c0f18] border-2 border-black retro-panel px-3 py-1 text-slate-300 shadow-[3px_3px_0_0_#000] pointer-events-auto">
          <span className="flex items-center gap-1.5 text-cyan-400 font-pixel text-[9px]">
            <span className="w-1.5 h-1.5 bg-cyan-400 border border-black" />
            POS
          </span>
          <span className="retro-panel-sunken px-1.5 py-0.2 text-[10px] text-amber-300 font-mono">
            X:{Math.round(pan.x)} Y:{Math.round(pan.y)}
          </span>
          <span className="text-slate-600">|</span>
          <span className="retro-panel-sunken px-1.5 py-0.2 text-[10px] text-cyan-300 font-mono font-bold">
            {Math.round(zoom * 100)}%
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-[10px] text-slate-400 font-mono">
            {notes.length + tables.length + a4Docs.length + shapes.length} OBJS
          </span>
        </div>

        {/* Right Shortcuts & Engine Status */}
        <div className="hidden sm:flex items-center gap-2.5 bg-[#0c0f18] border-2 border-black retro-panel px-3 py-1 text-slate-400 shadow-[3px_3px_0_0_#000] pointer-events-auto">
          <span className="text-slate-400 text-[10px] font-mono">Space+Kéo: Pan • Cuộn: Zoom</span>
          <span className="text-slate-600">|</span>
          <span className="flex items-center gap-1.5 text-emerald-400 font-pixel text-[9px]">
            <span className="w-2 h-2 bg-emerald-400 border border-black animate-pulse" />
            8-BIT ENGINE: ONLINE
          </span>
        </div>
      </footer>

      {/* =========================================================================
          RETRO SHARE & COLLABORATORS MODAL (ARCADE WORKSTATION STYLE)
          ========================================================================= */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs select-none">
          <div className="w-full max-w-md bg-[#0d1120] border-4 border-[#1a2236] p-5 shadow-[6px_6px_0_0_#000] flex flex-col gap-4 font-retro-text text-slate-100">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b-2 border-[#1a2236] pb-3">
              <div className="flex items-center gap-2">
                <Share2 className="w-4 h-4 text-cyan-400" />
                <span className="font-pixel text-xs text-cyan-300 tracking-wider">CHIA SẺ & THÀNH VIÊN</span>
              </div>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-slate-400 hover:text-rose-400 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 1. Link sharing */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-pixel text-slate-400 uppercase tracking-wider block">
                Liên kết Canvas:
              </label>
              <div className="flex items-center gap-2">
                <input
                  readOnly
                  value={typeof window !== "undefined" ? window.location.href : ""}
                  className="bg-[#121624] border border-[#243048] text-slate-300 text-xs font-mono px-2.5 py-1.5 flex-1 focus:outline-none select-all"
                />
                <button
                  onClick={handleCopyLink}
                  className="retro-btn-amber px-3 py-1.5 text-[10px] font-pixel uppercase tracking-wider cursor-pointer whitespace-nowrap"
                >
                  {copied ? "ĐÃ COPY!" : "COPY LINK"}
                </button>
              </div>
            </div>

            {/* 2. Owner Controls (Only for Owner) */}
            {isOwner && (
              <>
                {/* Privacy switch */}
                <div className="flex items-center justify-between bg-[#111826] p-2.5 border border-[#1f2d42]">
                  <div>
                    <div className="text-[11px] font-pixel text-slate-200">CHẾ ĐỘ TRUY CẬP:</div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {fileInfo?.is_public ? "Ai có liên kết đều vào được" : "Chỉ bạn và thành viên được mời"}
                    </div>
                  </div>
                  <button
                    onClick={handleTogglePrivacy}
                    disabled={privacyLoading}
                    className={`px-3 py-1 text-[10px] font-pixel uppercase cursor-pointer border transition ${
                      fileInfo?.is_public
                        ? "border-emerald-600 bg-emerald-950/40 text-emerald-400 hover:bg-emerald-950/70"
                        : "border-amber-600 bg-amber-950/40 text-amber-400 hover:bg-amber-950/70"
                    }`}
                  >
                    {fileInfo?.is_public ? "🌐 PUBLIC" : "🔒 PRIVATE"}
                  </button>
                </div>

                {/* Default Guest Permission Toggle */}
                <div className="flex items-center justify-between bg-[#111826] p-2.5 border border-[#1f2d42]">
                  <div>
                    <div className="text-[11px] font-pixel text-slate-200">QUYỀN CHO KHÁCH:</div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {guestMode === "view" ? "Khách chỉ xem, không chỉnh sửa" : "Khách được vẽ và sửa cùng bạn"}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      const next = guestMode === "view" ? "edit" : "view";
                      setGuestMode(next);
                      const yMeta = ydoc.getMap("playground-metadata");
                      yMeta.set("guest_mode", next);
                    }}
                    className={`px-3 py-1 text-[10px] font-pixel uppercase cursor-pointer border transition ${
                      guestMode === "view"
                        ? "border-sky-600 bg-sky-950/40 text-sky-400 hover:bg-sky-950/70"
                        : "border-indigo-600 bg-indigo-950/40 text-indigo-400 hover:bg-indigo-950/70"
                    }`}
                  >
                    {guestMode === "view" ? "👀 CHỈ XEM" : "✏️ CHỈNH SỬA"}
                  </button>
                </div>

                {/* PENDING ACCESS REQUESTS SECTION */}
                {pendingRequests.length > 0 && (
                  <div className="bg-[#1c150b] border-2 border-amber-500/80 p-3 shadow-[3px_3px_0_0_#d97706] space-y-2">
                    <div className="flex items-center justify-between border-b border-amber-500/30 pb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-amber-400 border border-black animate-ping" />
                        <span className="font-pixel text-[10px] text-amber-300 uppercase tracking-wider">
                          YÊU CẦU TRUY CẬP CHỜ DUYỆT ({pendingRequests.length})
                        </span>
                      </div>
                      <span className="text-[8px] font-mono text-amber-400/80 uppercase">
                        Cần duyệt
                      </span>
                    </div>

                    <div className="max-h-40 overflow-y-auto space-y-2 pr-1">
                      {pendingRequests.map((req) => (
                        <div
                          key={req.id}
                          className="bg-[#100d07] border border-amber-500/40 p-2 text-xs font-mono flex flex-col gap-1.5 shadow-[2px_2px_0_0_#000]"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <span className="text-cyan-300 font-bold">#{req.accountCode}</span>
                              <span className="text-[8px] px-1 py-0.2 border border-amber-500/60 text-amber-300 font-pixel">
                                XIN {req.permission === "view" ? "XEM" : "SỬA"}
                              </span>
                            </div>
                            <span className="text-[8px] text-slate-500">
                              {new Date(req.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>

                          {req.note && (
                            <div className="text-[10px] text-slate-400 italic bg-[#090704] p-1.5 border border-[#261e12]">
                              &ldquo;{req.note}&rdquo;
                            </div>
                          )}

                          <div className="flex items-center justify-end gap-1.5 pt-1 border-t border-[#261e12]">
                            <button
                              type="button"
                              disabled={reqActionLoading === req.accountCode}
                              onClick={() => handleOwnerRequestAction(req.accountCode, "approve", req.permission)}
                              className="retro-btn px-2.5 py-1 text-[9px] font-pixel text-emerald-400 border border-emerald-500/60 hover:bg-emerald-500/10 uppercase cursor-pointer disabled:opacity-50"
                            >
                              {reqActionLoading === req.accountCode ? "ĐANG LƯU..." : `CHẤP THUẬN (${req.permission === "view" ? "XEM" : "SỬA"})`}
                            </button>
                            <button
                              type="button"
                              disabled={reqActionLoading === req.accountCode}
                              onClick={() => handleOwnerRequestAction(req.accountCode, "reject")}
                              className="text-slate-500 hover:text-rose-400 text-[9px] font-pixel px-1.5 py-0.5 cursor-pointer disabled:opacity-50"
                            >
                              TỪ CHỐI
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Whitelist Members (When Private) */}
                <div className="space-y-2 border-t border-[#1a2236] pt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-pixel text-slate-300 uppercase tracking-wider">
                      MỜI ĐÍCH DANH VÀO PHÒNG PRIVATE:
                    </span>
                    <span className="text-[9px] font-mono text-slate-500">
                      {collaborators.length} thành viên
                    </span>
                  </div>

                  {/* Add collaborator form */}
                  <div className="flex items-center gap-1.5">
                    <input
                      value={newCollabCode}
                      onChange={(e) => setNewCollabCode(e.target.value)}
                      placeholder="Mã tài khoản (vd: #A1B2C3)..."
                      className="bg-[#121624] border border-[#243048] text-white text-xs font-mono px-2.5 py-1.5 flex-1 focus:outline-none"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleAddCollaborator();
                      }}
                    />
                    <select
                      value={newCollabPerm}
                      onChange={(e) => setNewCollabPerm(e.target.value as "edit" | "view")}
                      className="bg-[#121624] border border-[#243048] text-slate-300 text-[11px] font-mono px-2 py-1.5 focus:outline-none"
                    >
                      <option value="edit">Sửa</option>
                      <option value="view">Xem</option>
                    </select>
                    <button
                      onClick={handleAddCollaborator}
                      disabled={collabLoading || !newCollabCode.trim()}
                      className="retro-btn px-3 py-1.5 text-[10px] font-pixel text-cyan-300 border border-cyan-500/50 hover:bg-cyan-500/10 uppercase cursor-pointer disabled:opacity-50"
                    >
                      + THÊM
                    </button>
                  </div>

                  {/* Collaborators list */}
                  <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                    {collaborators.length === 0 ? (
                      <div className="text-[10px] font-mono text-slate-600 text-center py-2">
                        Chưa có thành viên nào trong danh sách.
                      </div>
                    ) : (
                      collaborators.map((c) => (
                        <div
                          key={c.id}
                          className="flex items-center justify-between bg-[#111826] px-2.5 py-1.5 border border-[#1f2d42] text-xs font-mono"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-cyan-300 font-bold">#{c.accountCode.toUpperCase()}</span>
                            <span className="text-[9px] px-1 py-0.2 border border-slate-700 text-slate-400">
                              {c.permission === "view" ? "XEM" : "SỬA"}
                            </span>
                          </div>
                          <button
                            onClick={() => handleRemoveCollaborator(c.accountCode)}
                            className="text-slate-500 hover:text-rose-400 text-[10px] font-pixel cursor-pointer"
                          >
                            XÓA
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}

            <div className="border-t border-[#1a2236] pt-3 flex justify-end">
              <button
                onClick={() => setShowShareModal(false)}
                className="retro-btn px-4 py-1.5 text-[10px] font-pixel text-slate-300 cursor-pointer"
              >
                ĐÓNG
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
