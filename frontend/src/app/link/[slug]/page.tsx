import React from 'react';
import type { Metadata } from 'next';
import LinkClient from './LinkClient';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'XPIG - আপনার পছন্দের নতুন ঠিকানা!',
    description: 'XPIG.me-এ ভিজিট করুন এবং নতুন নতুন লিংক, আকর্ষণীয় কনটেন্ট এবং প্রিমিয়াম কালেকশন পেতে আজই আমাদের ওয়েবসাইট ঘুরে দেখুন!',
    openGraph: {
      title: 'XPIG - আপনার পছন্দের নতুন ঠিকানা!',
      description: 'XPIG.me-এ ভিজিট করুন এবং নতুন নতুন লিংক, আকর্ষণীয় কনটেন্ট এবং প্রিমিয়াম কালেকশন পেতে আজই আমাদের ওয়েবসাইট ঘুরে দেখুন!',
      url: 'https://xpig.me',
      images: [
        {
          url: 'https://xpig.me/og-image.jpg',
          width: 1200,
          height: 675,
          alt: 'XPIG - আপনার পছন্দের নতুন ঠিকানা!',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'XPIG - আপনার পছন্দের নতুন ঠিকানা!',
      description: 'XPIG.me-এ ভিজিট করুন এবং নতুন নতুন লিংক, আকর্ষণীয় কনটেন্ট এবং প্রিমিয়াম কালেকশন পেতে আজই আমাদের ওয়েবসাইট ঘুরে দেখুন!',
      images: ['https://xpig.me/og-image.jpg'],
    },
  };
}

export default async function LinkPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  return <LinkClient slug={resolvedParams.slug} />;
}

export const instant = false;
