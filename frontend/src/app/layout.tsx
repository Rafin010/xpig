import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Dancing_Script } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { ALL_SEO_KEYWORDS } from "@/lib/seo-keywords";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const dancingScript = Dancing_Script({
  variable: "--font-signature",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#181818",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://xpig.me"),
  title: {
    default: "XPIG.me - দেশি ও বাংলা অ্যাডাল্ট ভিডিও | Deshi Viral Video Collection | 18+ Videos",
    template: "%s | XPIG.me",
  },
  description: "XPIG.me - সেরা দেশি ও বাংলা অ্যাডাল্ট ভিডিও কালেকশন, ভাইরাল ভিডিও লিংক এবং ১৮+ ভিডিও স্ট্রিমিং প্ল্যাটফর্ম। Watch exclusive Bangla sex videos, Deshi viral video links, Indian & Bangladeshi adult content in Full HD 1080p.",
  keywords: ALL_SEO_KEYWORDS,
  category: "adult entertainment",
  classification: "adult video streaming",
  icons: {
    icon: [
      { url: "/icon.png", type: "image/png" },
      { url: "/favicon.ico", type: "image/x-icon" },
    ],
    shortcut: "/icon.png",
    apple: "/admin-icon.png",
  },
  alternates: {
    canonical: "https://xpig.me",
    languages: {
      "bn-BD": "https://xpig.me",
      "en-US": "https://xpig.me",
      "hi-IN": "https://xpig.me",
    },
  },
  openGraph: {
    title: "XPIG.me - দেশি ও বাংলা অ্যাডাল্ট ভিডিও | Deshi Viral Video Collection",
    description: "সেরা দেশি ও বাংলা অ্যাডাল্ট ভিডিও, ভাইরাল ভিডিও লিংক এবং ১৮+ ভিডিও স্ট্রিমিং প্ল্যাটফর্ম। Watch Bangla sex videos & Deshi viral video clips on XPIG.me.",
    url: "https://xpig.me",
    siteName: "XPIG",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 675,
        alt: "XPIG.me - দেশি ও বাংলা অ্যাডাল্ট ভিডিও",
      },
    ],
    type: "website",
    locale: "bn_BD",
    alternateLocale: ["en_US", "hi_IN"],
  },
  twitter: {
    card: "summary_large_image",
    title: "XPIG.me - দেশি ও বাংলা অ্যাডাল্ট ভিডিও | Deshi Viral Video Collection",
    description: "সেরা দেশি ও বাংলা অ্যাডাল্ট ভিডিও, ভাইরাল ভিডিও লিংক এবং ১৮+ ভিডিও স্ট্রিমিং প্ল্যাটফর্ম। Watch Bangla sex videos & Deshi viral video clips on XPIG.me.",
    images: ["/og-image.jpg"],
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
  verification: {
    google: "G-5GB8XVH1PP",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": "https://xpig.me/#website",
        "url": "https://xpig.me",
        "name": "XPIG.me",
        "alternateName": ["XPIG", "XPIG Videos", "XPIG Bangla"],
        "description": "সেরা দেশি ও বাংলা অ্যাডাল্ট ভিডিও কালেকশন এবং ভাইরাল ভিডিও লিংক প্ল্যাটফর্ম।",
        "inLanguage": ["bn-BD", "en-US", "hi-IN"],
        "potentialAction": {
          "@type": "SearchAction",
          "target": {
            "@type": "EntryPoint",
            "urlTemplate": "https://xpig.me/?q={search_term_string}"
          },
          "query-input": "required name=search_term_string"
        }
      },
      {
        "@type": "Organization",
        "@id": "https://xpig.me/#organization",
        "name": "XPIG",
        "url": "https://xpig.me",
        "logo": {
          "@type": "ImageObject",
          "url": "https://xpig.me/icon.png"
        }
      },
      {
        "@type": "FAQPage",
        "@id": "https://xpig.me/#faq",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "XPIG.me কি এবং এখানে কি ধরনের ভিডিও পাওয়া যায়?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "XPIG.me হলো একটি প্রিমিয়াম ভিডিও স্ট্রিমিং প্ল্যাটফর্ম, যেখানে সেরা বাংলা ও দেশি অ্যাডাল্ট ভিডিও, ভাইরাল ভিডিও লিংক এবং ১৮+ বিনোদন সম্পূর্ণ বিনামূল্যে উপভোগ করা যায়।"
            }
          },
          {
            "@type": "Question",
            "name": "কিভাবে বাংলা ও দেশি ভাইরাল ভিডিও ফুল এইচডি কোয়ালিটিতে দেখতে পারি?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "XPIG.me-এ যেকোনো ভিডিও সরাসরি ১০৮০পি ফুল এইচডি কোয়ালিটিতে বাফারিং ছাড়া যেকোনো ডিভাইস (মোবাইল, কম্পিউটার) থেকে দেখা যায়।"
            }
          },
          {
            "@type": "Question",
            "name": "প্রতিদিন কি নতুন ভিডিও আপডেট করা হয়?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "হ্যাঁ, XPIG.me তে প্রতিদিন নতুন নতুন দেশি ও বাংলা ভাইরাল ভিডিও এবং এক্সক্লুসিভ লিংক নিয়মিত আপডেট করা হয়।"
            }
          }
        ]
      }
    ]
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
      <body suppressHydrationWarning className={`${dancingScript.variable} min-h-full flex flex-col bg-[#181818] text-white overflow-x-hidden`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
