"use client";

import { Button } from "@radix-ui/themes";
import { Plus } from "lucide-react";

interface FloatingAddButtonProps {
  onClick: () => void;
}

export function FloatingAddButton({ onClick }: FloatingAddButtonProps) {
  return (
    <Button
      onClick={onClick}
      className="floating-add-btn fixed right-[max(env(safe-area-inset-right),2rem)] z-50 h-10 w-10 rounded-full sm:hidden"
      style={{
        bottom: "max(calc(env(safe-area-inset-bottom) + 4rem), 5rem)",
      }}
    >
      <Plus size={18} />
    </Button>
  );
}
