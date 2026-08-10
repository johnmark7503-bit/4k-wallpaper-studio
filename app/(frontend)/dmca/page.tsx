import type { Metadata } from "next";
import { LegalPage } from "../_components/legal-page";

export const metadata: Metadata = { title: "DMCA & Removal Requests", description: "How to submit a copyright or content removal notice to 4K Wallpaper Studio." };

export default function DmcaPage() {
  return <LegalPage title="DMCA & Removal Requests" intro="4K Wallpaper Studio intends to publish original material and responds to sufficiently detailed, good-faith copyright concerns." sections={[
    { heading: "What to include", content: <p>Identify the copyrighted work, provide the exact URL of the material in question, explain the basis of your claim and include reliable contact information.</p> },
    { heading: "Required statements", content: <p>A formal notice should include a good-faith statement, an accuracy statement made under penalty of perjury where applicable and the physical or electronic signature of the rights holder or authorized representative.</p> },
    { heading: "Review process", content: <p>We may temporarily restrict material while reviewing a complete notice, request clarification, notify the uploader or creator and take action consistent with applicable law.</p> },
    { heading: "Misrepresentation", content: <p>Do not submit a notice for material you do not own or control. Knowingly false claims can create legal liability.</p> },
    { heading: "Contact channel", content: <p>The final designated-agent email and mailing details will be published here before public user uploads or third-party submissions are enabled.</p> },
  ]} />;
}
