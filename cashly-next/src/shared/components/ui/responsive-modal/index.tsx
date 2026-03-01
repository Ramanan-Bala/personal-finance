"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, Easing, motion, Variants } from "framer-motion";
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

// Animation variants
const easeIn: Easing = "easeIn";
const easeOut: Easing = "easeOut";

const overlayVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const contentVariants: Variants = {
  hidden: {
    y: "100%",
    opacity: 0,
  },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      damping: 30,
      stiffness: 300,
    },
  },
  exit: {
    y: "100%",
    opacity: 0,
    transition: {
      duration: 0.2,
      ease: easeIn,
    },
  },
};

const desktopContentVariants: Variants = {
  hidden: {
    scale: 0.95,
    opacity: 0,
    y: 10,
  },
  visible: {
    scale: 1,
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      damping: 30,
      stiffness: 300,
    },
  },
  exit: {
    scale: 0.95,
    opacity: 0,
    y: 10,
    transition: {
      duration: 0.15,
      ease: easeIn,
    },
  },
};

export function ResponsiveModal({
  open,
  onOpenChange,
  children,
  title,
  description,
  maxWidth = "450px",
  trigger,
}: ResponsiveModalProps) {
  // const isDesktop = useMediaQuery("(min-width: 768px)");
  const portalContainer =
    typeof document !== "undefined"
      ? ((document.querySelector(".radix-themes") as HTMLElement | null) ??
        undefined)
      : undefined;

  // if (isDesktop === undefined) return null;

  // if (isDesktop) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      {trigger && <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>}

      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount container={portalContainer}>
            {/* Overlay */}
            <Dialog.Overlay asChild forceMount>
              <motion.div
                className="fixed inset-0 z-40 bg-black/50"
                variants={overlayVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                transition={{ duration: 0.2 }}
              />
            </Dialog.Overlay>

            {/* Mobile: slide from bottom, full screen */}
            <Dialog.Content asChild forceMount>
              <motion.div
                className="
                  fixed bottom-0 z-50 flex flex-col rounded-t-2xl
                  bg-(--color-panel-solid)
                  pt-[max(1rem,env(safe-area-inset-top))]
                  pb-[max(1rem,env(safe-area-inset-bottom))]
                  px-4
                  md:hidden
                "
                variants={contentVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-4 shrink-0">
                  <Dialog.Title className="text-lg font-semibold">
                    {title}
                  </Dialog.Title>
                  <Dialog.Close asChild>
                    <button
                      className="p-1.5 rounded-md text-(--gray-11) hover:text-(--gray-12) hover:bg-(--gray-a3) transition-colors"
                      aria-label="Close"
                    >
                      <X size={18} />
                    </button>
                  </Dialog.Close>
                </div>
                {description && (
                  <Dialog.Description className="text-sm text-(--gray-11) mb-4 shrink-0">
                    {description}
                  </Dialog.Description>
                )}
                {/* Scrollable body */}
                <div className="overflow-y-auto flex-1">{children}</div>
              </motion.div>
            </Dialog.Content>

            {/* Desktop: centered zoom in */}
            <Dialog.Content asChild forceMount>
              <motion.div
                className="
                  hidden md:flex md:flex-col
                  fixed z-50
                  top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                  w-full rounded-xl
                  bg-(--color-panel-solid)
                  p-6
                  max-h-[85dvh]
                  shadow-xl
                "
                style={{ maxWidth }}
                variants={desktopContentVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-4 shrink-0">
                  <Dialog.Title className="text-lg font-semibold">
                    {title}
                  </Dialog.Title>
                  <Dialog.Close asChild>
                    <button
                      className="p-1.5 rounded-md text-(--gray-11) hover:text-(--gray-12) hover:bg-(--gray-a3) transition-colors"
                      aria-label="Close"
                    >
                      <X size={18} />
                    </button>
                  </Dialog.Close>
                </div>
                {description && (
                  <Dialog.Description className="text-sm text-(--gray-11) mb-4 shrink-0">
                    {description}
                  </Dialog.Description>
                )}
                {/* Scrollable body */}
                <div className="overflow-y-auto flex-1">{children}</div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
  // }

  // return (
  //   <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
  //     {trigger && (
  //       <DialogPrimitive.Trigger asChild>{trigger}</DialogPrimitive.Trigger>
  //     )}
  //     <DialogPrimitive.Portal container={portalContainer ?? undefined}>
  //       <DialogPrimitive.Overlay className="dialog-sheet-overlay fixed inset-0 bg-black/40 z-50" />
  //       <DialogPrimitive.Content
  //         className="dialog-sheet-content fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl bg-card border-t border-border max-h-[calc(var(--app-vh,100dvh)-max(env(safe-area-inset-top),0.5rem))] flex flex-col outline-none overflow-hidden"
  //         onOpenAutoFocus={(event) => event.preventDefault()}
  //       >
  //         <div className="mx-auto mt-3 mb-2 h-1.5 w-12 rounded-full bg-muted-foreground/30" />
  //         <div className="px-4 pb-2">
  //           <DialogPrimitive.Title className="text-lg font-semibold text-foreground">
  //             {title}
  //           </DialogPrimitive.Title>
  //           {description && (
  //             <DialogPrimitive.Description className="text-sm text-muted-foreground">
  //               {description}
  //             </DialogPrimitive.Description>
  //           )}
  //         </div>
  //         <DialogPrimitive.Close asChild>
  //           <button
  //             type="button"
  //             aria-label="Close"
  //             className="absolute top-3 right-3 inline-flex items-center justify-center rounded-md p-1 text-muted-foreground hover:text-foreground"
  //           >
  //             <X size={18} />
  //           </button>
  //         </DialogPrimitive.Close>
  //         <div className="px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] overflow-y-auto flex-1">
  //           {children}
  //         </div>
  //       </DialogPrimitive.Content>
  //     </DialogPrimitive.Portal>
  //   </DialogPrimitive.Root>
  // );
}
