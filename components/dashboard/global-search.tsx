"use client";

import { useMemo, useState, type ComponentType } from "react";
import { createPortal } from "react-dom";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Building2,
  CalendarClock,
  Search,
  Stethoscope,
  User,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppointmentsRange } from "@/hooks/use-appointments";
import { usePatients } from "@/hooks/use-patients";
import { useStaff } from "@/hooks/use-staff";
import { useDepartments } from "@/hooks/use-departments";
import {
  addDays,
  matchesSearch as matchesAppointment,
  STATUS_META,
  toDateKey,
} from "@/lib/appointment-utils";
import { matchesSearch as matchesPatient } from "@/lib/patient-utils";
import { matchesSearch as matchesStaff } from "@/lib/staff-utils";
import {
  DEPT_STATUS_META,
  matchesSearch as matchesDepartment,
} from "@/lib/department-utils";
import { formatShortDate, formatTime } from "@/lib/format";
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover";

const MAX_PER_GROUP = 5;

interface ResultItem {
  key: string;
  title: string;
  subtitle: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
}

interface ResultGroup {
  key: string;
  label: string;
  items: ResultItem[];
}

// Writes to ?q= on the current route so any list page can read the same
// param (patients/staff/departments already do). Isolated behind its own
// Suspense boundary so useSearchParams only bails the search box (not the
// whole header) out of static prerendering.
export function GlobalSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const basePath = pathname.startsWith("/w") ? "/w" : "/d";

  const [value, setValue] = useState(() => searchParams.get("q") ?? "");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  // `open` only ever flips true from client-side event handlers (typing,
  // focus), never during the initial render, so `document` is always
  // available by the time this portal actually mounts — no hydration guard
  // needed.
  const today = toDateKey(new Date());
  const { data: appointments = [] } = useAppointmentsRange(
    addDays(today, -30),
    addDays(today, 30),
  );
  const { data: patients = [] } = usePatients();
  const { data: staff = [] } = useStaff();
  const { data: departments = [] } = useDepartments();

  const query = value.trim();
  const hasQuery = query.length > 0;

  const groups = useMemo<ResultGroup[]>(() => {
    if (!hasQuery) return [];

    const appointmentItems: ResultItem[] = appointments
      .filter((a) => matchesAppointment(a, query))
      .slice(0, MAX_PER_GROUP)
      .map((a) => ({
        key: `apt-${a.id}`,
        title: a.patientName,
        subtitle: `${formatShortDate(a.scheduledAt)} · ${formatTime(a.scheduledAt)} · ${STATUS_META[a.status].label} · ${a.doctorName}`,
        href: `${basePath}/appointments?date=${toDateKey(new Date(a.scheduledAt))}`,
        icon: CalendarClock,
      }));

    const patientItems: ResultItem[] = patients
      .filter((p) => matchesPatient(p, query))
      .slice(0, MAX_PER_GROUP)
      .map((p) => ({
        key: `pat-${p.id}`,
        title: p.name,
        subtitle: `${p.patientNumber} · ${p.phone}`,
        href: `${basePath}/patients/${p.id}`,
        icon: User,
      }));

    const staffItems: ResultItem[] = staff
      .filter((s) => matchesStaff(s, query))
      .slice(0, MAX_PER_GROUP)
      .map((s) => ({
        key: `staff-${s.id}`,
        title: s.name,
        subtitle: `${s.title} · ${s.departmentName}`,
        href: `/d/staff/${s.id}`,
        icon: Stethoscope,
      }));

    const departmentItems: ResultItem[] = departments
      .filter((d) => matchesDepartment(d, query))
      .slice(0, MAX_PER_GROUP)
      .map((d) => ({
        key: `dept-${d.id}`,
        title: d.name,
        subtitle: `${d.code} · ${DEPT_STATUS_META[d.status].label}`,
        href: `/d/departments?dept=${d.id}`,
        icon: Building2,
      }));

    return [
      { key: "appointments", label: "Appointments", items: appointmentItems },
      { key: "patients", label: "Patients", items: patientItems },
      { key: "staff", label: "Staff", items: staffItems },
      { key: "departments", label: "Departments", items: departmentItems },
    ].filter((g) => g.items.length > 0);
  }, [hasQuery, query, appointments, patients, staff, departments, basePath]);

  const flatResults = useMemo(() => groups.flatMap((g) => g.items), [groups]);

  const writeQueryParam = (next: string) => {
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

  const handleChange = (next: string) => {
    setValue(next);
    setActiveIndex(-1);
    writeQueryParam(next);
    setOpen(next.trim().length > 0);
  };

  const handleClear = () => {
    setValue("");
    setActiveIndex(-1);
    writeQueryParam("");
    setOpen(false);
  };

  const selectResult = (item: ResultItem) => {
    setOpen(false);
    router.push(item.href);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!open) {
        if (hasQuery) setOpen(true);
        return;
      }
      if (flatResults.length === 0) return;
      setActiveIndex((i) => (i + 1) % flatResults.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!open || flatResults.length === 0) return;
      setActiveIndex((i) => (i - 1 + flatResults.length) % flatResults.length);
    } else if (e.key === "Enter") {
      if (!open || flatResults.length === 0) return;
      e.preventDefault();
      const target = activeIndex >= 0 ? flatResults[activeIndex] : flatResults[0];
      if (target) selectResult(target);
    } else if (e.key === "Escape") {
      if (open) {
        e.preventDefault();
        setOpen(false);
      }
    }
  };

  let runningIndex = -1;

  return (
    <div className="relative">
      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="fixed inset-0 z-40 bg-black/20"
            onClick={() => setOpen(false)}
          />,
          document.body,
        )}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverAnchor asChild>
          <div className="relative z-50 flex items-center gap-2 rounded-full border border-border bg-surface-subtle px-3.5 py-2">
            <Search className="size-4 shrink-0 text-fg-placeholder" />
            <input
              value={value}
              onChange={(e) => handleChange(e.target.value)}
              onFocus={() => {
                if (hasQuery) setOpen(true);
              }}
              onKeyDown={handleKeyDown}
              placeholder="Search appointments, patients, staff, departments…"
              role="combobox"
              aria-expanded={open}
              aria-controls="global-search-listbox"
              aria-activedescendant={
                activeIndex >= 0 ? `global-search-option-${activeIndex}` : undefined
              }
              className="w-56 bg-transparent text-sm text-fg outline-none placeholder:text-fg-placeholder md:w-72"
            />
            {value && (
              <button
                type="button"
                onClick={handleClear}
                aria-label="Clear search"
                className="shrink-0 rounded-full p-0.5 text-fg-placeholder hover:bg-surface-muted hover:text-fg"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
        </PopoverAnchor>

        <PopoverContent
          id="global-search-listbox"
          role="listbox"
          align="end"
          sideOffset={8}
          onOpenAutoFocus={(e) => e.preventDefault()}
          onCloseAutoFocus={(e) => e.preventDefault()}
          className="z-50 max-h-[60vh] w-[420px] max-w-[90vw] overflow-y-auto p-1.5"
        >
          {flatResults.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-fg-muted">
              No results for &ldquo;{query}&rdquo;.
            </p>
          ) : (
            groups.map((group) => (
              <div key={group.key}>
                <div className="px-2.5 pt-2 pb-1 text-[11px] font-bold uppercase tracking-wide text-fg-placeholder">
                  {group.label}
                </div>
                {group.items.map((item) => {
                  runningIndex += 1;
                  const flatIndex = runningIndex;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.key}
                      id={`global-search-option-${flatIndex}`}
                      role="option"
                      aria-selected={flatIndex === activeIndex}
                      type="button"
                      onMouseEnter={() => setActiveIndex(flatIndex)}
                      onClick={() => selectResult(item)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left text-sm transition-colors",
                        flatIndex === activeIndex
                          ? "bg-surface-muted text-fg"
                          : "text-fg-secondary hover:bg-surface-muted hover:text-fg",
                      )}
                    >
                      <Icon className="size-4 shrink-0 text-fg-muted" />
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-medium text-fg">
                          {item.title}
                        </div>
                        <div className="truncate text-xs text-fg-muted">
                          {item.subtitle}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}

export function GlobalSearchFallback() {
  return (
    <div className="flex items-center gap-2 rounded-full border border-border bg-surface-subtle px-3.5 py-2">
      <Search className="size-4 text-fg-placeholder" />
      <span className="w-56 text-sm text-fg-placeholder md:w-72">
        Search appointments, patients, staff, departments…
      </span>
    </div>
  );
}
