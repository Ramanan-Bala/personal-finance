"use client";

import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { AnimatePresence, motion } from "framer-motion";
import { Trash2 } from "lucide-react";
import { ReactNode, useState } from "react";

interface DeleteConfirmDialogProps {
  onConfirm: () => void | Promise<void>;
  title?: string;
  description?: string;
  trigger?: ReactNode;
  confirmText?: string;
  isLoading?: boolean;
}

export function DeleteConfirmDialog({
  onConfirm,
  title = "Delete Transaction",
  description = "Are you sure you want to delete this transaction? This action cannot be undone.",
  trigger,
  confirmText = "Delete",
  isLoading = false,
}: DeleteConfirmDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <AlertDialog.Root open={open} onOpenChange={setOpen}>
      <AlertDialog.Trigger asChild>
        {trigger || (
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
        )}
      </AlertDialog.Trigger>

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
                className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg rounded-lg border p-6 shadow-2xl"
                style={{
                  borderColor: "var(--color-border)",
                  backgroundColor: "var(--color-card)",
                  x: "-50%",
                  y: "-50%",
                }}
                initial={{ opacity: 0, scale: 0.9, y: "-45%" }}
                animate={{ opacity: 1, scale: 1, y: "-50%" }}
                exit={{ opacity: 0, scale: 0.9, y: "-45%" }}
                transition={{
                  duration: 0.2,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                <motion.div
                  className="flex flex-col gap-4"
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: {
                      opacity: 1,
                      transition: {
                        staggerChildren: 0.05,
                        delayChildren: 0.1,
                      },
                    },
                  }}
                >
                  <motion.div
                    className="flex flex-col gap-2"
                    variants={{
                      hidden: { opacity: 0, y: -10 },
                      visible: { opacity: 1, y: 0 },
                    }}
                  >
                    <AlertDialog.Title
                      className="text-lg font-semibold"
                      style={{ color: "var(--color-foreground)" }}
                    >
                      {title}
                    </AlertDialog.Title>

                    <AlertDialog.Description
                      className="text-sm leading-relaxed"
                      style={{ color: "var(--color-muted-foreground)" }}
                    >
                      {description}
                    </AlertDialog.Description>
                  </motion.div>

                  <motion.div
                    className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"
                    variants={{
                      hidden: { opacity: 0, y: 10 },
                      visible: { opacity: 1, y: 0 },
                    }}
                  >
                    <AlertDialog.Cancel asChild>
                      <motion.button
                        disabled={isLoading}
                        className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{
                          backgroundColor: "var(--color-muted)",
                          color: "var(--color-foreground)",
                        }}
                        whileHover={{ scale: 1.02, y: -1 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 17,
                        }}
                      >
                        Cancel
                      </motion.button>
                    </AlertDialog.Cancel>

                    <AlertDialog.Action asChild>
                      <motion.button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{
                          backgroundColor: "#ef4444",
                        }}
                        whileHover={{
                          scale: isLoading ? 1 : 1.02,
                          y: isLoading ? 0 : -1,
                        }}
                        whileTap={{ scale: isLoading ? 1 : 0.98 }}
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 17,
                        }}
                      >
                        {isLoading ? (
                          <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                          >
                            Deleting...
                          </motion.span>
                        ) : (
                          confirmText
                        )}
                      </motion.button>
                    </AlertDialog.Action>
                  </motion.div>
                </motion.div>
              </motion.div>
            </AlertDialog.Content>
          </AlertDialog.Portal>
        )}
      </AnimatePresence>
    </AlertDialog.Root>
  );
}
