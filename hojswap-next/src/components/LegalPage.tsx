import type { ReactNode } from "react";

type LegalSection = {
  title: string;
  content: ReactNode;
};

export function LegalPage({
  eyebrow,
  title,
  summary,
  effectiveDate,
  sections,
}: {
  eyebrow: string;
  title: string;
  summary: string;
  effectiveDate: string;
  sections: LegalSection[];
}) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
      <header className="mb-10 border-b border-white/10 pb-8">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-[rgba(212,175,55,0.72)]">
          {eyebrow}
        </p>
        <h1 className="hoj-display text-3xl font-semibold text-[rgba(226,190,72,0.98)] sm:text-4xl">
          {title}
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-white/65">{summary}</p>
        <p className="mt-4 text-sm text-white/40">Effective date: {effectiveDate}</p>
      </header>

      <div className="space-y-5">
        {sections.map((section, index) => (
          <section key={section.title} className="hoj-panel rounded-2xl p-5 sm:p-7">
            <h2 className="hoj-display mb-3 text-lg font-semibold text-[rgba(226,190,72,0.9)]">
              {index + 1}. {section.title}
            </h2>
            <div className="space-y-3 text-sm leading-7 text-white/65 [&_a]:text-[rgba(226,190,72,0.9)] [&_a]:underline [&_li]:ml-5 [&_li]:list-disc [&_strong]:font-semibold [&_strong]:text-white/85">
              {section.content}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
