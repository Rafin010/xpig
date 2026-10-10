import React from 'react';
import LinkClient from './LinkClient';

export default async function LinkPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  return <LinkClient slug={resolvedParams.slug} />;
}

export const instant = false;
