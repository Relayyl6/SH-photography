import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { siteConfig } from "@/lib/site-config";

// NOTE: this build environment has no access to fonts.googleapis.com, so
// the display/sans stacks fall back to system fonts (see globals.css
// --font-display / --font-sans). On Vercel (or anywhere with normal
// internet access) swap these two lines back in for the real thing:
//
//   import { Fraunces, Inter } from "next/font/google";
//   const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-display", weight: ["400","500","600"], style: ["normal","italic"], display: "swap" });
//   const inter = Inter({ subsets: ["latin"], variable: "--font-sans", weight: ["400","500","600","700"], display: "swap" });
//
// then add `${fraunces.variable} ${inter.variable}` back to <html className>.

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.siteUrl),
  title: {
    default: `${siteConfig.businessName} — Photographer in Manchester`,
    template: `%s — ${siteConfig.businessName}`,
  },
  description: siteConfig.positioningLine,
  openGraph: {
    title: siteConfig.businessName,
    description: siteConfig.positioningLine,
    type: "website",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB">
      <body className="font-sans antialiased overflow-x-hidden">
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <Header />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
