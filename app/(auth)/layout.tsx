import { HelpCircle } from "lucide-react";
import Link from "next/link";

import { BrandPanel } from "@/components/auth/brand-panel";
import { Button } from "@/components/ui/button";

// Footer destinations for every screen in this route group. All four are
// public: someone who cannot sign in is exactly the person who needs the
// support and status pages.
//
// Trust Center points at the bare legal viewer — /legal with no ?doc=
// falls back to the privacy policy and shows the switcher, so it lands on
// the document set rather than a dead end. (The task left this one open;
// the alternative was pointing it at /status.)
const FOOTER_LINKS = [
  { label: "Privacy Policy", href: "/legal?doc=privacy" },
  { label: "Terms", href: "/legal?doc=terms" },
  { label: "Trust Center", href: "/legal" },
  { label: "System Status", href: "/status" },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-white">
      <BrandPanel />

      <div className="flex w-full flex-col p-8 lg:w-1/2 lg:p-16 xl:p-16 overflow-y-auto">
        <div className="flex-1">{children}</div>

        <div className="flex items-center justify-between gap-4 border-t border-border pt-12">
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-eyebrow uppercase text-fg-placeholder">
            {FOOTER_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="transition-colors hover:text-fg-secondary"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <Button
            asChild
            variant="outline"
            size="sm"
            className="shrink-0 gap-2 rounded-full text-fg-secondary"
          >
            <Link href="/support">
              <HelpCircle className="h-4 w-4" /> Support
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
