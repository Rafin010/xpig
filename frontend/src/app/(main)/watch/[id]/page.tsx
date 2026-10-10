import React from 'react';
import WatchClient from './WatchClient';

export default async function WatchPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  return <WatchClient videoId={resolvedParams.id} />;
}

export const instant = false;
