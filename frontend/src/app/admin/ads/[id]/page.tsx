import React from 'react';
import CampaignDetailsClient from './CampaignDetailsClient';

export default async function CampaignDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  return <CampaignDetailsClient id={resolvedParams.id} />;
}

export const instant = false;
