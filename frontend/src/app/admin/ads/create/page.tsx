'use client';
import { useState } from 'react';
import { Settings2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CreateAdCampaign() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [targetUrl, setTargetUrl] = useState('');
  const [badgeText, setBadgeText] = useState('SPONSORED');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !title || !thumbnailUrl || !targetUrl) {
      alert('Please fill in Sponsor Name, Campaign Title, Creative Thumbnail URL, and Target URL.');
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
          description,
          thumbnail_url: thumbnailUrl,
          target_url: targetUrl,
          badge_text: badgeText || 'SPONSORED',
          is_active: true
        })
      });

      if (res.ok) {
        alert('Sponsor Campaign Created Successfully!');
        router.push('/admin/ads');
      } else {
        alert('Failed to create campaign. Please verify backend connectivity.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error submitting campaign.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Create Sponsor Campaign</h1>
          <p className="text-zinc-400 mt-1">Configure creatives and landing destination for a new sponsor.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/ads" className="px-5 py-2.5 bg-[#1a1a1a] hover:bg-[#222] border border-zinc-800 text-white rounded-xl font-bold transition-all text-sm flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Cancel
          </Link>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-[#111] border border-zinc-800/50 rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-zinc-800/50 pb-4">
            <Settings2 className="w-5 h-5 text-amber-500" /> Campaign Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-300">Campaign Title *</label>
              <input 
                type="text" 
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Exclusive Premium VPN Deal" 
                className="w-full bg-[#1a1a1a] border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-zinc-500 transition-colors" 
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-300">Sponsor / Brand Name *</label>
              <input 
                type="text" 
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. NordVPN" 
                className="w-full bg-[#1a1a1a] border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-zinc-500 transition-colors" 
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-zinc-300">Short Description</label>
            <input 
              type="text" 
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="e.g. Get 70% off with 3 months extra free" 
              className="w-full bg-[#1a1a1a] border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-zinc-500 transition-colors" 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-300">Banner / Creative Image URL *</label>
              <input 
                type="url" 
                value={thumbnailUrl}
                onChange={e => setThumbnailUrl(e.target.value)}
                placeholder="https://... (16:9 ratio recommended)" 
                className="w-full bg-[#1a1a1a] border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-zinc-500 transition-colors" 
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-300">Target Destination URL *</label>
              <input 
                type="url" 
                value={targetUrl}
                onChange={e => setTargetUrl(e.target.value)}
                placeholder="https://sponsor-landing-page.com" 
                className="w-full bg-[#1a1a1a] border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-zinc-500 transition-colors" 
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-zinc-300">Badge Text</label>
            <input 
              type="text" 
              value={badgeText}
              onChange={e => setBadgeText(e.target.value)}
              placeholder="SPONSORED" 
              className="w-full bg-[#1a1a1a] border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-zinc-500 transition-colors" 
            />
          </div>

          <div className="pt-4 flex justify-end">
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="px-8 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-bold transition-all border border-zinc-700 shadow-lg disabled:opacity-50"
            >
              {isSubmitting ? 'Launching...' : 'Launch Campaign'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
