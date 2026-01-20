"use client";

import { useToastStore } from "@/lib/store/toast-store";
import { CircleAlert, CircleCheck, CircleX } from "lucide-react";
import { AnimatePresence } from "motion/react";
import { Toast, ToastDescription, ToastProvider, ToastViewport } from "./toast";

export function Toaster() {
  const { toasts, removeToast } = useToastStore();

  return (
    <ToastProvider swipeDirection="right">
      <AnimatePresence>
        {toasts.map(function ({ id, title, description, type, ...props }) {
          return (
            <Toast
              key={id}
              {...props}
              variant={
                type === "error"
                  ? "destructive"
                  : type === "success"
                  ? "success"
                  : "default"
              }
              onOpenChange={(open) => {
                if (!open) {
                  removeToast(id);
                }
              }}
            >
              <div className="flex justify-between items-center">
                <div className="flex gap-2 items-center">
                  {title && type === "error" && (
                    <CircleX className="h-4.5 text-red-500" />
                  )}
                  {title && type === "success" && (
                    <CircleCheck className="h-4.5 text-green-500" />
                  )}
                  {title && type === "warning" && (
                    <CircleAlert className="h-4.5 text-yellow-500" />
                  )}
                  {description && (
                    <ToastDescription>{description}</ToastDescription>
                  )}
                </div>
                {/* <ToastClose /> */}
              </div>
            </Toast>
          );
        })}
      </AnimatePresence>
      <ToastViewport />
    </ToastProvider>
  );
}
