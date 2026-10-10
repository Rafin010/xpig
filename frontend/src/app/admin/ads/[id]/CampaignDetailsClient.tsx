'use client';
import { useParams } from 'next/navigation';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Download, ArrowLeft, Megaphone, MousePointerClick, Eye, TrendingUp, Calendar, AlertCircle } from 'lucide-react';
import Link from 'next/link';

const performanceData = [
  { day: 'Oct 01', impressions: 45000, clicks: 1200 },
  { day: 'Oct 02', impressions: 52000, clicks: 1400 },
  { day: 'Oct 03', impressions: 48000, clicks: 1350 },
  { day: 'Oct 04', impressions: 61000, clicks: 1800 },
  { day: 'Oct 05', impressions: 59000, clicks: 1750 },
  { day: 'Oct 06', impressions: 65000, clicks: 2100 },
  { day: 'Oct 07', impressions: 72000, clicks: 2400 },
];

export default function CampaignDetailsClient({ id }: { id: string }) {
  
  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4 border-b border-zinc-800/50 pb-6">
        <div>
          <Link href="/admin/ads" className="text-zinc-500 hover:text-white flex items-center gap-1 text-sm font-semibold mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Campaigns
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <span className="px-2.5 py-1 bg-green-500/10 text-green-400 rounded text-xs font-bold uppercase tracking-wider">Delivering</span>
            <span className="text-sm text-zinc-500 font-mono">{id}</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Summer Premium Sale</h1>
          <p className="text-zinc-400 mt-1">Sponsor: <span className="text-white font-medium">PIG Internal</span></p>
        </div>
        <div className="flex gap-3">
          <button className="px-5 py-2.5 bg-[#1a1a1a] hover:bg-[#222] border border-zinc-800 text-white rounded-xl font-bold transition-all">Pause Campaign</button>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-pink-600 hover:bg-pink-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-pink-900/20">
            <Download className="w-4 h-4" /> Export Sponsor Report
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-[#111] border border-zinc-800/50 p-6 rounded-2xl flex flex-col justify-center">
          <div className="flex items-center gap-2 text-zinc-400 mb-2">
            <Eye className="w-5 h-5" /> <span className="font-semibold text-sm">Total Impressions</span>
          </div>
          <div className="text-3xl font-black text-white">1.2M</div>
        </div>
        <div className="bg-[#111] border border-zinc-800/50 p-6 rounded-2xl flex flex-col justify-center">
          <div className="flex items-center gap-2 text-zinc-400 mb-2">
            <MousePointerClick className="w-5 h-5" /> <span className="font-semibold text-sm">Total Clicks</span>
          </div>
          <div className="text-3xl font-black text-white">45.2K</div>
        </div>
        <div className="bg-[#111] border border-zinc-800/50 p-6 rounded-2xl flex flex-col justify-center">
          <div className="flex items-center gap-2 text-zinc-400 mb-2">
            <TrendingUp className="w-5 h-5" /> <span className="font-semibold text-sm">Average CTR</span>
          </div>
          <div className="text-3xl font-black text-emerald-400">3.7%</div>
        </div>
        <div className="bg-[#111] border border-zinc-800/50 p-6 rounded-2xl flex flex-col justify-center">
          <div className="flex items-center gap-2 text-zinc-400 mb-2">
            <Calendar className="w-5 h-5" /> <span className="font-semibold text-sm">Days Remaining</span>
          </div>
          <div className="text-3xl font-black text-white">22</div>
          <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden mt-3">
            <div className="h-full bg-pink-500 rounded-full w-[45%]"></div>
          </div>
        </div>
      </div>

      {/* Main Chart */}
      <div className="bg-[#111] border border-zinc-800/50 p-6 rounded-2xl shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-white">Campaign Performance (Last 7 Days)</h3>
        </div>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={performanceData}>
              <defs>
                <linearGradient id="colorImpressions" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <XAxis dataKey="day" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis yAxisId="left" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${val/1000}k`} />
              <YAxis yAxisId="right" orientation="right" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}
                itemStyle={{ fontWeight: 'bold' }}
              />
              <Area yAxisId="left" type="monotone" dataKey="impressions" name="Impressions" stroke="#ec4899" strokeWidth={3} fillOpacity={1} fill="url(#colorImpressions)" />
              <Area yAxisId="right" type="monotone" dataKey="clicks" name="Clicks" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorClicks)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#111] border border-zinc-800/50 p-6 rounded-2xl shadow-xl">
          <h3 className="text-lg font-bold text-white mb-4">Targeting Configuration</h3>
          <ul className="space-y-3 text-sm">
            <li className="flex justify-between py-2 border-b border-zinc-800/50">
              <span className="text-zinc-400">Format</span>
              <span className="text-white font-medium">Pre-roll Video (Skippable)</span>
            </li>
            <li className="flex justify-between py-2 border-b border-zinc-800/50">
              <span className="text-zinc-400">Devices</span>
              <span className="text-white font-medium">Desktop, Mobile</span>
            </li>
            <li className="flex justify-between py-2 border-b border-zinc-800/50">
              <span className="text-zinc-400">Gender Targeting</span>
              <span className="text-white font-medium">All Genders</span>
            </li>
            <li className="flex justify-between py-2 border-b border-zinc-800/50">
              <span className="text-zinc-400">Tags Filtering</span>
              <span className="text-white font-medium">premium, exclusive</span>
            </li>
          </ul>
        </div>
        
        <div className="bg-[#111] border border-zinc-800/50 p-6 rounded-2xl shadow-xl">
          <h3 className="text-lg font-bold text-white mb-4">Budget & Pacing</h3>
          <ul className="space-y-3 text-sm">
            <li className="flex justify-between py-2 border-b border-zinc-800/50">
              <span className="text-zinc-400">Total Budget</span>
              <span className="text-white font-medium">$5,000.00</span>
            </li>
            <li className="flex justify-between py-2 border-b border-zinc-800/50">
              <span className="text-zinc-400">Spend to Date</span>
              <span className="text-emerald-400 font-medium">$1,200.00</span>
            </li>
            <li className="flex justify-between py-2 border-b border-zinc-800/50">
              <span className="text-zinc-400">Start Date</span>
              <span className="text-white font-medium">Oct 01, 2026</span>
            </li>
            <li className="flex justify-between py-2 border-b border-zinc-800/50">
              <span className="text-zinc-400">End Date</span>
              <span className="text-white font-medium">Oct 30, 2026</span>
            </li>
          </ul>
        </div>
      </div>

    </div>
  );
}


