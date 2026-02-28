"use client";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import * as React from "react";

import { cn } from "@/shared";
import { motion } from "motion/react";

// const Tabs = TabsPrimitive.Root;

type TabsProps = React.ComponentPropsWithoutRef<typeof TabsPrimitive.Tabs>;

const Tabs = ({ value: activeValue, ...rest }: TabsProps) => {
  const layoutId = React.useId();
  return (
    <TabsContext.Provider value={{ activeValue, layoutId }}>
      <TabsPrimitive.Root
        value={activeValue}
        {...rest}
        className="relative w-full"
      />
    </TabsContext.Provider>
  );
};

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "flex items-center justify-center rounded-xl bg-card p-1 border border-border w-max",
      className,
    )}
    {...props}
  />
));
TabsList.displayName = TabsPrimitive.List.displayName;

// const TabsTrigger = React.forwardRef<
//   React.ElementRef<typeof TabsPrimitive.Trigger>,
//   React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
// >(({ className, ...props }, ref) => (
//   <TabsPrimitive.Trigger
//     ref={ref}
//     className={cn(
//       "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
//       className,
//     )}
//     {...props}
//   />
// ));
// TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

interface TabsContextValue {
  activeValue?: string;
  layoutId: string;
}

const TabsContext = React.createContext<TabsContextValue | undefined>(
  undefined,
);

const useTabsContext = () => {
  const context = React.useContext(TabsContext);
  if (context === undefined) {
    throw new Error("useTabsContext must be used within a TabsProvider");
  }
  return context;
};

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, children, value, ...props }, ref) => {
  const { activeValue, layoutId } = useTabsContext();

  return (
    <TabsPrimitive.Trigger
      value={value}
      ref={ref}
      className="relative px-3 py-1.5 grow inline-flex justify-center"
      {...props}
    >
      <span
        className={cn(
          "relative z-20 flex items-center gap-2 text-sm font-medium",
          activeValue === value ? "text-bg" : "text-foreground",
        )}
      >
        {children}
      </span>

      {activeValue === value && (
        <motion.div
          layout
          layoutId={layoutId}
          transition={{
            type: "spring",
            duration: 0.3,
            bounce: 0.1,
          }}
          className={cn("absolute inset-0 bg-foreground rounded-lg", className)}
        />
      )}
    </TabsPrimitive.Trigger>
  );
});
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content ref={ref} className={className} {...props} />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsContent, TabsList, TabsTrigger };
