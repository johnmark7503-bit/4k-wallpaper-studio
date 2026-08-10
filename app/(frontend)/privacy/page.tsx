import type { Metadata } from "next";
import { LegalPage } from "../_components/legal-page";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How 4K Wallpaper Studio handles visitor and subscriber information.",
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      intro="This policy explains what information 4K Wallpaper Studio may collect, why it is used and the choices available to visitors."
      sections={[
        {
          heading: "Information you provide",
          content: <p>We may receive your email address when you join the newsletter, information you submit through forms and messages you send to support. Please do not submit sensitive personal information.</p>,
        },
        {
          heading: "Automatic information",
          content: <p>Like most websites, we may process basic device, browser, referral, page-view and approximate location data for security, performance and aggregate analytics. Advertising and affiliate partners may use cookies or similar technologies according to their own policies.</p>,
        },
        {
          heading: "How information is used",
          content: <p>Information is used to operate and secure the website, deliver requested emails, understand which content is useful, measure campaigns and improve wallpapers and tools. We do not sell personal information.</p>,
        },
        {
          heading: "Your choices",
          content: <p>You can unsubscribe using the link in any newsletter. Browser controls can limit cookies, although some features may work differently. You may request access, correction or deletion through the website contact channel when it becomes available.</p>,
        },
        {
          heading: "Retention and security",
          content: <p>We retain information only as long as reasonably needed for the purposes described above, legal obligations and abuse prevention. Reasonable safeguards are used, but no internet service can guarantee absolute security.</p>,
        },
      ]}
    />
  );
}
