"use client";

import { useMediaQuery } from "@/shared/hooks/use-media-query";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Button, Dialog, Flex } from "@radix-ui/themes";
import { X } from "lucide-react";

interface ResponsiveModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  title: string;
  description?: string;
  maxWidth?: string;
  trigger?: React.ReactNode;
}

export function ResponsiveModal({
  open,
  onOpenChange,
  children,
  title,
  description,
  maxWidth = "450px",
  trigger,
}: ResponsiveModalProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const portalContainer =
    typeof document !== "undefined"
      ? ((document.querySelector(".radix-themes") as HTMLElement | null) ??
        undefined)
      : undefined;

  if (isDesktop === undefined) return null;

  if (isDesktop) {
    return (
      <Dialog.Root open={open} onOpenChange={onOpenChange}>
        {trigger && <Dialog.Trigger>{trigger}</Dialog.Trigger>}
        <Dialog.Content maxWidth={maxWidth}>
          <Flex direction="column" justify="between" mb="4">
            <Flex justify="between">
              <Dialog.Title mb="0">{title}</Dialog.Title>
              <Dialog.Close>
                <Button variant="ghost" color="gray">
                  <X size={18} />
                </Button>
              </Dialog.Close>
            </Flex>
            {description && (
              <Dialog.Description size="2">{description}</Dialog.Description>
            )}
          </Flex>
          {children}
        </Dialog.Content>
      </Dialog.Root>
    );
  }

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      {trigger && (
        <DialogPrimitive.Trigger asChild>{trigger}</DialogPrimitive.Trigger>
      )}
      <DialogPrimitive.Portal container={portalContainer ?? undefined}>
        <DialogPrimitive.Overlay className="dialog-sheet-overlay fixed inset-0 bg-black/40 z-50" />
        <DialogPrimitive.Content
          className="dialog-sheet-content fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl bg-card border-t border-border max-h-[calc(var(--app-vh,100dvh)-max(env(safe-area-inset-top),0.5rem))] flex flex-col outline-none overflow-hidden"
          onOpenAutoFocus={(event) => event.preventDefault()}
        >
          <div className="mx-auto mt-3 mb-2 h-1.5 w-12 rounded-full bg-muted-foreground/30" />
          <div className="px-4 pb-2">
            <DialogPrimitive.Title className="text-lg font-semibold text-foreground">
              {title}
            </DialogPrimitive.Title>
            {description && (
              <DialogPrimitive.Description className="text-sm text-muted-foreground">
                {description}
              </DialogPrimitive.Description>
            )}
          </div>
          <DialogPrimitive.Close asChild>
            <button
              type="button"
              aria-label="Close"
              className="absolute top-3 right-3 inline-flex items-center justify-center rounded-md p-1 text-muted-foreground hover:text-foreground"
            >
              <X size={18} />
            </button>
          </DialogPrimitive.Close>
          <div className="px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] overflow-y-auto flex-1">
            {children}
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
