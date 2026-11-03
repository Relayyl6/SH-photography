import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Providers } from "@/components/Providers";
import { siteConfig } from "@/lib/site-config";
import { getSiteSettings } from "@/lib/content";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteSettings();
  const bName = site.businessName || siteConfig.businessName;
  const pageTitle = site.seo?.title || `${bName} — Photographer in Manchester`;
  const pageDesc = site.seo?.description || siteConfig.positioningLine;

  return {
    metadataBase: new URL(siteConfig.siteUrl),
    title: {
      default: pageTitle,
      template: `%s — ${bName}`,
    },
    description: pageDesc,
    openGraph: {
      title: pageTitle,
      description: pageDesc,
      type: "website",
    },
    icons: {
      icon: [
        { url: site.favicon || "/favicon.ico", sizes: "any" },
        { url: "/icon.png", type: "image/png", sizes: "512x512" },
      ],
      apple: [
        { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
      ],
    },
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB">
      <body className="font-sans antialiased overflow-x-clip">
        <Providers>
          <a href="#main" className="skip-link">
            Skip to content
          </a>
          <Header />
          <main id="main">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
