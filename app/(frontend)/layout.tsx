import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://4kwallpaper.studio"),
  title: {
    default: "4K Wallpaper Studio — Original Wallpapers for Every Screen",
    template: "%s | 4K Wallpaper Studio",
  },
  description:
    "Discover original 4K wallpapers for desktop, mobile and AMOLED screens. Explore curated nature, abstract and cinematic collections or create a custom name wallpaper.",
  applicationName: "4K Wallpaper Studio",
  keywords: [
    "4K wallpapers",
    "desktop wallpapers",
    "mobile wallpapers",
    "AMOLED wallpapers",
    "original wallpapers",
  ],
  authors: [{ name: "4K Wallpaper Studio" }],
  creator: "4K Wallpaper Studio",
  openGraph: {
    title: "4K Wallpaper Studio",
    description:
      "Handpicked original 4K wallpapers, made to transform every screen.",
    type: "website",
    siteName: "4K Wallpaper Studio",
  },
  twitter: {
    card: "summary_large_image",
    title: "4K Wallpaper Studio",
    description:
      "Handpicked original 4K wallpapers, made to transform every screen.",
  },
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#03070b",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
