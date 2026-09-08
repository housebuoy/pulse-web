// One viewer for both public legal documents:
//   /legal?doc=privacy   /legal?doc=terms
//
// One screen rather than two routes because the documents differ only in
// content — same chrome, same styling, same switcher — and the content
// itself lives in lib/content/legal.ts so this file stays presentation.
// An unknown or missing ?doc= falls back to the privacy policy rather than
// 404ing, which also makes a bare /legal link (the footer's Trust Center)
// land somewhere sensible.
//
// Server component: no state, no effects, and searchParams is a Promise in
// this version of Next, so it is awaited here rather than read through
// useSearchParams in a client component with a Suspense boundary.

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";

import { LEGAL_DOCUMENTS, LEGAL_DOC_ORDER, resolveLegalDoc } from "@/lib/content/legal";
import { formatShortDate } from "@/lib/format";
import { cn } from "@/lib/utils";

interface LegalPageProps {
  searchParams: Promise<{ doc?: string | string[] }>;
}

export async function generateMetadata({
  searchParams,
}: LegalPageProps): Promise<Metadata> {
  const doc = resolveLegalDoc((await searchParams).doc);
  return { title: `${doc.title} — Pulse Health`, description: doc.summary };
}

export default async function LegalPage({ searchParams }: LegalPageProps) {
  const doc = resolveLegalDoc((await searchParams).doc);

  return (
    <div className="mx-auto w-full max-w-2xl">
      <Link
        href="/login"
        className="flex w-fit items-center gap-2 text-body-sm text-fg-muted transition-colors hover:text-fg-secondary"
      >
        <ArrowLeft className="h-4 w-4" /> Back to sign in
      </Link>

      <div className="mt-10">
        <h2 className="text-h1 text-fg">{doc.title}</h2>
        <p className="mt-3 text-body text-fg-muted">{doc.summary}</p>
        <p className="mt-4 text-caption uppercase tracking-wide text-fg-placeholder">
          Last updated {formatShortDate(doc.lastUpdated)}
        </p>
      </div>

      {/* Document switcher — the two documents are peers, so each is always
          one click away rather than requiring a trip back to the footer. */}
      <nav className="mt-8 flex gap-2 border-b border-border pb-4">
        {LEGAL_DOC_ORDER.map((slug) => {
          const isCurrent = slug === doc.slug;
          return (
            <Link
              key={slug}
              href={`/legal?doc=${slug}`}
              aria-current={isCurrent ? "page" : undefined}
              className={cn(
                "rounded-full px-4 py-1.5 text-body-sm transition-colors",
                isCurrent
                  ? "bg-brand text-white"
                  : "text-fg-muted hover:bg-surface-muted hover:text-fg-secondary",
              )}
            >
              {LEGAL_DOCUMENTS[slug].title}
            </Link>
          );
        })}
      </nav>

      <article className="mt-10 space-y-10 pb-4">
        {doc.sections.map((section, i) => (
          <section key={section.heading} className="space-y-3">
            <h3 className="text-h2 text-fg">
              <span className="mr-2 text-fg-placeholder">{i + 1}.</span>
              {section.heading}
            </h3>

            {section.body?.map((paragraph) => (
              <p key={paragraph} className="text-body text-fg-secondary">
                {paragraph}
              </p>
            ))}

            {section.bullets && (
              <ul className="space-y-2 pt-1">
                {section.bullets.map((bullet) => (
                  <li
                    key={bullet}
                    className="flex gap-3 text-body text-fg-secondary"
                  >
                    <span
                      aria-hidden
                      className="mt-2.5 size-1.5 shrink-0 rounded-full bg-fg-placeholder"
                    />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </article>

      <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-border pt-6 text-body-sm text-fg-muted">
        <span>
          Questions about this document?{" "}
          <Link href="/support" className="text-brand hover:underline">
            Contact support
          </Link>
        </span>
      </div>
    </div>
  );
}
