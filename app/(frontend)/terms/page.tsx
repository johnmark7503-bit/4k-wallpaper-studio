import type { Metadata } from "next";
import { LegalPage } from "../_components/legal-page";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "Terms for using 4K Wallpaper Studio wallpapers, tools and content.",
};

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Use"
      intro="By using 4K Wallpaper Studio, you agree to these terms. If you do not agree, please do not use the website or its downloads."
      sections={[
        {
          heading: "Permitted use",
          content: <p>Unless a download page states otherwise, free wallpapers are for personal, non-commercial use on devices you own or control. You may crop or resize them for that purpose.</p>,
        },
        {
          heading: "Restricted use",
          content: <p>You may not resell, redistribute, upload as a competing wallpaper collection, claim authorship, remove ownership notices, use automated scraping to copy the library or use content in an unlawful or harmful way.</p>,
        },
        {
          heading: "Paid products and affiliate links",
          content: <p>Digital packs may include a separate license shown before purchase. Affiliate links may earn the studio a commission at no extra cost to you. Third-party purchases are also governed by the provider’s terms.</p>,
        },
        {
          heading: "Availability",
          content: <p>We may update, remove or change content and features. Access can be limited when necessary for maintenance, security, legal compliance or misuse prevention.</p>,
        },
        {
          heading: "Liability",
          content: <p>The service is provided on an “as available” basis. To the extent permitted by law, 4K Wallpaper Studio is not liable for indirect losses arising from use of the site, downloads or third-party services.</p>,
        },
      ]}
    />
  );
}
