"use client";

import { useState } from "react";
import {
  BookOpen,
  Bug,
  ExternalLink,
  HelpCircle,
  Keyboard,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { KeyboardShortcutsDialog } from "./keyboard-shortcuts-dialog";

const APP_VERSION = "0.1.0"; // mirrors package.json; swap for process.env later

export function HelpMenu() {
  const [shortcutsOpen, setShortcutsOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label="Help and support"
            className="flex size-[38px] items-center justify-center rounded-full border border-border bg-surface-subtle text-fg-secondary transition-colors hover:bg-surface-muted"
          >
            <HelpCircle className="size-[18px]" />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" sideOffset={8} className="w-52">
          <DropdownMenuItem asChild>
            <a
              href="https://docs.pulsehealth.test"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2"
            >
              <BookOpen className="size-4" />
              Help center
              <ExternalLink className="ml-auto size-3 text-fg-muted" />
            </a>
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => setShortcutsOpen(true)}>
            <Keyboard className="size-4" />
            Keyboard shortcuts
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem asChild>
            <a
              href="mailto:support@pulsehealth.test?subject=Support+request"
              className="flex items-center gap-2"
            >
              <MessageSquare className="size-4" />
              Contact support
            </a>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <a
              href="https://pulsehealth.test/changelog"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2"
            >
              <Sparkles className="size-4" />
              What&apos;s new
              <ExternalLink className="ml-auto size-3 text-fg-muted" />
            </a>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <a
              href="https://pulsehealth.test/report"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2"
            >
              <Bug className="size-4" />
              Report a problem
              <ExternalLink className="ml-auto size-3 text-fg-muted" />
            </a>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {/* Version — informational only */}
          <div className="px-2.5 py-1.5 text-[11px] text-fg-placeholder">
            Pulse Health v{APP_VERSION}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      <KeyboardShortcutsDialog
        open={shortcutsOpen}
        onOpenChange={setShortcutsOpen}
      />
    </>
  );
}
