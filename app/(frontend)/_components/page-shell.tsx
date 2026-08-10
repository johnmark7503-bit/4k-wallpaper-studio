import type { ReactNode } from "react";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <main className="innerPage" id="top">
      <a className="skipLink" href="#main-content">Skip to content</a>
      <SiteHeader />
      {children}
      <SiteFooter />
    </main>
  );
}

export function PageHero({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <section className="pageHero" id="main-content">
      <p className="eyebrow"><span className="eyebrowDot" /> {eyebrow}</p>
      <h1>{title}</h1>
      <p>{description}</p>
      {children}
    </section>
  );
}
