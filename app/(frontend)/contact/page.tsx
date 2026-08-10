import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "../_components/icons";
import { PageHero, PageShell } from "../_components/page-shell";

export const metadata: Metadata = { title: "Contact", description: "Contact routes for support, copyright, licensing and advertising." };

export default function ContactPage() {
  return (
    <PageShell>
      <PageHero eyebrow="Contact hub" title="Choose the right contact route" description="Use the dedicated route below so requests reach the right workflow when the final studio inbox is connected." />
      <section className="contentShell contactGrid">
        <article><span>Support</span><h2>Wallpaper or tool issue</h2><p>Include the page link, device type and a short description of what happened.</p><Link className="textLink" href="/tools">Check tools <Icon name="arrow" size={17} /></Link></article>
        <article><span>Rights</span><h2>Copyright or removal request</h2><p>Use the documented notice process and include enough information to identify the work.</p><Link className="textLink" href="/dmca">Open DMCA process <Icon name="arrow" size={17} /></Link></article>
        <article><span>Business</span><h2>Advertising or partnerships</h2><p>Review the available placement types and the information needed for a media request.</p><Link className="textLink" href="/advertise">Advertising options <Icon name="arrow" size={17} /></Link></article>
      </section>
    </PageShell>
  );
}
