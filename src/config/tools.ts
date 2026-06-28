import {
  Combine,
  Crop,
  FileImage,
  FileText,
  FormInput,
  Hash,
  Image,
  Lock,
  LockOpen,
  Minimize2,
  PenLine,
  RotateCw,
  ScanText,
  Scissors,
  Shuffle,
  Stamp,
  type LucideIcon,
} from "lucide-react";

export type ToolCategory =
  | "Organize"
  | "Convert"
  | "Edit"
  | "Security";

export type ToolStatus = "live" | "coming-soon";

export type ToolDefinition = {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  category: ToolCategory;
  status: ToolStatus;
  requiresServer?: boolean;
  hidden?: boolean;
};

export const TOOL_CATEGORIES: ToolCategory[] = [
  "Organize",
  "Convert",
  "Edit",
  "Security",
];

export const TOOLS: ToolDefinition[] = [
  {
    id: "merge",
    title: "Merge PDF",
    description: "Combine multiple PDFs into one document.",
    href: "/merge",
    icon: Combine,
    category: "Organize",
    status: "live",
  },
  {
    id: "split",
    title: "Split PDF",
    description: "Extract pages by range or selection.",
    href: "/split",
    icon: Scissors,
    category: "Organize",
    status: "live",
  },
  {
    id: "rotate",
    title: "Rotate PDF",
    description: "Rotate pages individually or all at once.",
    href: "/rotate",
    icon: RotateCw,
    category: "Organize",
    status: "live",
  },
  {
    id: "delete-reorder",
    title: "Delete & Reorder",
    description: "Remove pages and drag to reorder.",
    href: "/delete-reorder",
    icon: Shuffle,
    category: "Organize",
    status: "coming-soon",
  },
  {
    id: "jpg-to-pdf",
    title: "Images to PDF",
    description: "Convert JPG and PNG images into a PDF.",
    href: "/jpg-to-pdf",
    icon: Image,
    category: "Convert",
    status: "live",
  },
  {
    id: "pdf-to-jpg",
    title: "PDF to Images",
    description: "Export each PDF page as a PNG image.",
    href: "/pdf-to-jpg",
    icon: FileImage,
    category: "Convert",
    status: "live",
  },
  {
    id: "pdf-to-word",
    title: "PDF to Word",
    description: "Convert PDF documents to editable Word files.",
    href: "/pdf-to-word",
    icon: FileText,
    category: "Convert",
    status: "coming-soon",
    requiresServer: true,
  },
  {
    id: "ocr",
    title: "OCR",
    description: "Recognize text in scanned PDFs.",
    href: "/ocr",
    icon: ScanText,
    category: "Convert",
    status: "coming-soon",
    requiresServer: true,
  },
  {
    id: "edit-pdf",
    title: "Edit PDF",
    description: "Add text, draw, and place shapes on your PDF.",
    href: "/edit-pdf",
    icon: PenLine,
    category: "Edit",
    status: "live",
  },
  {
    id: "watermark",
    title: "Add Watermark",
    description: "Stamp text watermarks with custom opacity.",
    href: "/watermark",
    icon: Stamp,
    category: "Edit",
    status: "live",
  },
  {
    id: "page-numbers",
    title: "Page Numbers",
    description: "Add formatted page numbers to your PDF.",
    href: "/page-numbers",
    icon: Hash,
    category: "Edit",
    status: "live",
  },
  {
    id: "crop",
    title: "Crop PDF",
    description: "Trim margins from every page.",
    href: "/crop",
    icon: Crop,
    category: "Edit",
    status: "live",
  },
  {
    id: "pdf-forms",
    title: "PDF Forms",
    description: "Fill in text fields, checkboxes, and dropdowns.",
    href: "/pdf-forms",
    icon: FormInput,
    category: "Edit",
    status: "live",
  },
  {
    id: "compress",
    title: "Compress PDF",
    description: "Reduce file size by re-encoding images.",
    href: "/compress",
    icon: Minimize2,
    category: "Edit",
    status: "live",
    requiresServer: true,
    hidden: true,
  },
  {
    id: "protect",
    title: "Protect PDF",
    description: "Add a password to restrict access.",
    href: "/protect",
    icon: Lock,
    category: "Security",
    status: "coming-soon",
  },
  {
    id: "unlock",
    title: "Unlock PDF",
    description: "Remove password protection from a PDF.",
    href: "/unlock",
    icon: LockOpen,
    category: "Security",
    status: "coming-soon",
  },
];

export function isToolVisible(tool: ToolDefinition): boolean {
  return !tool.hidden;
}

export function getVisibleTools(): ToolDefinition[] {
  return TOOLS.filter(isToolVisible);
}

export function getToolsByCategory(category: ToolCategory): ToolDefinition[] {
  return getVisibleTools().filter((tool) => tool.category === category);
}

export function getToolByHref(href: string): ToolDefinition | undefined {
  return TOOLS.find((tool) => tool.href === href);
}
