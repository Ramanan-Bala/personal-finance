"use client";

import { cn } from "@/shared/utils/tailwind-merger";
import { Button, Popover } from "@radix-ui/themes";
import { format, startOfDay } from "date-fns";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import * as React from "react";
import { DayPicker } from "react-day-picker";

// Import styles for react-day-picker
import "react-day-picker/dist/style.css";

interface DatePickerProps {
  onChange: (date: Date) => void;
  selected?: Date;
  className?: string;
  disabled?: (date: Date) => boolean;
}

export function DatePicker({
  selected,
  onChange,
  className,
  disabled,
}: DatePickerProps) {
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(
    selected,
  );
  const [open, setOpen] = React.useState(false);

  const defaultDisabled = (date: Date) => date > new Date();

  const handleSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      onChange(startOfDay(date));
      setOpen(false);
    }
  };

  return (
    <div className={cn("inline-block", className)}>
      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Trigger>
          <Button
            variant="outline"
            color="gray"
            className="justify-start w-full"
          >
            <div className="flex items-center gap-3">
              <CalendarIcon className="h-4 w-4" />
              {selectedDate ? (
                <span className="text-foreground font-semibold">
                  {format(selectedDate, "MMM dd, y")}
                </span>
              ) : (
                <span className="text-muted-foreground">Select date</span>
              )}
            </div>
          </Button>
        </Popover.Trigger>
        <Popover.Content
          onInteractOutside={() => setOpen(false)}
          align="start"
          sideOffset={8}
          className="p-0 border-none bg-transparent"
          style={{ minWidth: "max-content" }}
          maxWidth="250px"
        >
          <div className="flex flex-col sm:flex-row border border-border shadow-xl rounded-lg max-w-max overflow-hidden bg-(--color-panel-solid) text-foreground">
            <div className="p-3">
              <DayPicker
                mode="single"
                showOutsideDays
                selected={selectedDate}
                onSelect={handleSelect}
                disabled={disabled || defaultDisabled}
                classNames={{
                  months:
                    "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                  month: "space-y-4",
                  month_caption:
                    "flex justify-center pt-1 relative items-center mb-4",
                  caption_label: "text-sm font-semibold",
                  nav: "flex items-center justify-between absolute w-full px-1 z-20",
                  button_previous:
                    "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 transition-opacity disabled:opacity-20",
                  button_next:
                    "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 transition-opacity disabled:opacity-20",
                  month_grid: "w-full border-collapse",
                  weekdays: "flex mb-2",
                  weekday:
                    "text-muted-foreground rounded-lg w-8 font-normal text-[0.8rem]",
                  weeks: "w-full",
                  week: "flex w-full mt-2",
                  day: "h-8 w-8 text-center text-sm p-0 relative rounded-lg focus-within:relative focus-within:z-20",
                  day_button: cn(
                    "h-8 w-8 p-0 font-normal transition-all cursor-pointer flex items-center justify-center",
                  ),
                  selected: "bg-primary/70 text-foreground opacity-100",
                  today: "border border-primary/30 font-bold day-today",
                  outside: "text-muted-foreground opacity-30",
                  disabled: "text-muted-foreground opacity-20",
                  hidden: "invisible",
                }}
                components={{
                  Chevron: ({ orientation }) => {
                    if (orientation === "left")
                      return <ChevronLeft className="h-4 w-4" />;
                    return <ChevronRight className="h-4 w-4" />;
                  },
                }}
              />
            </div>
          </div>
        </Popover.Content>
      </Popover.Root>
    </div>
  );
}
