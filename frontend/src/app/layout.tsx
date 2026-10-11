import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Providers } from "@/components/Providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0a0a0a",
};

export const metadata: Metadata = {
  title: "XPIG - Premium Creator Content Platform",
  description: "Discover exclusive content, follow top creators, and monetize your audience on XPIG. The ultimate platform for premium video sharing, networking, and creator success.",
  keywords: ["premium content", "creators", "monetization", "exclusive videos", "creator platform", "video sharing", "social network", "XPIG", "xpig.me", "live streaming", "content monetization", "vlogging", "influencers", "creator economy", "digital content", "video hosting", "ad network", "social media", "subscriptions", "creative community"],
  openGraph: {
    title: "XPIG - Premium Creator Content Platform",
    description: "Discover exclusive content, follow top creators, and monetize your audience on XPIG.",
    url: "https://xpig.me",
    siteName: "XPIG",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "XPIG - The Premium Content Platform",
    description: "Discover exclusive content and monetize your audience.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "XPIG",
    "url": "https://xpig.me",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://xpig.me/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}>
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        
        {/* Google Analytics Tag */}
        <Script
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtag/js?id=G-5GB8XVH1PP`}
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-5GB8XVH1PP', {
                page_path: window.location.pathname,
              });
            `,
          }}
        />
      </head>
      <body suppressHydrationWarning className="min-h-full flex flex-col bg-[#0a0a0a] text-white overflow-x-hidden">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
