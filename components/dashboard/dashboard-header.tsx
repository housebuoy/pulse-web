"use client";

import { Bell, HelpCircle, Search } from "lucide-react";

const formattedToday = () =>
  new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date());

export function DashboardHeader({ title }: { title: string }) {
  return (
    <header className="flex items-center justify-between border-b border-border bg-surface px-8 py-4">
      <div className="flex flex-col gap-0.5">
        <h1 className="text-2xl font-bold tracking-tight text-fg">{title}</h1>
        <p className="text-[13px] text-fg-muted">{formattedToday()}</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 rounded-full border border-border bg-surface-subtle px-3.5 py-2">
          <Search className="size-4 text-fg-placeholder" />
          <input
            placeholder="Search…"
            className="w-40 bg-transparent text-sm text-fg outline-none placeholder:text-fg-placeholder"
          />
        </div>
        <button className="relative flex size-[38px] items-center justify-center rounded-full border border-border bg-surface-subtle text-fg-secondary hover:bg-surface-muted">
          <Bell className="size-[18px]" />
          <span className="absolute right-2.5 top-2.5 size-1.5 rounded-full bg-danger" />
        </button>
        <button className="flex size-[38px] items-center justify-center rounded-full border border-border bg-surface-subtle text-fg-secondary hover:bg-surface-muted">
          <HelpCircle className="size-[18px]" />
        </button>
      </div>
    </header>
  );
}