'use client';
import { useState, useRef } from 'react';
import { Settings2, ArrowLeft, Upload, Image as ImageIcon, ExternalLink, Sparkles, LayoutTemplate, Layers, Check } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CreateAdCampaign() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [targetUrl, setTargetUrl] = useState('');
  const [badgeText, setBadgeText] = useState('SPONSORED');
  const [placement, setPlacement] = useState<'feed' | 'banner' | 'all'>('feed');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [previewTab, setPreviewTab] = useState<'banner' | 'card'>('card');

  // Handle local file selection and convert to Base64 data URI / upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (.png, .jpg, .webp, .gif)');
      return;
    }

    // Try backend upload endpoint or fallback to client-side data URI
    setIsUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('https://xpig.onrender.com/api/v1/sponsors/upload-creative', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setThumbnailUrl(data.url);
      } else {
        // Fallback to FileReader data URI
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            setThumbnailUrl(event.target.result as string);
          }
        };
        reader.readAsDataURL(file);
      }
    } catch (err) {
      console.warn('Backend creative upload failed, using local Data URI fallback', err);
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setThumbnailUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !title || !thumbnailUrl || !targetUrl) {
      alert('Please fill in Sponsor Name, Campaign Title, Creative Image, and Target URL.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('https://xpig.onrender.com/api/v1/sponsors/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          title,
          description: description || null,
          thumbnail_url: thumbnailUrl,
          target_url: targetUrl,
          badge_text: badgeText || 'SPONSORED',
          placement,
          is_active: true,
        }),
      });

      if (res.ok) {
        alert('Sponsor Campaign Launched Successfully!');
        router.push('/admin/ads');
      } else {
        alert('Failed to launch campaign. Please check backend response.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error submitting campaign.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-24">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-800/80 border border-zinc-700/60 text-xs text-zinc-300 font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Sponsor & Ad Campaign Builder</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Create Sponsor Campaign</h1>
          <p className="text-zinc-400 text-sm mt-1">
            Design and launch custom banner or video grid sponsor cards. Active campaigns render seamlessly on XPIG.
          </p>
        </div>
        <Link
          href="/admin/ads"
          className="px-5 py-2.5 bg-[#18181b] hover:bg-zinc-800 border border-zinc-800 text-white rounded-xl font-bold transition-all text-sm flex items-center gap-2 self-start sm:self-auto"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Campaigns
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Column */}
        <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-6">
          <div className="bg-[#111] border border-zinc-800/60 rounded-2xl p-6 shadow-xl space-y-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-zinc-800/60 pb-4">
              <Settings2 className="w-5 h-5 text-amber-500" /> Campaign Configuration
            </h3>

            {/* Placement Selector */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-300">
                Placement Type <span className="text-red-400">*</span>
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setPlacement('feed');
                    setPreviewTab('card');
                  }}
                  className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                    placement === 'feed'
                      ? 'bg-zinc-800/90 border-zinc-500 text-white shadow-md'
                      : 'bg-[#18181b] border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <LayoutTemplate className="w-4 h-4 text-purple-400" />
                    {placement === 'feed' && <Check className="w-4 h-4 text-white" />}
                  </div>
                  <div>
                    <div className="font-bold text-xs text-white">Feed Card</div>
                    <div className="text-[11px] text-zinc-500 mt-0.5">Video Grid Native</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPlacement('banner');
                    setPreviewTab('banner');
                  }}
                  className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                    placement === 'banner'
                      ? 'bg-zinc-800/90 border-zinc-500 text-white shadow-md'
                      : 'bg-[#18181b] border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Layers className="w-4 h-4 text-blue-400" />
                    {placement === 'banner' && <Check className="w-4 h-4 text-white" />}
                  </div>
                  <div>
                    <div className="font-bold text-xs text-white">Billboard</div>
                    <div className="text-[11px] text-zinc-500 mt-0.5">Homepage Top</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPlacement('all');
                  }}
                  className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                    placement === 'all'
                      ? 'bg-zinc-800/90 border-zinc-500 text-white shadow-md'
                      : 'bg-[#18181b] border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    {placement === 'all' && <Check className="w-4 h-4 text-white" />}
                  </div>
                  <div>
                    <div className="font-bold text-xs text-white">All Slots</div>
                    <div className="text-[11px] text-zinc-500 mt-0.5">Banner + Feed</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Campaign Title & Brand */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-zinc-300">
                  Campaign Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Ultra Fast Premium VPN"
                  className="w-full bg-[#18181b] border border-zinc-800 rounded-xl px-4 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors text-sm"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-zinc-300">
                  Sponsor / Brand Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. NordVPN"
                  className="w-full bg-[#18181b] border border-zinc-800 rounded-xl px-4 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors text-sm"
                  required
                />
              </div>
            </div>

            {/* Short Description */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-300">Offer / Subtitle Description</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Get 70% off + 3 extra months with promo code XPIG."
                className="w-full bg-[#18181b] border border-zinc-800 rounded-xl px-4 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors text-sm"
              />
            </div>

            {/* Creative Image Upload / URL Input */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-zinc-300 flex items-center justify-between">
                <span>Creative Image (Thumbnail / Banner) <span className="text-red-400">*</span></span>
                <span className="text-xs text-zinc-500">16:9 ratio recommended</span>
              </label>

              {/* Drag & Drop File Box */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-zinc-800 hover:border-zinc-600 bg-[#161618] rounded-xl p-5 text-center cursor-pointer transition-colors group"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
                <div className="flex flex-col items-center justify-center gap-2">
                  <div className="p-3 rounded-full bg-zinc-800/80 group-hover:bg-zinc-700 text-zinc-300 transition-colors">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-white group-hover:underline">
                      {isUploadingImage ? 'Processing Image...' : 'Click to upload creative banner'}
                    </span>
                    <p className="text-xs text-zinc-500 mt-0.5">PNG, JPG, WEBP, or GIF</p>
                  </div>
                </div>
              </div>

              {/* Or paste direct URL */}
              <div className="relative">
                <input
                  type="url"
                  value={thumbnailUrl}
                  onChange={(e) => setThumbnailUrl(e.target.value)}
                  placeholder="Or paste direct image URL (https://...)"
                  className="w-full bg-[#18181b] border border-zinc-800 rounded-xl pl-4 pr-10 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors text-xs"
                  required
                />
                <ImageIcon className="w-4 h-4 text-zinc-500 absolute right-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Target Destination URL & Badge Text */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-zinc-300">
                  Target Destination URL <span className="text-red-400">*</span>
                </label>
                <input
                  type="url"
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  placeholder="https://sponsor.com/offer"
                  className="w-full bg-[#18181b] border border-zinc-800 rounded-xl px-4 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors text-sm"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-zinc-300">Badge Label</label>
                <input
                  type="text"
                  value={badgeText}
                  onChange={(e) => setBadgeText(e.target.value)}
                  placeholder="SPONSORED"
                  className="w-full bg-[#18181b] border border-zinc-800 rounded-xl px-4 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors text-sm"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-zinc-800/60 flex items-center justify-between">
              <span className="text-xs text-zinc-500">
                Campaign will activate immediately across XPIG.
              </span>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-7 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-bold transition-all border border-zinc-700/80 shadow-lg disabled:opacity-50 text-sm flex items-center gap-2"
              >
                {isSubmitting ? 'Launching...' : 'Launch Campaign'}
              </button>
            </div>
          </div>
        </form>

        {/* Live Preview Column */}
        <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-24">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Live Visual Preview
            </h3>
            <div className="flex gap-1 bg-[#18181b] p-1 rounded-lg border border-zinc-800 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setPreviewTab('card')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  previewTab === 'card' ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-white'
                }`}
              >
                Card View
              </button>
              <button
                type="button"
                onClick={() => setPreviewTab('banner')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  previewTab === 'banner' ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-white'
                }`}
              >
                Banner View
              </button>
            </div>
          </div>

          <div className="bg-[#111] border border-zinc-800/60 rounded-2xl p-4 shadow-xl">
            {previewTab === 'card' ? (
              /* Feed Video Card Preview */
              <div className="space-y-3">
                <div className="relative aspect-video w-full rounded-[12px] overflow-hidden bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                  {thumbnailUrl ? (
                    <img
                      src={thumbnailUrl}
                      alt={title || 'Preview'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-zinc-600 gap-1.5">
                      <ImageIcon className="w-8 h-8" />
                      <span className="text-xs">Upload creative to view preview</span>
                    </div>
                  )}

                  {/* Badge */}
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-amber-500 text-black shadow-md">
                    {badgeText || 'SPONSORED'}
                  </span>
                </div>

                <div className="flex gap-3 items-start pt-1">
                  <div className="w-9 h-9 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-black text-white shrink-0">
                    {(name || 'SP')[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm text-white line-clamp-2 leading-snug">
                      {title || 'Your Campaign Headline Will Appear Here'}
                    </h4>
                    <p className="text-xs text-zinc-400 mt-1 truncate">
                      {name || 'Sponsor Brand'}
                    </p>
                    {description && (
                      <p className="text-[11px] text-zinc-500 mt-1 line-clamp-2">
                        {description}
                      </p>
                    )}
                    <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 bg-zinc-800 border border-zinc-700 rounded-lg text-xs font-bold text-zinc-200">
                      <span>Visit Sponsor</span>
                      <ExternalLink className="w-3 h-3 text-zinc-400" />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Top Billboard Banner Preview */
              <div className="relative w-full rounded-[12px] overflow-hidden border border-zinc-800 bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 p-5">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    {thumbnailUrl ? (
                      <img
                        src={thumbnailUrl}
                        alt=""
                        className="w-20 h-14 rounded-lg object-cover border border-zinc-800 shrink-0"
                      />
                    ) : (
                      <div className="w-20 h-14 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-600 shrink-0">
                        <ImageIcon className="w-5 h-5" />
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-amber-500 text-black">
                          {badgeText || 'SPONSORED'}
                        </span>
                        <span className="text-xs font-semibold text-zinc-400">
                          {name || 'Brand Name'}
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-white mt-1">
                        {title || 'Top Billboard Campaign Headline'}
                      </h4>
                      <p className="text-xs text-zinc-400 mt-0.5 line-clamp-1">
                        {description || 'Sponsor offer and promotional details...'}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 px-4 py-2 bg-zinc-800 text-white rounded-lg text-xs font-bold border border-zinc-700 flex items-center gap-1.5">
                    <span>Learn More</span>
                    <ExternalLink className="w-3 h-3" />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-zinc-900/50 border border-zinc-800/60 rounded-xl p-3.5 text-xs text-zinc-400 space-y-1">
            <div className="font-semibold text-zinc-300">💡 Zero-Ad Rule Active:</div>
            <div>
              সিস্টেমে কোনো স্পন্সর ক্যাম্পেইন সক্রিয় না থাকলে ওয়েবসাইটে কোনো ফাঁকা ব্যানার বা ফেক অ্যাড প্লেসহোল্ডার আসবে না। স্পন্সর আপলোড করলেই কেবল নির্দিষ্ট জায়গায় তা দৃশ্যমান হবে।
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
