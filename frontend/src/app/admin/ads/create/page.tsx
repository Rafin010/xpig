'use client';

import { useState, useRef } from 'react';
import { 
  Settings2, 
  ArrowLeft, 
  Upload, 
  Image as ImageIcon, 
  ExternalLink, 
  LayoutTemplate, 
  Layers, 
  Check, 
  Megaphone, 
  Eye, 
  DollarSign, 
  Receipt,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  AlertCircle,
  HelpCircle,
  Radio,
  Zap
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://xpig.onrender.com';

// Ready-to-use production ad templates
const AD_PRESETS = [
  {
    id: 'casino',
    label: '🎰 Sports Betting / Casino',
    name: '1xBet Official',
    title: '100% Welcome Bonus on First Deposit - Play & Win Big',
    description: 'Instant crypto & bKash payouts, 24/7 VIP support, verified licensed sportsbook.',
    thumbnail_url: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=800&auto=format&fit=crop&q=80',
    target_url: 'https://1xbet.com',
    badge_text: 'SPONSORED',
    placement: 'feed' as const,
    target_impressions: 50000,
    pricing_model: 'CPM' as const,
  },
  {
    id: 'vpn',
    label: '🛡️ Anonymous VPN / Proxy',
    name: 'CyberVPN Pro',
    title: 'Browse 100% Anonymously - 70% Off + 3 Months Free',
    description: 'Zero logs recorded, bypass strict ISP throttling, ultra-fast 10Gbps private streaming nodes.',
    thumbnail_url: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=80',
    target_url: 'https://nordvpn.com',
    badge_text: 'VERIFIED PARTNER',
    placement: 'all' as const,
    target_impressions: 100000,
    pricing_model: 'CPM' as const,
  },
  {
    id: 'telegram',
    label: '✈️ Telegram VIP Channel',
    name: 'XPIG Telegram VIP',
    title: 'Join XPIG Official Telegram - Daily Content Drops & Leaks',
    description: 'Exclusive private video link drops directly in Telegram without redirects or ads.',
    thumbnail_url: 'https://images.unsplash.com/photo-1614680376593-902f749f7ffc?w=800&auto=format&fit=crop&q=80',
    target_url: 'https://t.me/xpig_official',
    badge_text: 'EXCLUSIVE',
    placement: 'banner' as const,
    target_impressions: 25000,
    pricing_model: 'CPM' as const,
  },
  {
    id: 'tech',
    label: '🛍️ Tech & Gadgets Store',
    name: 'Aura Tech & Gear',
    title: 'Private Audio Gear & Smart Accessories - Cash on Delivery',
    description: 'Discreet bubble-wrapped delivery, 1-year replacement warranty on all imported gadgets.',
    thumbnail_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
    target_url: 'https://amazon.com',
    badge_text: 'PROMOTED',
    placement: 'feed' as const,
    target_impressions: 10000,
    pricing_model: 'CPM' as const,
  }
];

export default function CreateAdCampaign() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Core Ad Details
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [targetUrl, setTargetUrl] = useState('');
  const [badgeText, setBadgeText] = useState('SPONSORED');
  const [placement, setPlacement] = useState<'feed' | 'banner' | 'all'>('feed');

  // Ad Engine & Impression Quota
  const [targetImpressions, setTargetImpressions] = useState<number>(50000);
  const [pricingModel, setPricingModel] = useState<'CPM' | 'FLAT_RATE' | 'CPC'>('CPM');
  const [inCardPlaylist, setInCardPlaylist] = useState<boolean>(true);

  // Billing & Invoicing Information
  const [billingCompany, setBillingCompany] = useState('');
  const [billingEmail, setBillingEmail] = useState('');
  const [billingTaxId, setBillingTaxId] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [previewTab, setPreviewTab] = useState<'banner' | 'card'>('card');

  // Auto calculate budget based on model & quota
  const calculatedBudget = pricingModel === 'CPM'
    ? Math.round((targetImpressions / 1000.0) * 2.50)
    : pricingModel === 'CPC'
    ? Math.round((targetImpressions * 0.03) * 0.25)
    : 150.00;

  // 1-Click Template Loader
  const handleApplyPreset = (preset: typeof AD_PRESETS[0]) => {
    setName(preset.name);
    setTitle(preset.title);
    setDescription(preset.description);
    setThumbnailUrl(preset.thumbnail_url);
    setTargetUrl(preset.target_url);
    setBadgeText(preset.badge_text);
    setPlacement(preset.placement);
    setTargetImpressions(preset.target_impressions);
    setPricingModel(preset.pricing_model);
    setBillingCompany(preset.name);
    setBillingEmail(`billing@${preset.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`);
    setSubmitError(null);
  };

  // Handle local file upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (.png, .jpg, .webp, .gif)');
      return;
    }

    setIsUploadingImage(true);
    setSubmitError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(`${API_BASE}/api/v1/sponsors/upload-creative`, {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setThumbnailUrl(data.url);
      } else {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) setThumbnailUrl(event.target.result as string);
        };
        reader.readAsDataURL(file);
      }
    } catch {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) setThumbnailUrl(event.target.result as string);
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!name.trim()) {
      setSubmitError('Please enter the Sponsor Brand Name.');
      return;
    }
    if (!title.trim()) {
      setSubmitError('Please enter a Campaign Headline Title.');
      return;
    }
    if (!thumbnailUrl.trim()) {
      setSubmitError('Please upload or select a Creative Banner Image.');
      return;
    }
    if (!targetUrl.trim()) {
      setSubmitError('Please provide the Target Destination URL (where clicks redirect).');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/sponsors/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          title: title.trim(),
          description: description.trim() || null,
          thumbnail_url: thumbnailUrl.trim(),
          video_url: videoUrl.trim() || null,
          target_url: targetUrl.trim(),
          badge_text: badgeText.trim() || 'SPONSORED',
          placement,
          is_active: true,
          target_impressions: Number(targetImpressions) || 10000,
          budget: Number(calculatedBudget) || 25.0,
          pricing_model: pricingModel,
          status: 'ACTIVE',
          in_card_playlist: inCardPlaylist,
          billing_company: billingCompany.trim() || name.trim(),
          billing_email: billingEmail.trim() || `billing@${name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
          billing_tax_id: billingTaxId.trim() || `TAX-${Math.floor(100000 + Math.random() * 900000)}`,
        }),
      });

      if (res.ok) {
        router.push('/admin/ads');
      } else {
        const errData = await res.json().catch(() => null);
        const detailMsg = typeof errData?.detail === 'string'
          ? errData.detail
          : Array.isArray(errData?.detail)
          ? errData.detail.map((d: any) => d.msg || JSON.stringify(d)).join(', ')
          : 'Failed to launch campaign. Please verify all inputs.';
        setSubmitError(detailMsg);
      }
    } catch (err: any) {
      console.error(err);
      setSubmitError(err?.message || 'Network error connecting to ad server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-24">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 font-semibold mb-2">
            <Megaphone className="w-3.5 h-3.5 text-pink-500" />
            <span>Enterprise Multi-Channel Campaign Builder</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Create Sponsor Campaign</h1>
          <p className="text-zinc-400 text-sm mt-1">
            Configure impression quotas, automated billing invoices, and homepage card playlist serving.
          </p>
        </div>
        <Link
          href="/admin/ads"
          className="px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white rounded-xl font-bold transition-all text-sm flex items-center gap-2 self-start sm:self-auto"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Campaigns
        </Link>
      </div>

      {/* 1-Click Fast Presets Box */}
      <div className="p-5 bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 border border-zinc-800 rounded-2xl shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <h3 className="font-bold text-sm text-white">1-Click Quick Sponsor Templates</h3>
          </div>
          <span className="text-[11px] text-zinc-400">Click any preset to auto-fill high converting copy & tested creatives</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {AD_PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => handleApplyPreset(p)}
              className="p-3 bg-zinc-900/90 hover:bg-zinc-800/90 border border-zinc-800 hover:border-pink-500/50 rounded-xl text-left transition-all group"
            >
              <div className="font-bold text-xs text-zinc-200 group-hover:text-white truncate">{p.label}</div>
              <div className="text-[11px] text-zinc-500 group-hover:text-pink-400 mt-1 font-mono truncate">{p.name}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Submit Error Alert */}
      {submitError && (
        <div className="p-4 bg-rose-950/40 border border-rose-800/80 rounded-2xl text-sm text-rose-300 flex items-start gap-3 shadow-lg animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold block">Validation Error:</span>
            <span>{submitError}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Column */}
        <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-6">
          <div className="bg-[#111113] border border-zinc-800/80 p-6 sm:p-8 rounded-2xl shadow-xl space-y-6">
            
            {/* Section 1: Placement Selector */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
                Target Ad Placement
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setPlacement('feed')}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    placement === 'feed'
                      ? 'bg-zinc-800 border-emerald-500 text-white shadow-md'
                      : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Layers className="w-4 h-4 text-emerald-400" />
                    {placement === 'feed' && <Check className="w-4 h-4 text-emerald-400" />}
                  </div>
                  <div className="font-bold text-xs text-white">Feed Cards</div>
                  <div className="text-[11px] text-zinc-500 mt-0.5">Slots 1 & 2</div>
                </button>

                <button
                  type="button"
                  onClick={() => setPlacement('banner')}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    placement === 'banner'
                      ? 'bg-zinc-800 border-emerald-500 text-white shadow-md'
                      : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <LayoutTemplate className="w-4 h-4 text-blue-400" />
                    {placement === 'banner' && <Check className="w-4 h-4 text-emerald-400" />}
                  </div>
                  <div className="font-bold text-xs text-white">Billboard Banner</div>
                  <div className="text-[11px] text-zinc-500 mt-0.5">Top of Page</div>
                </button>

                <button
                  type="button"
                  onClick={() => setPlacement('all')}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    placement === 'all'
                      ? 'bg-zinc-800 border-emerald-500 text-white shadow-md'
                      : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Megaphone className="w-4 h-4 text-purple-400" />
                    {placement === 'all' && <Check className="w-4 h-4 text-emerald-400" />}
                  </div>
                  <div className="font-bold text-xs text-white">All Slots</div>
                  <div className="text-[11px] text-zinc-500 mt-0.5">Banner + Feed</div>
                </button>
              </div>
            </div>

            {/* Section 2: Meta-Style Impression Quota & Pacing Engine */}
            <div className="space-y-3 pt-2 border-t border-zinc-800/80">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
                  Impression Delivery Quota (Meta/YouTube Pacing)
                </label>
                <span className="text-[11px] text-emerald-400 font-mono font-bold">Auto-Paced</span>
              </div>
              <p className="text-xs text-zinc-400">
                The ad engine serves higher-volume campaigns with proportionally higher weight until their guaranteed quota is fulfilled.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[1000, 10000, 50000, 100000].map((quota) => (
                  <button
                    key={quota}
                    type="button"
                    onClick={() => setTargetImpressions(quota)}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      targetImpressions === quota
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <div className="text-sm font-black">{quota.toLocaleString()}</div>
                    <div className="text-[10px] text-zinc-500">Impressions</div>
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">Custom Impression Quota</label>
                  <input
                    type="number"
                    min="100"
                    step="100"
                    value={targetImpressions}
                    onChange={(e) => setTargetImpressions(Math.max(100, parseInt(e.target.value || '1000', 10)))}
                    className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl px-3.5 py-2 text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs text-zinc-400 block mb-1">Pricing Model</label>
                  <select
                    value={pricingModel}
                    onChange={(e: any) => setPricingModel(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl px-3.5 py-2 text-white text-sm focus:outline-none focus:border-emerald-500"
                  >
                    <option value="CPM">CPM ($2.50 per 1,000 Impressions)</option>
                    <option value="FLAT_RATE">Flat Sponsorship ($150 / Flight)</option>
                    <option value="CPC">CPC ($0.25 per Click Guarantee)</option>
                  </select>
                </div>
              </div>

              {/* Calculated Budget Preview Box */}
              <div className="p-3 bg-zinc-900/90 border border-zinc-800 rounded-xl flex items-center justify-between text-xs">
                <span className="text-zinc-400 flex items-center gap-1.5 font-medium">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                  Calculated Campaign Budget:
                </span>
                <span className="font-mono text-emerald-400 font-bold text-sm">
                  ${calculatedBudget.toFixed(2)} USD
                </span>
              </div>
            </div>

            {/* Section 3: Campaign Titles & Creative Details */}
            <div className="space-y-4 pt-2 border-t border-zinc-800/80">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
                    Campaign Title <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., 100% Welcome Bonus on First Deposit"
                    className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl px-3.5 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 text-sm"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
                    Sponsor Brand Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (!billingCompany) setBillingCompany(e.target.value);
                    }}
                    placeholder="e.g., 1xBet Official"
                    className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl px-3.5 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 text-sm"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
                  Short Description
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g., Instant withdrawals, 24/7 VIP support, verified licensed sportsbook"
                  className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl px-3.5 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 text-sm"
                />
              </div>

              {/* Creative Upload */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
                  Creative Image Banner <span className="text-rose-400">*</span>
                </label>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  accept="image/*" 
                  onChange={handleFileChange} 
                  className="hidden" 
                />
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={thumbnailUrl}
                    onChange={(e) => setThumbnailUrl(e.target.value)}
                    placeholder="Paste image URL or upload directly..."
                    className="flex-1 bg-zinc-900 border border-zinc-700/80 rounded-xl px-3.5 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 text-xs font-mono"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingImage}
                    className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-bold text-xs flex items-center gap-2 border border-zinc-700 shrink-0"
                  >
                    <Upload className="w-4 h-4" />
                    <span>{isUploadingImage ? 'Uploading...' : 'Upload File'}</span>
                  </button>
                </div>
              </div>

              {/* Destination URL & Badge Label */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
                    Target URL <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="url"
                    value={targetUrl}
                    onChange={(e) => setTargetUrl(e.target.value)}
                    placeholder="https://1xbet.com or https://t.me/channel"
                    className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl px-3.5 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 text-xs font-mono"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
                    Badge Label
                  </label>
                  <input
                    type="text"
                    value={badgeText}
                    onChange={(e) => setBadgeText(e.target.value)}
                    placeholder="SPONSORED"
                    className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl px-3.5 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 text-sm"
                  />
                </div>
              </div>

              {/* Optional Video Loop URL for Card Ads */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
                  Optional Video Loop URL (For Muted Infinity Card Preview)
                </label>
                <input
                  type="url"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://pub-xxx.r2.dev/videos/sponsor_loop.mp4"
                  className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl px-3.5 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 text-xs font-mono"
                />
              </div>

              {/* Homepage 2-Card Playlist Inclusion Toggle */}
              <div className="p-3 bg-zinc-900/60 border border-zinc-800 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white block">Include in Homepage 2-Card Playlist</span>
                  <span className="text-[11px] text-zinc-500">Enables infinite rotation on Slot 1 & 2 of the video grid</span>
                </div>
                <input
                  type="checkbox"
                  checked={inCardPlaylist}
                  onChange={(e) => setInCardPlaylist(e.target.checked)}
                  className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                />
              </div>
            </div>

            {/* Section 4: Corporate Billing & Invoicing */}
            <div className="space-y-4 pt-2 border-t border-zinc-800/80">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                  Sponsor Billing & Invoice Generator
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] text-zinc-400 block">Billing Company</label>
                  <input
                    type="text"
                    value={billingCompany}
                    onChange={(e) => setBillingCompany(e.target.value)}
                    placeholder="Company Legal Name"
                    className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl px-3 py-2 text-white text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-zinc-400 block">Billing Email</label>
                  <input
                    type="email"
                    value={billingEmail}
                    onChange={(e) => setBillingEmail(e.target.value)}
                    placeholder="billing@company.com"
                    className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl px-3 py-2 text-white text-xs font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-zinc-400 block">Tax / VAT ID</label>
                  <input
                    type="text"
                    value={billingTaxId}
                    onChange={(e) => setBillingTaxId(e.target.value)}
                    placeholder="e.g. TAX-894721"
                    className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl px-3 py-2 text-white text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-4 border-t border-zinc-800/60 flex items-center justify-between">
              <span className="text-xs text-zinc-500 font-mono">
                Auto-generates official invoice & audit certificate
              </span>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-7 py-3 bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl font-black transition-all shadow-lg shadow-emerald-950/40 text-sm flex items-center gap-2 active:scale-[0.98] disabled:opacity-50"
              >
                {isSubmitting ? 'Launching Campaign...' : 'Launch Campaign & Generate Bill'}
              </button>
            </div>

          </div>
        </form>

        {/* Live Visual Preview Column */}
        <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-24">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-emerald-400" />
              Live Visual Preview
            </h3>
            <div className="flex gap-1 bg-zinc-900 p-1 rounded-xl border border-zinc-800 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setPreviewTab('card')}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  previewTab === 'card' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'
                }`}
              >
                Card View
              </button>
              <button
                type="button"
                onClick={() => setPreviewTab('banner')}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  previewTab === 'banner' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'
                }`}
              >
                Billboard View
              </button>
            </div>
          </div>

          {/* Preview Container */}
          <div className="bg-[#111113] border border-zinc-800/80 p-5 rounded-2xl shadow-xl space-y-4">
            {previewTab === 'card' ? (
              <div className="space-y-3">
                <span className="text-[11px] text-zinc-500 uppercase font-mono font-bold">Homepage Video Grid Card Slot (Index 3 & 7)</span>
                <div className="bg-[#050505] p-3 rounded-xl border border-zinc-800">
                  <div className="aspect-[16/9] bg-zinc-900 rounded-xl overflow-hidden relative border border-zinc-800">
                    {thumbnailUrl ? (
                      <img src={thumbnailUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-600 text-xs font-mono">
                        No Creative Uploaded
                      </div>
                    )}
                    <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/80 rounded text-[10px] font-black text-amber-400 uppercase border border-amber-500/30">
                      {badgeText || 'SPONSORED'}
                    </div>
                  </div>
                  <div className="mt-2.5 flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-zinc-800 text-amber-400 font-bold text-xs flex items-center justify-center shrink-0">
                      {name ? name.slice(0, 2).toUpperCase() : 'AD'}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-white text-xs truncate">{title || 'Campaign Title Goes Here'}</div>
                      <div className="text-[11px] text-zinc-400 mt-0.5">{name || 'Sponsor Name'}</div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <span className="text-[11px] text-zinc-500 uppercase font-mono font-bold">Homepage Billboard Banner Slot</span>
                <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-14 h-10 rounded-lg overflow-hidden bg-zinc-800 shrink-0">
                      {thumbnailUrl ? <img src={thumbnailUrl} alt="" className="w-full h-full object-cover" /> : null}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white truncate">{title || 'Billboard Banner Headline'}</div>
                      <div className="text-[11px] text-zinc-400 truncate">{description || 'Promotional Offer Details'}</div>
                    </div>
                  </div>
                  <span className="px-3 py-1.5 bg-emerald-500 text-black text-xs font-extrabold rounded-lg shrink-0">
                    Visit
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
