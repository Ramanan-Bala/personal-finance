"use client";

import { Button } from "@radix-ui/themes";
import { format } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface MonthNavigatorProps {
  currentMonth: Date;
  onPrev: () => void;
  onNext: () => void;
}

export function MonthNavigator({
  currentMonth,
  onPrev,
  onNext,
}: MonthNavigatorProps) {
  return (
    <div className="bg-card border-border flex w-full items-center justify-between gap-1 rounded-lg border px-3 py-2">
      <Button variant="ghost" className="h-6 w-4" onClick={onPrev}>
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <span className="text-foreground w-36 px-3 text-center text-sm font-medium">
        {format(currentMonth, "MMMM yyyy")}
      </span>
      <Button variant="ghost" className="h-6 w-4" onClick={onNext}>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
