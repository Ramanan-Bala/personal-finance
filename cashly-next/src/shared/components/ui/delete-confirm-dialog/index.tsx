"use client";

import { useMediaQuery } from "@/shared/hooks/use-media-query";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { AnimatePresence, motion } from "motion/react";
import { Trash2 } from "lucide-react";
import { ReactNode, useEffect, useRef, useState } from "react";
import { Drawer } from "vaul";

interface DeleteConfirmDialogProps {
  onConfirm: () => void | Promise<void>;
  title?: string;
  description?: string;
  trigger?: ReactNode;
  confirmText?: string;
  isLoading?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function DeleteConfirmDialog({
  onConfirm,
  title = "Delete Transaction",
  description = "Are you sure you want to delete this transaction? This action cannot be undone.",
  trigger,
  confirmText = "Delete",
  isLoading = false,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: DeleteConfirmDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled
    ? (v: boolean) => controlledOnOpenChange?.(v)
    : setInternalOpen;
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const portalRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    portalRef.current = document.querySelector(".radix-themes");
  }, []);

  const defaultTrigger = (
    <motion.button
      className="inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      style={{
        backgroundColor: "rgba(239, 68, 68, 0.1)",
        color: "#ef4444",
      }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Trash2 size={16} />
    </motion.button>
  );

  if (isDesktop === undefined) {
    return isControlled ? null : trigger || defaultTrigger;
  }

  if (isDesktop) {
    return (
      <AlertDialog.Root open={open} onOpenChange={setOpen}>
        {!isControlled && (
          <AlertDialog.Trigger asChild>
            {trigger || defaultTrigger}
          </AlertDialog.Trigger>
        )}

        <AnimatePresence>
          {open && (
            <AlertDialog.Portal forceMount>
              <AlertDialog.Overlay forceMount asChild>
                <motion.div
                  className="fixed inset-0 z-50 bg-black/50"
                  style={{ backdropFilter: "blur(2px)" }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                />
              </AlertDialog.Overlay>

              <AlertDialog.Content forceMount asChild>
                <motion.div
                  className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg rounded-lg border p-6 shadow-2xl bg-card border-border"
                  style={{ x: "-50%", y: "-50%" }}
                  initial={{ opacity: 0, scale: 0.9, y: "-45%" }}
                  animate={{ opacity: 1, scale: 1, y: "-50%" }}
                  exit={{ opacity: 0, scale: 0.9, y: "-45%" }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                      <AlertDialog.Title className="text-lg font-semibold text-foreground">
                        {title}
                      </AlertDialog.Title>
                      <AlertDialog.Description className="text-sm leading-relaxed text-muted-foreground">
                        {description}
                      </AlertDialog.Description>
                    </div>
                    <div className="flex justify-end gap-2">
                      <AlertDialog.Cancel asChild>
                        <button
                          disabled={isLoading}
                          className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 bg-muted text-foreground"
                        >
                          Cancel
                        </button>
                      </AlertDialog.Cancel>
                      <AlertDialog.Action asChild>
                        <button
                          onClick={onConfirm}
                          disabled={isLoading}
                          className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors disabled:opacity-50 bg-red-500"
                        >
                          {isLoading ? "Deleting..." : confirmText}
                        </button>
                      </AlertDialog.Action>
                    </div>
                  </div>
                </motion.div>
              </AlertDialog.Content>
            </AlertDialog.Portal>
          )}
        </AnimatePresence>
      </AlertDialog.Root>
    );
  }

  return (
    <>
      {!isControlled && (
        <span onClick={() => setOpen(true)}>{trigger || defaultTrigger}</span>
      )}
      <Drawer.Root open={open} onOpenChange={setOpen}>
        <Drawer.Portal container={portalRef.current}>
          <Drawer.Overlay className="fixed inset-0 bg-black/40 z-50" />
          <Drawer.Content className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl bg-card border-t border-border flex flex-col">
            <div className="mx-auto mt-3 mb-2 h-1.5 w-12 rounded-full bg-muted-foreground/30" />
            <div className="px-4 pb-6 flex flex-col gap-4">
              <div>
                <Drawer.Title className="text-lg font-semibold text-foreground">
                  {title}
                </Drawer.Title>
                <Drawer.Description className="text-sm text-muted-foreground mt-1">
                  {description}
                </Drawer.Description>
              </div>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => {
                    onConfirm();
                    setOpen(false);
                  }}
                  disabled={isLoading}
                  className="w-full rounded-lg px-4 py-3 text-sm font-medium text-white transition-colors disabled:opacity-50 bg-red-500"
                >
                  {isLoading ? "Deleting..." : confirmText}
                </button>
                <button
                  onClick={() => setOpen(false)}
                  disabled={isLoading}
                  className="w-full rounded-lg px-4 py-3 text-sm font-medium transition-colors disabled:opacity-50 bg-muted text-foreground"
                >
                  Cancel
                </button>
              </div>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </>
  );
}
