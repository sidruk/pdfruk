import {
  Combine,
  FileImage,
  FileText,
  Hash,
  Image,
  Lock,
  LockOpen,
  Minimize2,
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
    status: "coming-soon",
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
    status: "coming-soon",
  },
  {
    id: "pdf-to-jpg",
    title: "PDF to Images",
    description: "Export each PDF page as a PNG image.",
    href: "/pdf-to-jpg",
    icon: FileImage,
    category: "Convert",
    status: "coming-soon",
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
    id: "watermark",
    title: "Add Watermark",
    description: "Stamp text watermarks with custom opacity.",
    href: "/watermark",
    icon: Stamp,
    category: "Edit",
    status: "coming-soon",
  },
  {
    id: "page-numbers",
    title: "Page Numbers",
    description: "Add formatted page numbers to your PDF.",
    href: "/page-numbers",
    icon: Hash,
    category: "Edit",
    status: "coming-soon",
  },
  {
    id: "compress",
    title: "Compress PDF",
    description: "Reduce file size by re-encoding images.",
    href: "/compress",
    icon: Minimize2,
    category: "Edit",
    status: "coming-soon",
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

export function getToolsByCategory(category: ToolCategory): ToolDefinition[] {
  return TOOLS.filter((tool) => tool.category === category);
}

export function getToolByHref(href: string): ToolDefinition | undefined {
  return TOOLS.find((tool) => tool.href === href);
}
