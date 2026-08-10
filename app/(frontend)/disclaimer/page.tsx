import type { Metadata } from "next";
import { LegalPage } from "../_components/legal-page";

export const metadata: Metadata = {
  title: "Disclaimer",
  description: "Content, advertising and affiliate disclosure for 4K Wallpaper Studio.",
};

export default function DisclaimerPage() {
  return (
    <LegalPage
      title="Disclaimer"
      intro="4K Wallpaper Studio publishes original visual content, practical screen guides and links to selected third-party products and services."
      sections={[
        {
          heading: "General information",
          content: <p>Articles and tools are provided for general informational and creative purposes. Results can vary by device, display settings, operating system and third-party software.</p>,
        },
        {
          heading: "Advertising",
          content: <p>The website may display advertisements. Advertisers are responsible for their claims, products, availability and privacy practices. An advertisement does not automatically mean we endorse every statement it contains.</p>,
        },
        {
          heading: "Affiliate disclosure",
          content: <p>Some links may be affiliate links. If you complete a qualifying purchase, the studio may receive a commission at no additional cost to you. Recommendations are selected for relevance, but you should evaluate suitability before buying.</p>,
        },
        {
          heading: "External links",
          content: <p>External websites are outside our control. We are not responsible for their content, security, pricing, availability or policies.</p>,
        },
        {
          heading: "Copyright concerns",
          content: <p>Demo and studio wallpapers are intended to be original. If you believe any published material infringes your rights, use the website contact channel with enough detail for the claim to be reviewed promptly.</p>,
        },
      ]}
    />
  );
}
