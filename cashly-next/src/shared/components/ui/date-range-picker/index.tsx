"use client";

import { cn } from "@/shared/utils/tailwind-merger";
import { Popover } from "@radix-ui/themes";
import {
  endOfDay,
  endOfMonth,
  endOfYear,
  format,
  startOfDay,
  startOfMonth,
  startOfYear,
  subDays,
} from "date-fns";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import * as React from "react";
import { DateRange, DayPicker } from "react-day-picker";

// Import styles for react-day-picker
import "react-day-picker/dist/style.css";

interface DateRangePickerProps {
  value: { from: Date; to: Date };
  onChange: (range: { from: Date; to: Date }) => void;
  className?: string;
}

export function DateRangePicker({
  value,
  onChange,
  className,
}: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false);

  const presets = [
    {
      label: "Today",
      getValue: () => ({
        from: startOfDay(new Date()),
        to: endOfDay(new Date()),
      }),
    },
    {
      label: "Last 7 Days",
      getValue: () => ({
        from: startOfDay(subDays(new Date(), 6)),
        to: endOfDay(new Date()),
      }),
    },
    {
      label: "Last 30 Days",
      getValue: () => ({
        from: startOfDay(subDays(new Date(), 29)),
        to: endOfDay(new Date()),
      }),
    },
    {
      label: "This Month",
      getValue: () => ({
        from: startOfMonth(new Date()),
        to: endOfMonth(new Date()),
      }),
    },
    {
      label: "This Year",
      getValue: () => ({
        from: startOfYear(new Date()),
        to: endOfYear(new Date()),
      }),
    },
  ];

  const handleSelect = (range: DateRange | undefined) => {
    if (range?.from && range?.to) {
      onChange({
        from: startOfDay(range.from),
        to: endOfDay(range.to),
      });
    }
  };

  return (
    <div className={cn("inline-block", className)}>
      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Trigger>
          <button className="border border-border p-2 px-3 rounded-lg bg-card hover:bg-card/60">
            <div className="flex items-center gap-3">
              <CalendarIcon className="h-4 w-4" />
              {value?.from ? (
                value.to ? (
                  <span className="text-foreground font-semibold">
                    {format(value.from, "MMM dd")} -{" "}
                    {format(value.to, "MMM dd, y")}
                  </span>
                ) : (
                  <span className="text-foreground font-semibold">
                    {format(value.from, "MMM dd, y")}
                  </span>
                )
              ) : (
                <span className="text-muted-foreground">Select date range</span>
              )}
            </div>
          </button>
        </Popover.Trigger>
        <Popover.Content
          width="auto"
          align="start"
          sideOffset={8}
          maxWidth="max"
          className="p-0 border-none bg-transparent"
        >
          <div className="flex flex-col sm:flex-row border border-border shadow-xl rounded-lg overflow-hidden bg-card text-foreground">
            {/* <div className="flex flex-col border-b sm:border-b-0 sm:border-r border-border p-2 min-w-40 bg-muted/30">
              <div className="px-3 py-2">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  Presets
                </span>
              </div>
              {presets.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => {
                    const range = preset.getValue();
                    onChange(range);
                    setOpen(false);
                  }}
                  className="flex items-center w-full px-3 py-2 text-sm font-medium rounded-md hover:bg-primary/10 hover:text-primary transition-colors text-left cursor-pointer"
                >
                  {preset.label}
                </button>
              ))}
            </div> */}
            <div className="p-3 day-picker">
              <DayPicker
                mode="range"
                showOutsideDays
                defaultMonth={value?.from}
                selected={{ from: value.from, to: value.to }}
                onSelect={handleSelect}
                numberOfMonths={2}
                disabled={(date) => date > new Date()}
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
                  day: "h-8 w-8 text-center text-sm p-0 relative",
                  day_button: cn(
                    "h-8 w-8 p-0 font-normal transition-all cursor-pointer flex items-center justify-center",
                  ),
                  selected:
                    "bg-primary/70 text-foreground opacity-100 day-selected",
                  range_start: "rounded-l-lg",
                  range_end: "rounded-r-lg",
                  range_middle: "border-none bg-primary/20!",
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
