"use client";

import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";

type ProcessButtonProps = {
  onProcess: () => void;
  disabled?: boolean;
  isProcessing?: boolean;
  label?: string;
};

export function ProcessButton({
  onProcess,
  disabled = false,
  isProcessing = false,
  label = "Process",
}: ProcessButtonProps) {
  return (
    <Button
      type="button"
      size="lg"
      className="w-full bg-brand-red text-base hover:bg-brand-red-hover sm:w-auto"
      onClick={onProcess}
      disabled={disabled || isProcessing}
    >
      {isProcessing ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
          Processing...
        </>
      ) : (
        label
      )}
    </Button>
  );
}
