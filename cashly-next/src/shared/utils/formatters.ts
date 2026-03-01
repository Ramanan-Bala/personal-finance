"use client";

import { useAuth } from "@/shared";
import { format } from "date-fns";
import { useCallback } from "react";

export function useFormatter() {
  const { user } = useAuth();

  // Defaults based on requirements
  const currency = user?.currency || "INR";
  const dateFormat = user?.dateFormat || "MM-DD-YYYY";
  const timezone =
    user?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

  /**
   * Format a numerical amount as currency.
   */
  const formatCurrency = useCallback(
    (amount: number | string) => {
      const numericAmount =
        typeof amount === "string" ? parseFloat(amount) : amount;

      const localeMap: Record<string, string> = {
        INR: "en-IN",
        USD: "en-US",
        EUR: "de-DE",
        GBP: "en-GB",
      };

      const locale = localeMap[currency] || "en-IN";

      try {
        return new Intl.NumberFormat(locale, {
          style: "currency",
          currency: currency,
          minimumFractionDigits: 0,
        }).format(numericAmount);
      } catch (err) {
        // Fallback for unsupported currencies
        return `${currency} ${numericAmount.toLocaleString()}`;
      }
    },
    [currency],
  );

  /**
   * Format a date string or object based on user preference.
   */
  const formatDate = useCallback(
    (date: Date | string | number) => {
      if (!date) return "";
      const d = new Date(date);
      if (isNaN(d.getTime())) return "";

      try {
        const zonedDate = new Date(
          d.toLocaleString("en-US", { timeZone: timezone }),
        );
        return format(zonedDate, dateFormat);
      } catch (err) {
        // Fallback if the dateFormat string is invalid
        return format(d, "MM/dd/yyyy");
      }
    },
    [dateFormat, timezone],
  );

  return {
    formatCurrency,
    formatDate,
    userCurrency: currency,
    userDateFormat: dateFormat,
    userTimezone: timezone,
  };
}
