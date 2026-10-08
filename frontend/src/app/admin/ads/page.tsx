'use client';
import Link from 'next/link';
import { Megaphone, Plus, Search, Filter, MousePointerClick, Eye, TrendingUp, MoreVertical, PlayCircle, Image as ImageIcon, Calendar, AlertCircle } from 'lucide-react';

const campaigns = [
  { id: 'CAMP-101', name: 'Summer Premium Sale', sponsor: 'PIG Internal', type: 'Pre-roll Video', status: 'Delivering', impressions: '1.2M', clicks: '45.2K', ctr: '3.7%', spend: '$1,200', target: 'Desktop, Mobile', endDate: 'Oct 30, 2026', daysLeft: 22, progress: 45 },
  { id: 'CAMP-102', name: 'Dating App Banner', sponsor: 'LoveConnect LLC', type: 'Sidebar Banner', status: 'Delivering', impressions: '850K', clicks: '12.4K', ctr: '1.4%', spend: '$450', target: 'Mobile Only', endDate: 'Oct 15, 2026', daysLeft: 7, progress: 85 },
  { id: 'CAMP-103', name: 'VPN Promotion', sponsor: 'SecureNet VPN', type: 'In-Video Overlay', status: 'Paused', impressions: '2.1M', clicks: '98K', ctr: '4.6%', spend: '$3,100', target: 'All Devices', endDate: 'Dec 01, 2026', daysLeft: 54, progress: 10 },
  { id: 'CAMP-104', name: 'Energy Drink Ad', sponsor: 'Boost Beverages', type: 'Pre-roll Video', status: 'Expired', impressions: '4.5M', clicks: '150K', ctr: '3.3%', spend: '$5,000', target: 'All Devices', endDate: 'Oct 01, 2026', daysLeft: 0, progress: 100 },
];

export default function AdManagementPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Ad Network Manager</h1>
          <p className="text-zinc-400 mt-1">Enterprise campaign management, targeting, and sponsor reporting.</p>
        </div>
        <Link href="/admin/ads/create" className="flex items-center gap-2 px-6 py-3 bg-pink-600 hover:bg-pink-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-pink-900/20">
          <Plus className="w-5 h-5" />
          Create Campaign
        </Link>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-[#111] border border-zinc-800/50 p-6 rounded-2xl flex flex-col justify-center">
          <div className="flex items-center gap-2 text-zinc-400 mb-2">
            <Megaphone className="w-5 h-5" /> <span className="font-semibold text-sm">Active Campaigns</span>
          </div>
          <div className="text-3xl font-black text-white">24</div>
          <div className="text-xs text-green-400 mt-2 flex items-center gap-1"><TrendingUp className="w-3 h-3"/> +3 this week</div>
        </div>
        <div className="bg-[#111] border border-zinc-800/50 p-6 rounded-2xl flex flex-col justify-center">
          <div className="flex items-center gap-2 text-zinc-400 mb-2">
            <Eye className="w-5 h-5" /> <span className="font-semibold text-sm">Total Impressions (30d)</span>
          </div>
          <div className="text-3xl font-black text-white">8.5M</div>
          <div className="text-xs text-green-400 mt-2 flex items-center gap-1"><TrendingUp className="w-3 h-3"/> +12.4% vs last month</div>
        </div>
        <div className="bg-[#111] border border-zinc-800/50 p-6 rounded-2xl flex flex-col justify-center">
          <div className="flex items-center gap-2 text-zinc-400 mb-2">
            <MousePointerClick className="w-5 h-5" /> <span className="font-semibold text-sm">Total Clicks (30d)</span>
          </div>
          <div className="text-3xl font-black text-white">312.6K</div>
          <div className="text-xs text-green-400 mt-2 flex items-center gap-1"><TrendingUp className="w-3 h-3"/> +8.2% vs last month</div>
        </div>
        <div className="bg-[#111] border border-zinc-800/50 p-6 rounded-2xl flex flex-col justify-center">
          <div className="flex items-center gap-2 text-zinc-400 mb-2">
            <AlertCircle className="w-5 h-5" /> <span className="font-semibold text-sm">Expiring Soon</span>
          </div>
          <div className="text-3xl font-black text-amber-500">3</div>
          <div className="text-xs text-zinc-500 mt-2">Campaigns ending in &lt; 7 days</div>
        </div>
      </div>

      {/* Campaigns Table */}
      <div className="bg-[#111] border border-zinc-800/50 rounded-2xl shadow-xl overflow-hidden flex flex-col">
        <div className="p-6 border-b border-zinc-800/50 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h3 className="text-xl font-bold text-white">Campaign Directory</h3>
          <div className="flex gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input type="text" placeholder="Search campaigns or sponsors..." className="w-full bg-[#1a1a1a] border border-zinc-800 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-pink-500" />
            </div>
            <button className="p-2 bg-[#1a1a1a] border border-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors">
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[#161616] text-zinc-400 border-b border-zinc-800/50">
              <tr>
                <th className="px-6 py-4 font-semibold">Campaign & Sponsor</th>
                <th className="px-6 py-4 font-semibold">Format</th>
                <th className="px-6 py-4 font-semibold">Delivery Progress</th>
                <th className="px-6 py-4 font-semibold">Performance</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50 text-zinc-300">
              {campaigns.map(camp => (
                <tr key={camp.id} className="hover:bg-[#1a1a1a] transition-colors group cursor-pointer">
                  <td className="px-6 py-4">
                    <Link href={`/admin/ads/${camp.id}`} className="block">
                      <div className="font-bold text-white group-hover:text-pink-400 transition-colors">{camp.name}</div>
                      <div className="text-xs text-zinc-500 mt-0.5">Sponsor: {camp.sponsor}</div>
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {camp.type.includes('Video') ? <PlayCircle className="w-4 h-4 text-pink-500" /> : <ImageIcon className="w-4 h-4 text-purple-500" />}
                      {camp.type}
                    </div>
                  </td>
                  <td className="px-6 py-4 min-w-[200px]">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-zinc-400 flex items-center gap-1"><Calendar className="w-3 h-3"/> {camp.endDate}</span>
                      <span className={camp.daysLeft > 0 && camp.daysLeft <= 7 ? 'text-amber-400 font-bold' : 'text-zinc-500'}>
                        {camp.daysLeft > 0 ? `${camp.daysLeft} days left` : 'Ended'}
                      </span>
                    </div>
                    <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${camp.status === 'Expired' ? 'bg-zinc-500' : camp.daysLeft <= 7 ? 'bg-amber-500' : 'bg-pink-500'}`} 
                        style={{ width: `${camp.progress}%` }}
                      ></div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-4">
                      <div>
                        <div className="text-xs text-zinc-500">Impr.</div>
                        <div className="font-semibold">{camp.impressions}</div>
                      </div>
                      <div>
                        <div className="text-xs text-zinc-500">CTR</div>
                        <div className="font-semibold text-emerald-400">{camp.ctr}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded text-xs font-bold ${
                      camp.status === 'Delivering' ? 'bg-green-500/10 text-green-400' : 
                      camp.status === 'Paused' ? 'bg-amber-500/10 text-amber-400' : 
                      'bg-zinc-800 text-zinc-400'
                    }`}>
                      {camp.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link href={`/admin/ads/${camp.id}`} className="px-3 py-1.5 bg-[#222] hover:bg-pink-600 text-white rounded text-xs font-semibold transition-colors">
                      View Report
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
