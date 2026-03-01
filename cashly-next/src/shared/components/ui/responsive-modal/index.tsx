"use client";

import { useMediaQuery } from "@/shared";
import * as Dialog from "@radix-ui/react-dialog";
import {
  AnimatePresence,
  type Easing,
  motion,
  useDragControls,
  type Variants,
} from "framer-motion";
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

const easeIn: Easing = "easeIn";
const easeOut: Easing = "easeOut";

const overlayVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const mobileVariants: Variants = {
  hidden: { y: "100%", opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", damping: 30, stiffness: 300 },
  },
  exit: {
    y: "100%",
    opacity: 0,
    transition: { duration: 0.2, ease: easeIn },
  },
};

const desktopVariants: Variants = {
  hidden: { scale: 0.95, opacity: 0, y: 10 },
  visible: {
    scale: 1,
    opacity: 1,
    y: 0,
    transition: { type: "spring", damping: 30, stiffness: 300 },
  },
  exit: {
    scale: 0.95,
    opacity: 0,
    y: 10,
    transition: { duration: 0.15, ease: easeIn },
  },
};

const backgroundVariants: Variants = {
  hidden: { scale: 1, filter: "brightness(1)" },
  visible: {
    scale: 0.95,
    filter: "brightness(0.6)",
    transition: { duration: 0.3, ease: easeOut },
  },
  exit: {
    scale: 1,
    filter: "brightness(1)",
    transition: { duration: 0.2, ease: easeIn },
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
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const dragControls = useDragControls();

  const preventClose = (e: Event) => e.preventDefault();

  const portalContainer =
    typeof document !== "undefined"
      ? ((document.querySelector(".radix-themes") as HTMLElement | null) ??
        undefined)
      : undefined;

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

            {/* Background zoom out */}
            <motion.div
              className="pointer-events-none fixed inset-0 z-0"
              variants={backgroundVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              style={{ transformOrigin: "center center" }}
            />

            {/* Single Dialog.Content — layout switches based on isMobile */}
            <Dialog.Content
              forceMount
              onInteractOutside={preventClose}
              onEscapeKeyDown={preventClose}
              onPointerDownOutside={preventClose}
              onFocusOutside={preventClose}
              className={
                isDesktop
                  ? "fixed top-1/2 left-1/2 z-50 w-full -translate-x-1/2 -translate-y-1/2 outline-none"
                  : "fixed inset-0 z-50 outline-none"
              }
              style={isDesktop ? { maxWidth } : {}}
            >
              {!isDesktop ? (
                // Mobile layout — slides from bottom
                <motion.div
                  className="fixed inset-0 flex flex-col bg-(--color-panel-solid) px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))]"
                  variants={mobileVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  drag="y"
                  dragControls={dragControls}
                  dragConstraints={{ top: 0, bottom: 0 }}
                  dragElastic={{ top: 0.05, bottom: 0.2 }}
                  dragSnapToOrigin
                >
                  {/* Drag handle */}
                  <div
                    className="mb-3 flex shrink-0 cursor-grab justify-center active:cursor-grabbing"
                    onPointerDown={(e) => dragControls.start(e)}
                  >
                    <div className="h-1 w-10 rounded-full bg-(--gray-a6)" />
                  </div>

                  <div className="mb-4 flex shrink-0 items-center justify-between">
                    <Dialog.Title className="text-lg font-semibold">
                      {title}
                    </Dialog.Title>
                    <Dialog.Close asChild>
                      <button
                        className="rounded-md p-1.5 text-(--gray-11) transition-colors hover:bg-(--gray-a3) hover:text-(--gray-12)"
                        aria-label="Close"
                      >
                        <X size={18} />
                      </button>
                    </Dialog.Close>
                  </div>

                  {description && (
                    <Dialog.Description className="mb-4 shrink-0 text-sm text-(--gray-11)">
                      {description}
                    </Dialog.Description>
                  )}

                  <div className="flex-1 overflow-y-auto">{children}</div>
                </motion.div>
              ) : (
                // Desktop layout — centered zoom in
                <motion.div
                  className="flex max-h-[85dvh] w-full flex-col rounded-xl bg-(--color-panel-solid) p-6 shadow-xl"
                  variants={desktopVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <div className="mb-4 flex shrink-0 items-center justify-between">
                    <Dialog.Title className="text-lg font-semibold">
                      {title}
                    </Dialog.Title>
                    <Dialog.Close asChild>
                      <button
                        className="rounded-md p-1.5 text-(--gray-11) transition-colors hover:bg-(--gray-a3) hover:text-(--gray-12)"
                        aria-label="Close"
                      >
                        <X size={18} />
                      </button>
                    </Dialog.Close>
                  </div>

                  {description && (
                    <Dialog.Description className="mb-4 shrink-0 text-sm text-(--gray-11)">
                      {description}
                    </Dialog.Description>
                  )}

                  <div className="flex-1 overflow-y-auto">{children}</div>
                </motion.div>
              )}
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
