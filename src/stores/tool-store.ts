import { create } from "zustand";

import type { PdfFile, ProcessProgress, ProcessResult } from "@/types/pdf";

type ToolStoreState = {
  files: PdfFile[];
  isProcessing: boolean;
  progress: ProcessProgress | null;
  result: ProcessResult | null;
  error: string | null;
  setFiles: (files: PdfFile[]) => void;
  addFiles: (files: PdfFile[]) => void;
  removeFile: (id: string) => void;
  reorderFiles: (fromIndex: number, toIndex: number) => void;
  setIsProcessing: (value: boolean) => void;
  setProgress: (progress: ProcessProgress | null) => void;
  setResult: (result: ProcessResult | null) => void;
  setError: (error: string | null) => void;
  reset: () => void;
};

const initialState = {
  files: [] as PdfFile[],
  isProcessing: false,
  progress: null as ProcessProgress | null,
  result: null as ProcessResult | null,
  error: null as string | null,
};

export const useToolStore = create<ToolStoreState>((set) => ({
  ...initialState,
  setFiles: (files) => set({ files }),
  addFiles: (files) =>
    set((state) => ({ files: [...state.files, ...files] })),
  removeFile: (id) =>
    set((state) => ({
      files: state.files.filter((file) => file.id !== id),
    })),
  reorderFiles: (fromIndex, toIndex) =>
    set((state) => {
      const next = [...state.files];
      const [moved] = next.splice(fromIndex, 1);
      if (!moved) return state;
      next.splice(toIndex, 0, moved);
      return { files: next };
    }),
  setIsProcessing: (isProcessing) => set({ isProcessing }),
  setProgress: (progress) => set({ progress }),
  setResult: (result) => set({ result }),
  setError: (error) => set({ error }),
  reset: () => set(initialState),
}));
