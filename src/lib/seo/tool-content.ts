export type ToolFaqItem = {
  question: string;
  answer: string;
};

export type ToolSeoContent = {
  directAnswer: string;
  howToTitle: string;
  steps: string[];
  faqs: ToolFaqItem[];
  relatedToolIds: string[];
};

const TOOL_SEO_CONTENT: Partial<Record<string, ToolSeoContent>> = {
  merge: {
    directAnswer:
      "To merge PDFs online for free without uploading files, open pdfruk's merge tool, drop two or more PDF files, drag to reorder them, click Merge PDFs, and download one combined document. Processing runs entirely in your browser — no account required.",
    howToTitle: "How do I merge multiple PDF files into one document?",
    steps: [
      "Open the pdfruk merge PDF tool in Chrome, Firefox, Safari, or Edge.",
      "Drag and drop two or more PDF files into the upload area, or click to choose files from your device.",
      "Drag files in the list to set the order they will appear in the merged document.",
      "Click Merge PDFs, wait a few seconds, then download your combined PDF.",
    ],
    faqs: [
      {
        question: "Is merging PDFs with pdfruk private?",
        answer:
          "Yes. The merge tool runs entirely in your browser. Your PDF files are not uploaded to pdfruk servers — they stay on your device while pages are combined locally.",
      },
      {
        question: "How many PDFs can I merge at once?",
        answer:
          "You can merge as many PDF files as your browser can handle in one session. There is no fixed page limit from pdfruk. Very large files may take longer on older devices.",
      },
      {
        question: "Do I need an account to merge PDFs?",
        answer:
          "No. pdfruk is free and requires no sign-up, email, or login. Open the merge tool, add your files, and download the result.",
      },
      {
        question: "Can I change the order of PDFs before merging?",
        answer:
          "Yes. After adding files, drag them in the list to reorder. The merged PDF will follow the sequence you set before you click Merge PDFs.",
      },
    ],
    relatedToolIds: ["split", "delete-reorder", "rotate"],
  },
};

export function getToolSeoContent(toolId: string): ToolSeoContent | undefined {
  return TOOL_SEO_CONTENT[toolId];
}
