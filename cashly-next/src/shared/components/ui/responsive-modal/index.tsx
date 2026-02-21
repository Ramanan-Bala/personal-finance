"use client";

import { useMediaQuery } from "@/shared/hooks/use-media-query";
import { Button, Dialog, Flex } from "@radix-ui/themes";
import { X } from "lucide-react";
import { useEffect, useRef } from "react";
import { Drawer } from "vaul";

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
  const portalRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    portalRef.current = document.querySelector(".radix-themes");
  }, []);

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
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      {trigger && <Drawer.Trigger asChild>{trigger}</Drawer.Trigger>}
      <Drawer.Portal container={portalRef.current}>
        <Drawer.Overlay className="fixed inset-0 bg-black/40 z-50" />
        <Drawer.Content className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl bg-card border-t border-border max-h-[90dvh] flex flex-col">
          <div className="mx-auto mt-3 mb-2 h-1.5 w-12 rounded-full bg-muted-foreground/30" />
          <div className="px-4 pb-2">
            <Drawer.Title className="text-lg font-semibold text-foreground">
              {title}
            </Drawer.Title>
            {description && (
              <Drawer.Description className="text-sm text-muted-foreground">
                {description}
              </Drawer.Description>
            )}
          </div>
          <div className="px-4 pb-6 overflow-y-auto flex-1">{children}</div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
