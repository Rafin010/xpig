'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Megaphone, Plus, Search, MousePointerClick, Eye, Trash2, ExternalLink, Power } from 'lucide-react';

export default function AdManagementPage() {
  const [sponsors, setSponsors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'banner' | 'feed'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchSponsors = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('https://xpig.onrender.com/api/v1/sponsors/?include_inactive=true');
      if (res.ok) {
        setSponsors(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSponsors();
  }, []);

  const handleToggle = async (id: number) => {
    try {
      const res = await fetch(`https://xpig.onrender.com/api/v1/sponsors/${id}/toggle`, { method: 'PATCH' });
      if (res.ok) {
        const data = await res.json();
        setSponsors(prev => prev.map(s => s.id === id ? { ...s, is_active: data.is_active } : s));
      }
    } catch (e) {
      alert('Failed to toggle status');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to permanently delete this sponsor campaign?')) return;
    try {
      const res = await fetch(`https://xpig.onrender.com/api/v1/sponsors/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSponsors(prev => prev.filter(s => s.id !== id));
      }
    } catch (e) {
      alert('Failed to delete sponsor');
    }
  };

  const filteredSponsors = sponsors.filter(s => {
    const matchesTab = activeTab === 'all' || s.placement === activeTab || s.placement === 'all';
    const matchesSearch = !searchQuery || 
      (s.name && s.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.title && s.title.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesTab && matchesSearch;
  });

  const totalImpressions = sponsors.reduce((acc, s) => acc + (s.impressions || 0), 0);
  const totalClicks = sponsors.reduce((acc, s) => acc + (s.clicks || 0), 0);
  const activeCount = sponsors.filter(s => s.is_active).length;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Sponsor & Ad Network Manager</h1>
          <p className="text-zinc-400 mt-1">Upload and manage homepage billboard banners and video grid sponsor cards.</p>
        </div>
        <Link 
          href="/admin/ads/create" 
          className="flex items-center gap-2 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-bold transition-all border border-zinc-700 shadow-md"
        >
          <Plus className="w-5 h-5" />
          Add New Sponsor
        </Link>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#111] border border-zinc-800/50 p-6 rounded-2xl flex flex-col justify-center">
          <div className="flex items-center gap-2 text-zinc-400 mb-2">
            <Megaphone className="w-5 h-5 text-amber-500" /> <span className="font-semibold text-sm">Active Campaigns</span>
          </div>
          <div className="text-3xl font-black text-white">{activeCount}</div>
          <div className="text-xs text-zinc-500 mt-2">{sponsors.length} total campaigns in database</div>
        </div>

        <div className="bg-[#111] border border-zinc-800/50 p-6 rounded-2xl flex flex-col justify-center">
          <div className="flex items-center gap-2 text-zinc-400 mb-2">
            <Eye className="w-5 h-5 text-blue-500" /> <span className="font-semibold text-sm">Total Impressions</span>
          </div>
          <div className="text-3xl font-black text-white">{totalImpressions}</div>
          <div className="text-xs text-zinc-500 mt-2">Verified views across website</div>
        </div>

        <div className="bg-[#111] border border-zinc-800/50 p-6 rounded-2xl flex flex-col justify-center">
          <div className="flex items-center gap-2 text-zinc-400 mb-2">
            <MousePointerClick className="w-5 h-5 text-emerald-500" /> <span className="font-semibold text-sm">Total Clicks</span>
          </div>
          <div className="text-3xl font-black text-white">{totalClicks}</div>
          <div className="text-xs text-zinc-500 mt-2">
            CTR: {totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(1) : 0}%
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-[#111] border border-zinc-800/50 rounded-2xl shadow-xl overflow-hidden flex flex-col">
        {/* Header with Search and Placement Filter Tabs */}
        <div className="p-6 border-b border-zinc-800/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-2 bg-[#18181b] p-1 rounded-xl border border-zinc-800">
            <button 
              onClick={() => setActiveTab('all')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'all' ? 'bg-zinc-700 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
              }`}
            >
              All ({sponsors.length})
            </button>
            <button 
              onClick={() => setActiveTab('banner')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'banner' ? 'bg-zinc-700 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Top Banners
            </button>
            <button 
              onClick={() => setActiveTab('feed')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'feed' ? 'bg-zinc-700 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Feed Cards
            </button>
          </div>

          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Filter sponsors..." 
              className="w-full bg-[#1a1a1a] border border-zinc-800 rounded-lg pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-zinc-500" 
            />
          </div>
        </div>
        
        {/* Table Body */}
        <div className="overflow-x-auto flex-1">
          {isLoading ? (
            <div className="p-12 text-center text-zinc-500">Loading campaigns...</div>
          ) : filteredSponsors.length === 0 ? (
            <div className="p-12 text-center text-zinc-500 flex flex-col items-center justify-center">
              <Megaphone className="w-12 h-12 text-zinc-700 mb-3" />
              <p className="text-base font-semibold text-zinc-300">No sponsor campaigns found.</p>
              <p className="text-xs text-zinc-500 mt-1 max-w-md">
                When you don't have active sponsors, the website automatically hides all sponsor placements with 0 placeholder clutter.
              </p>
              <Link 
                href="/admin/ads/create" 
                className="mt-4 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs font-bold border border-zinc-700"
              >
                Add Your First Sponsor
              </Link>
            </div>
          ) : (
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-[#161616] text-zinc-400 border-b border-zinc-800/50">
                <tr>
                  <th className="px-6 py-4 font-semibold">Sponsor & Campaign</th>
                  <th className="px-6 py-4 font-semibold">Placement</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Clicks / Impr.</th>
                  <th className="px-6 py-4 font-semibold">Destination URL</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50 text-zinc-300">
                {filteredSponsors.map(camp => (
                  <tr key={camp.id} className="hover:bg-[#1a1a1a] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {camp.thumbnail_url ? (
                          <img src={camp.thumbnail_url} alt="" className="w-14 h-9 rounded-[6px] object-cover border border-zinc-800 shrink-0" />
                        ) : (
                          <div className="w-14 h-9 rounded-[6px] bg-zinc-800 flex items-center justify-center text-[10px] text-zinc-500">
                            NO IMG
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-white text-sm">{camp.title}</div>
                          <div className="text-xs text-zinc-500">Brand: {camp.name}</div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                        camp.placement === 'banner'
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          : camp.placement === 'feed'
                          ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}>
                        {camp.placement === 'banner' ? 'Billboard' : camp.placement === 'feed' ? 'Feed Card' : 'All Placements'}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <button 
                        onClick={() => handleToggle(camp.id)}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                          camp.is_active 
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30' 
                            : 'bg-zinc-800 text-zinc-400 border border-zinc-700 hover:bg-zinc-700'
                        }`}
                        title="Click to toggle active status"
                      >
                        <Power className="w-3 h-3" />
                        <span>{camp.is_active ? 'Active' : 'Paused'}</span>
                      </button>
                    </td>

                    <td className="px-6 py-4">
                      <div className="text-xs">
                        <span className="font-bold text-white">{camp.clicks || 0}</span> clicks / <span className="text-zinc-500">{camp.impressions || 0} impr.</span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <a 
                        href={camp.target_url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="flex items-center gap-1 text-xs text-blue-400 hover:underline max-w-[220px] truncate"
                      >
                        <span className="truncate">{camp.target_url}</span>
                        <ExternalLink className="w-3 h-3 shrink-0" />
                      </a>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleDelete(camp.id)} 
                        className="p-2 text-zinc-500 hover:text-red-400 transition-colors"
                        title="Delete Sponsor"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
