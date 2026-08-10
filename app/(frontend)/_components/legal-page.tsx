import type { ReactNode } from "react";
import { PageShell } from "./page-shell";

type LegalSection = {
  heading: string;
  content: ReactNode;
};

export function LegalPage({
  title,
  intro,
  sections,
}: {
  title: string;
  intro: string;
  sections: LegalSection[];
}) {
  return (
    <PageShell>
      <article className="legalPage" id="main-content">
        <p className="eyebrow">Last updated · August 2, 2026</p>
        <h1>{title}</h1>
        <p className="legalIntro">{intro}</p>
        {sections.map((section) => (
          <section key={section.heading}>
            <h2>{section.heading}</h2>
            <div>{section.content}</div>
          </section>
        ))}
      </article>
    </PageShell>
  );
}
