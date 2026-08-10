import type { Metadata } from "next";
import { LegalPage } from "../_components/legal-page";

export const metadata: Metadata = { title: "Copyright Policy", description: "Copyright and permitted-use policy for 4K Wallpaper Studio artwork and content." };

export default function CopyrightPage() {
  return <LegalPage title="Copyright Policy" intro="This policy explains ownership, personal-use permissions and restrictions for artwork, articles and tools published by 4K Wallpaper Studio." sections={[
    { heading: "Studio content", content: <p>Unless a page states otherwise, original wallpapers, written guides, page design and studio branding are protected content owned or licensed by 4K Wallpaper Studio.</p> },
    { heading: "Personal wallpaper use", content: <p>You may download free wallpapers for personal, non-commercial use on devices you own or control. You may crop or resize a wallpaper for that use.</p> },
    { heading: "No redistribution", content: <p>You may not resell, re-upload, bundle, sublicense, scrape or distribute wallpapers as files, competing collections, templates, NFTs, stock assets or training datasets without written permission.</p> },
    { heading: "User-created tool output", content: <p>Wallpapers you create with the name and gradient tools may be used personally. The underlying tool code, interface and studio branding are not transferred.</p> },
    { heading: "Reporting a concern", content: <p>If you believe material infringes your rights, follow the DMCA and removal process with links and enough information for a good-faith review.</p> },
  ]} />;
}
