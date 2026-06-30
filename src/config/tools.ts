import {
  Combine,
  Crop,
  FileImage,
  FileInput,
  FileType2,
  FormInput,
  Hash,
  Image,
  Lock,
  LockOpen,
  Minimize2,
  PenLine,
  RotateCw,
  Scissors,
  ScanText,
  Shuffle,
  Signature,
  Stamp,
  type LucideIcon,
} from "lucide-react";

export type ToolCategory =
  | "Organize"
  | "Convert"
  | "Edit"
  | "Security";

export type ToolStatus = "live" | "coming-soon";

export type ToolSeo = {
  title: string;
  description: string;
  keywords: string[];
};

export type ToolDefinition = {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  category: ToolCategory;
  status: ToolStatus;
  seo: ToolSeo;
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
    seo: {
      title: "Safe PDF Merge — Combine Without Uploading, Private & Free",
      description:
      "Safely merge PDF files in your browser — no upload, no signup. Combine and reorder locally so your files never leave your device. Free, private, secure.",
      keywords: [
        "safe merge pdf",
        "merge pdf without uploading",
        "private pdf merger",
        "secure pdf merger",
        "merge pdf in browser",
      ],
    },
  },
  {
    id: "split",
    title: "Split PDF",
    description: "Extract pages by range or selection.",
    href: "/split",
    icon: Scissors,
    category: "Organize",
    status: "live",
    seo: {
      title: "Split PDF Safely — Extract Pages Without Uploading",
      description:
        "Split a PDF into separate files by page range or selection — no upload, no signup. All processing happens locally so your files never leave your device. Free.",
      keywords: [
        "split pdf without uploading",
        "extract pdf pages",
        "private pdf splitter",
        "split pdf in browser",
        "separate pdf pages",
      ],
    },
  },
  {
    id: "rotate",
    title: "Rotate PDF",
    description: "Rotate pages individually or all at once.",
    href: "/rotate",
    icon: RotateCw,
    category: "Organize",
    status: "live",
    seo: {
      title: "Rotate PDF Safely — Turn PDF Pages Without Uploading",
      description:
        "Rotate PDF pages 90°, 180°, or 270° individually or all at once. Free online tool with no file uploads — your PDF stays on your device.",
      keywords: [
        "rotate pdf",
        "rotate pdf pages",
        "rotate pdf without uploading",
        "turn pdf pages",
        "private pdf rotator",
      ],
    },
  },
  {
    id: "delete-reorder",
    title: "Delete & Reorder",
    description: "Remove pages and drag to reorder.",
    href: "/delete-reorder",
    icon: Shuffle,
    category: "Organize",
    status: "live",
    seo: {
      title: "Delete & Reorder PDF Pages — No Upload Needed",
      description:
        "Remove unwanted PDF pages and drag to reorder the rest — no upload, no signup. Organize your document in seconds, all in your browser. Free and private.",
      keywords: [
        "delete pdf pages",
        "reorder pdf pages",
        "remove pdf pages",
        "organize pdf pages",
      ],
    },
  },
  {
    id: "jpg-to-pdf",
    title: "Images to PDF",
    description: "Convert JPG and PNG images into a PDF.",
    href: "/jpg-to-pdf",
    icon: Image,
    category: "Convert",
    status: "live",
    seo: {
      title: "Images to PDF — Convert JPG & PNG to PDF Free",
      description:
        "Convert JPG and PNG images into a single PDF online for free. Reorder images before export. No upload — conversion runs in your browser.",
      keywords: [
        "jpg to pdf",
        "png to pdf",
        "images to pdf",
        "picture to pdf",
        "convert images to pdf free",
      ],
    },
  },
  {
    id: "pdf-to-jpg",
    title: "PDF to Images",
    description: "Export each PDF page as a PNG image.",
    href: "/pdf-to-jpg",
    icon: FileImage,
    category: "Convert",
    status: "live",
    seo: {
      title: "PDF to JPG — Convert PDF Pages to PNG Free",
      description:
        "Export every page of a PDF as a high-quality PNG image. Free PDF to image converter that works entirely in your browser — no account needed.",
      keywords: [
        "pdf to jpg",
        "pdf to png",
        "pdf to image",
        "convert pdf to pictures",
        "pdf to image converter free",
      ],
    },
  },
  {
    id: "edit-pdf",
    title: "Edit PDF",
    description: "Add text, draw, and place shapes on your PDF.",
    href: "/edit-pdf",
    icon: PenLine,
    category: "Edit",
    status: "live",
    seo: {
      title: "Edit PDF Online Free — Add Text, Draw & Annotate",
      description:
        "Edit PDFs online for free. Add text, draw, highlight, and place shapes on any page. Private browser-based editor — your files never leave your device.",
      keywords: [
        "edit pdf online",
        "pdf editor free",
        "annotate pdf",
        "add text to pdf",
        "pdf markup tool",
      ],
    },
  },
  {
    id: "sign-pdf",
    title: "Sign PDF",
    description: "Draw, type, or upload your signature on any page.",
    href: "/sign-pdf",
    icon: Signature,
    category: "Edit",
    status: "live",
    seo: {
      title: "Sign PDF Online Free — Draw or Type Your Signature",
      description:
        "Sign PDF documents online for free. Draw, type, or upload your signature and place it on any page. No upload to servers — sign locally in your browser.",
      keywords: [
        "sign pdf online",
        "pdf signature",
        "electronic signature pdf",
        "sign pdf free",
        "add signature to pdf",
      ],
    },
  },
  {
    id: "watermark",
    title: "Add Watermark",
    description: "Stamp text watermarks with custom opacity.",
    href: "/watermark",
    icon: Stamp,
    category: "Edit",
    status: "live",
    seo: {
      title: "Add Watermark to PDF Online Free",
      description:
        "Stamp text watermarks on your PDF with custom opacity and placement. Free watermark tool that runs locally — keep confidential documents private.",
      keywords: [
        "watermark pdf",
        "add watermark to pdf",
        "pdf watermark online",
        "stamp pdf",
      ],
    },
  },
  {
    id: "page-numbers",
    title: "Page Numbers",
    description: "Add formatted page numbers to your PDF.",
    href: "/page-numbers",
    icon: Hash,
    category: "Edit",
    status: "live",
    seo: {
      title: "Add Page Numbers to PDF Online Free",
      description:
        "Add formatted page numbers to every page of your PDF. Choose position and style, then download instantly. Free and browser-based.",
      keywords: [
        "add page numbers to pdf",
        "pdf page numbering",
        "number pdf pages",
        "page numbers pdf online",
      ],
    },
  },
  {
    id: "crop",
    title: "Crop PDF",
    description: "Trim margins from every page.",
    href: "/crop",
    icon: Crop,
    category: "Edit",
    status: "live",
    seo: {
      title: "Crop PDF Online Free — Trim Margins & Pages",
      description:
        "Crop PDF pages to remove margins or unwanted areas. Apply the same crop to every page. Free, private, and runs entirely in your browser.",
      keywords: [
        "crop pdf",
        "trim pdf margins",
        "pdf crop tool",
        "crop pdf online free",
      ],
    },
  },
  {
    id: "pdf-forms",
    title: "PDF Forms",
    description: "Fill in text fields, checkboxes, and dropdowns.",
    href: "/pdf-forms",
    icon: FormInput,
    category: "Edit",
    status: "live",
    seo: {
      title: "Fill PDF Forms Online Free",
      description:
        "Fill in PDF form fields, checkboxes, and dropdowns online for free. Complete forms in your browser without uploading sensitive data.",
      keywords: [
        "fill pdf form",
        "pdf form filler",
        "complete pdf online",
        "fillable pdf online free",
      ],
    },
  },
  {
    id: "compress",
    title: "Compress PDF",
    description: "Reduce file size by re-encoding images.",
    href: "/compress",
    icon: Minimize2,
    category: "Edit",
    status: "coming-soon",
    requiresServer: true,
    seo: {
      title: "Compress PDF Online — Reduce PDF File Size Free",
      description:
        "Reduce PDF file size by re-encoding images. Free PDF compressor with quality presets. Smaller files for email and sharing.",
      keywords: [
        "compress pdf",
        "reduce pdf size",
        "pdf compressor",
        "shrink pdf file",
      ],
    },
  },
  {
    id: "ocr",
    title: "OCR PDF",
    description: "Extract searchable text from scanned PDF pages.",
    href: "/ocr",
    icon: ScanText,
    category: "Convert",
    status: "coming-soon",
    seo: {
      title: "OCR PDF Online — Extract Text from Scanned PDFs",
      description:
        "Turn scanned PDF pages into searchable text with OCR. Coming soon to pdfruk.",
      keywords: ["ocr pdf", "pdf text recognition", "scanned pdf to text"],
    },
  },
  {
    id: "pdf-to-word",
    title: "PDF to Word",
    description: "Convert PDF documents to editable Word files.",
    href: "/pdf-to-word",
    icon: FileType2,
    category: "Convert",
    status: "coming-soon",
    seo: {
      title: "PDF to Word Converter Online Free",
      description:
        "Convert PDF files to editable Word documents. Coming soon to pdfruk.",
      keywords: ["pdf to word", "pdf to docx", "convert pdf to word"],
    },
  },
  {
    id: "word-to-pdf",
    title: "Word to PDF",
    description: "Convert Word documents to PDF format.",
    href: "/word-to-pdf",
    icon: FileInput,
    category: "Convert",
    status: "coming-soon",
    seo: {
      title: "Word to PDF Converter Online Free",
      description:
        "Convert Word documents to PDF files. Coming soon to pdfruk.",
      keywords: ["word to pdf", "docx to pdf", "convert word to pdf"],
    },
  },
  {
    id: "protect",
    title: "Protect PDF",
    description: "Add a password to restrict access.",
    href: "/protect",
    icon: Lock,
    category: "Security",
    status: "live",
    seo: {
      title: "Protect PDF with Password Online Free",
      description:
        "Add a password to your PDF to restrict opening, printing, or copying. Secure your documents online — free PDF password protection.",
      keywords: [
        "password protect pdf",
        "encrypt pdf",
        "lock pdf",
        "secure pdf online",
      ],
    },
  },
  {
    id: "unlock",
    title: "Unlock PDF",
    description: "Remove password protection from a PDF.",
    href: "/unlock",
    icon: LockOpen,
    category: "Security",
    status: "live",
    seo: {
      title: "Unlock PDF Online — Remove PDF Password Free",
      description:
        "Remove password protection from a PDF you own. Enter the current password and download an unlocked copy. Free PDF unlock tool.",
      keywords: [
        "unlock pdf",
        "remove pdf password",
        "pdf password remover",
        "decrypt pdf",
      ],
    },
  },
];

export function isToolVisible(tool: ToolDefinition): boolean {
  return !tool.hidden;
}

export function getVisibleTools(): ToolDefinition[] {
  return TOOLS.filter(isToolVisible);
}

export function getLiveTools(): ToolDefinition[] {
  return getVisibleTools().filter((tool) => tool.status === "live");
}

export function getToolsByCategory(category: ToolCategory): ToolDefinition[] {
  return getVisibleTools().filter((tool) => tool.category === category);
}

export function getToolByHref(href: string): ToolDefinition | undefined {
  return TOOLS.find((tool) => tool.href === href);
}

export function getToolById(id: string): ToolDefinition | undefined {
  return TOOLS.find((tool) => tool.id === id);
}
