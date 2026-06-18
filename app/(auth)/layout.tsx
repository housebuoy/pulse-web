import { HelpCircle } from "lucide-react";
import Link from "next/link";

import { BrandPanel } from "@/components/auth/brand-panel";
import { Button } from "@/components/ui/button";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-white">
      <BrandPanel />

      <div className="flex w-full flex-col p-8 lg:w-1/2 lg:p-16 xl:p-16 overflow-y-auto">
        <div className="flex-1">{children}</div>

        <div className="flex items-center justify-between border-t border-border pt-12">
          <div className="flex gap-6 text-eyebrow uppercase text-fg-placeholder">
            <Link href="#" className="transition-colors hover:text-fg-secondary">
              Privacy Policy
            </Link>
            <Link href="#" className="transition-colors hover:text-fg-secondary">
              Trust Center
            </Link>
            <Link href="#" className="transition-colors hover:text-fg-secondary">
              System Status
            </Link>
          </div>
          <Button variant="outline" size="sm" className="gap-2 rounded-full text-fg-secondary">
            <HelpCircle className="h-4 w-4" /> Support
          </Button>
        </div>
      </div>
    </div>
  );
}
