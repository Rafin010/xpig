import React from 'react';
import SubscribeClient from './SubscribeClient';

export default async function SubscribePage({ params }: { params: Promise<{ creator_id: string }> }) {
  const resolvedParams = await params;
  return <SubscribeClient creatorId={resolvedParams.creator_id} />;
}



export const instant = false;
