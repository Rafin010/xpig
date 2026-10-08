'use client';
import { useState } from 'react';
import { UploadCloud, Calendar, DollarSign, Target, Settings2, PlayCircle, Clock } from 'lucide-react';
import Link from 'next/link';

export default function CreateAdCampaign() {
  const [adType, setAdType] = useState('pre-roll');
  const [skippable, setSkippable] = useState(true);

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Create Ad Campaign</h1>
          <p className="text-zinc-400 mt-1">Configure delivery, targeting, and creatives for a new sponsor.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/ads" className="px-6 py-2.5 bg-[#1a1a1a] hover:bg-[#222] border border-zinc-800 text-white rounded-xl font-bold transition-all">Cancel</Link>
          <button className="px-6 py-2.5 bg-pink-600 hover:bg-pink-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-pink-900/20">Launch Campaign</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Config */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* General Info */}
          <div className="bg-[#111] border border-zinc-800/50 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-zinc-800/50 pb-4">
              <Settings2 className="w-5 h-5 text-pink-500" /> Basic Details
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-zinc-300">Campaign Name</label>
                <input type="text" placeholder="e.g. Summer Sale 2026" className="w-full bg-[#1a1a1a] border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-pink-600 transition-colors" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-zinc-300">Sponsor / Advertiser</label>
                <input type="text" placeholder="Sponsor Company Name" className="w-full bg-[#1a1a1a] border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-pink-600 transition-colors" />
              </div>
            </div>
            
            <div className="space-y-2 pt-2">
              <label className="text-sm font-semibold text-zinc-300">Ad Format</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'pre-roll', label: 'Pre-roll Video' },
                  { id: 'banner', label: 'Sidebar Banner' },
                  { id: 'overlay', label: 'In-Video Overlay' }
                ].map(type => (
                  <button 
                    key={type.id}
                    onClick={() => setAdType(type.id)}
                    className={`py-3 px-4 rounded-xl border font-semibold text-sm transition-all ${
                      adType === type.id 
                      ? 'bg-pink-600/10 border-pink-500 text-pink-400' 
                      : 'bg-[#1a1a1a] border-zinc-800 text-zinc-400 hover:border-zinc-600'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>
            
            {adType === 'pre-roll' && (
              <div className="flex items-center justify-between p-4 bg-[#1a1a1a] border border-zinc-800 rounded-xl mt-4">
                <div>
                  <h4 className="font-semibold text-white text-sm">Skippable Video Ad</h4>
                  <p className="text-xs text-zinc-500 mt-0.5">Allow users to skip the ad after 5 seconds.</p>
                </div>
                <button 
                  onClick={() => setSkippable(!skippable)}
                  className={`w-12 h-6 rounded-full transition-colors relative shrink-0 ${skippable ? 'bg-pink-600' : 'bg-zinc-700'}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${skippable ? 'translate-x-7' : 'translate-x-1'}`} />
                </button>
              </div>
            )}
          </div>

          {/* Delivery & Budget */}
          <div className="bg-[#111] border border-zinc-800/50 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-zinc-800/50 pb-4">
              <Calendar className="w-5 h-5 text-amber-500" /> Delivery Schedule & Budget
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-zinc-300">Start Date</label>
                <input type="date" className="w-full bg-[#1a1a1a] border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-300 focus:outline-none focus:border-pink-600 transition-colors [color-scheme:dark]" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-zinc-300">End Date</label>
                <input type="date" className="w-full bg-[#1a1a1a] border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-300 focus:outline-none focus:border-pink-600 transition-colors [color-scheme:dark]" />
              </div>
              <div className="space-y-2 mt-2">
                <label className="text-sm font-semibold text-zinc-300 flex items-center gap-1"><DollarSign className="w-4 h-4 text-zinc-500"/> Total Budget Cap</label>
                <input type="number" placeholder="0.00" className="w-full bg-[#1a1a1a] border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-pink-600 transition-colors" />
                <p className="text-xs text-zinc-500">Ad automatically stops when budget is reached.</p>
              </div>
            </div>
          </div>

          {/* Targeting */}
          <div className="bg-[#111] border border-zinc-800/50 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-zinc-800/50 pb-4">
              <Target className="w-5 h-5 text-blue-500" /> Audience Targeting
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-zinc-300">Target Devices</label>
                <select className="w-full bg-[#1a1a1a] border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-300 focus:outline-none focus:border-pink-600 transition-colors">
                  <option>All Devices (Desktop, Mobile, Tablet)</option>
                  <option>Mobile Only</option>
                  <option>Desktop Only</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-zinc-300">Content Tags (Show ad on specific videos)</label>
                <input type="text" placeholder="e.g. gaming, vlog, premium (leave blank for all)" className="w-full bg-[#1a1a1a] border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-pink-600 transition-colors" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-zinc-300">Target User Gender</label>
                <select className="w-full bg-[#1a1a1a] border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-300 focus:outline-none focus:border-pink-600 transition-colors">
                  <option>All Genders</option>
                  <option>Male</option>
                  <option>Female</option>
                </select>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Creative Upload */}
        <div className="space-y-6">
          <div className="bg-[#111] border border-zinc-800/50 rounded-2xl p-6 shadow-xl">
            <h3 className="text-lg font-bold text-white mb-4">Ad Creative</h3>
            
            <div className="border-2 border-dashed border-zinc-800 bg-[#1a1a1a] hover:bg-[#222] transition-colors rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer text-center mb-6">
              <UploadCloud className="w-10 h-10 text-pink-500 mb-3" />
              <h4 className="font-bold text-white text-sm mb-1">Upload Sponsor Creative</h4>
              <p className="text-xs text-zinc-500">
                {adType === 'pre-roll' ? 'MP4 or WebM (Max 50MB)' : 'JPG, PNG or GIF (Max 5MB)'}
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-300">Target URL (Click Destination)</label>
              <input type="url" placeholder="https://..." className="w-full bg-[#1a1a1a] border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-pink-600 transition-colors" />
            </div>
          </div>
          
          {/* Ad Preview (Mock) */}
          <div className="bg-[#111] border border-zinc-800/50 rounded-2xl p-6 shadow-xl">
            <h3 className="text-sm font-bold text-zinc-400 mb-4 uppercase tracking-wider">Live Preview</h3>
            
            {adType === 'pre-roll' && (
              <div className="w-full aspect-video bg-black rounded-lg relative overflow-hidden border border-zinc-800">
                <div className="absolute inset-0 flex items-center justify-center">
                  <PlayCircle className="w-12 h-12 text-white/20" />
                </div>
                {skippable && (
                  <div className="absolute bottom-4 right-4 bg-black/80 backdrop-blur border border-white/10 text-white text-xs px-3 py-1.5 rounded flex items-center gap-1.5 font-medium">
                    Skip Ad <Clock className="w-3 h-3" />
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-zinc-800">
                  <div className="h-full bg-pink-500 w-1/3"></div>
                </div>
              </div>
            )}
            
            {adType === 'banner' && (
              <div className="w-full h-32 bg-[#1a1a1a] border border-zinc-800 rounded-lg flex items-center justify-center">
                <span className="text-zinc-600 font-bold">300x250 Banner Space</span>
              </div>
            )}
            
          </div>
        </div>
        
      </div>
    </div>
  );
}
