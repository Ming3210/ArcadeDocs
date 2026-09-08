declare module "lucide-react" {
  import * as React from "react";
  export interface LucideProps extends React.SVGProps<SVGSVGElement> {
    size?: string | number;
    color?: string;
    strokeWidth?: string | number;
  }
  export type LucideIcon = React.ForwardRefExoticComponent<
    LucideProps & React.RefAttributes<SVGSVGElement>
  >;

  export const Bold: LucideIcon;
  export const Italic: LucideIcon;
  export const Underline: LucideIcon;
  export const Strikethrough: LucideIcon;
  export const Code: LucideIcon;
  export const Heading1: LucideIcon;
  export const Heading2: LucideIcon;
  export const Heading3: LucideIcon;
  export const List: LucideIcon;
  export const ListOrdered: LucideIcon;
  export const Quote: LucideIcon;
  export const Minus: LucideIcon;
  export const Image: LucideIcon;
  export const Undo2: LucideIcon;
  export const Redo2: LucideIcon;
  export const Loader2: LucideIcon;
  export const Share2: LucideIcon;
  export const Check: LucideIcon;
  export const FileText: LucideIcon;
  export const Sparkles: LucideIcon;
  export const FilePlus2: LucideIcon;
  export const ArrowRight: LucideIcon;
  export const Users: LucideIcon;
  export const Cloud: LucideIcon;
  export const Zap: LucideIcon;
  export const ShieldCheck: LucideIcon;
  export const AlignLeft: LucideIcon;
  export const AlignCenter: LucideIcon;
  export const AlignRight: LucideIcon;
  export const AlignJustify: LucideIcon;
  export const Trash2: LucideIcon;
  export const Pencil: LucideIcon;
  export const ArrowLeft: LucideIcon;
  export const Terminal: LucideIcon;
  export const MousePointer: LucideIcon;
  export const Hand: LucideIcon;
  export const ZoomIn: LucideIcon;
  export const ZoomOut: LucideIcon;
  export const RotateCcw: LucideIcon;
  export const Plus: LucideIcon;
  export const Maximize2: LucideIcon;
  export const StickyNote: LucideIcon;
  export const Table: LucideIcon;
  export const Grid: LucideIcon;
  export const Copy: LucideIcon;
  export const FileDown: LucideIcon;
  export const Scissors: LucideIcon;
  export const Link2: LucideIcon;
  export const ArrowDown: LucideIcon;
  export const Printer: LucideIcon;
  export const Baseline: LucideIcon;
  export const Highlighter: LucideIcon;
  export const Unlink: LucideIcon;
  export const MessageSquarePlus: LucideIcon;
  export const ListTodo: LucideIcon;
  export const Indent: LucideIcon;
  export const Outdent: LucideIcon;
  export const RemoveFormatting: LucideIcon;
  export const ChevronDown: LucideIcon;
  export const X: LucideIcon;
  export const Split: LucideIcon;

  const icons: { [key: string]: LucideIcon };
  export default icons;
}
