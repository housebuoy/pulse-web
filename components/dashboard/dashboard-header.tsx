"use client";

import { Suspense, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { formatLongDate } from "@/lib/format";
import { NotificationsPanel } from "@/components/dashboard/notifications/notifications-panel";
import { HelpMenu } from "@/components/dashboard/notifications/help-menu";

// Writes to ?q= on the current route so any list page can read the same
// param. Isolated behind its own Suspense boundary so useSearchParams only
// bails the search box (not the whole header) out of static prerendering.
function HeaderSearchBox() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(() => searchParams.get("q") ?? "");

  const handleChange = (next: string) => {
    setValue(next);
    const params = new URLSearchParams(searchParams.toString());
    if (next) {
      params.set("q", next);
    } else {
      params.delete("q");
    }
    router.replace(`${pathname}${params.toString() ? `?${params}` : ""}`, {
      scroll: false,
    });
  };

  return (
    <div className="flex items-center gap-2 rounded-full border border-border bg-surface-subtle px-3.5 py-2">
      <Search className="size-4 text-fg-placeholder" />
      <input
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Search…"
        className="w-40 bg-transparent text-sm text-fg outline-none placeholder:text-fg-placeholder"
      />
    </div>
  );
}

function HeaderSearchFallback() {
  return (
    <div className="flex items-center gap-2 rounded-full border border-border bg-surface-subtle px-3.5 py-2">
      <Search className="size-4 text-fg-placeholder" />
      <span className="w-40 text-sm text-fg-placeholder">Search…</span>
    </div>
  );
}

export function DashboardHeader({ title }: { title: string }) {
  return (
    <header className="flex items-center justify-between border-b border-border bg-surface px-8 py-4 print:hidden">
      <div className="flex flex-col gap-0.5">
        <h1 className="text-2xl font-bold tracking-tight text-fg">{title}</h1>
        <p className="text-[13px] text-fg-muted">{formatLongDate(new Date())}</p>
      </div>

      <div className="flex items-center gap-3">
        <Suspense fallback={<HeaderSearchFallback />}>
          <HeaderSearchBox />
        </Suspense>
        <NotificationsPanel />
        <HelpMenu />
      </div>
    </header>
  );
}
