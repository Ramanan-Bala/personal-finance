"use client";

import { useAuth } from "@/shared";
import { IconButton } from "@radix-ui/themes";
import {
  ArrowUpRight,
  Building2,
  CreditCard,
  PiggyBank,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();
  const amountInfo = [
    {
      icon: <Wallet />,
      percent: 12,
      amount: "₹1,27,300",
      type: "Total Balance",
    },
    {
      icon: <TrendingUp />,
      percent: 12,
      amount: "₹90,300",
      type: "Monthly Income",
    },
    {
      icon: <TrendingDown />,
      percent: 12,
      amount: "₹42,900",
      type: "Monthly Expenses",
    },
    {
      icon: <PiggyBank />,
      percent: 12,
      amount: "₹37,700",
      type: "Net Savings",
    },
  ];

  const accountInfo = [
    {
      icon: <Wallet />,
      color: "green",
      percent: 12,
      amount: "₹1,27,300",
      type: "Cash",
    },
    {
      icon: <PiggyBank />,
      color: "blue",
      percent: 12,
      amount: "₹90,300",
      type: "Savings",
    },
    {
      icon: <CreditCard />,
      color: "plum",
      percent: 12,
      amount: "₹42,900",
      type: "Credit Card",
    },
    {
      icon: <Building2 />,
      color: "amber",
      percent: 12,
      amount: "₹37,700",
      type: "Business",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-semibold">
          Good morning, {user?.name}! 👋
        </h1>
        <p className="text-muted-foreground">
          {"Here's your financial overview"}
        </p>
      </div>

      {/* Amount Info */}
      <div className="flex gap-3">
        {amountInfo.map((item, i) => {
          return (
            <div
              key={i}
              className="border border-border bg-card p-4 rounded-lg space-y-6 flex-1"
            >
              <div className="flex justify-between items-center">
                <IconButton size="3" variant="soft">
                  {item.icon}
                </IconButton>
                <div className="flex items-center gap-1 mt-2 text-green-400 font-medium text-xs">
                  <ArrowUpRight className="h-4 w-4" />
                  {item.percent}%
                </div>
              </div>
              <div>
                <h3>{item.amount}</h3>
                <h6 className="text-muted-foreground">{item.type}</h6>
              </div>
            </div>
          );
        })}
      </div>

      {/* Your Accounts */}
      <div className="space-y-3">
        <h3>Your Accounts</h3>
        <div className="flex gap-3">
          {accountInfo.map((item, i) => {
            return (
              <div
                key={i}
                className="border border-border bg-card p-4 rounded-lg space-y-2 flex-1 flex flex-col"
              >
                <IconButton size="3" color={item.color as never}>
                  {item.icon}
                </IconButton>
                <span className="text-sm text-muted-foreground font-medium">
                  {item.type}
                </span>
                <h3>{item.amount}</h3>
                <div className="flex items-center gap-1 mt-2 text-green-400 font-medium text-xs">
                  <ArrowUpRight className="h-4 w-4" />
                  {item.percent}%{" "}
                  <span className="text-muted-foreground">this month</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
