'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Megaphone, Plus, Search, Filter, MousePointerClick, Eye, TrendingUp, Trash2, ExternalLink } from 'lucide-react';

export default function AdManagementPage() {
  const [sponsors, setSponsors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSponsors = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('https://xpig.onrender.com/api/v1/sponsors/');
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

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to remove this sponsor campaign?')) return;
    try {
      const res = await fetch(`https://xpig.onrender.com/api/v1/sponsors/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSponsors(prev => prev.filter(s => s.id !== id));
      }
    } catch (e) {
      alert('Failed to delete sponsor');
    }
  };

  const totalImpressions = sponsors.reduce((acc, s) => acc + (s.impressions || 0), 0);
  const totalClicks = sponsors.reduce((acc, s) => acc + (s.clicks || 0), 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Ad & Sponsor Manager</h1>
          <p className="text-zinc-400 mt-1">Manage active homepage sponsor cards and banner placements.</p>
        </div>
        <Link href="/admin/ads/create" className="flex items-center gap-2 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-bold transition-all border border-zinc-700">
          <Plus className="w-5 h-5" />
          Create Campaign
        </Link>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#111] border border-zinc-800/50 p-6 rounded-2xl flex flex-col justify-center">
          <div className="flex items-center gap-2 text-zinc-400 mb-2">
            <Megaphone className="w-5 h-5 text-amber-500" /> <span className="font-semibold text-sm">Active Campaigns</span>
          </div>
          <div className="text-3xl font-black text-white">{sponsors.length}</div>
          <div className="text-xs text-zinc-500 mt-2">Displaying on homepage feed</div>
        </div>

        <div className="bg-[#111] border border-zinc-800/50 p-6 rounded-2xl flex flex-col justify-center">
          <div className="flex items-center gap-2 text-zinc-400 mb-2">
            <Eye className="w-5 h-5 text-blue-500" /> <span className="font-semibold text-sm">Total Impressions</span>
          </div>
          <div className="text-3xl font-black text-white">{totalImpressions}</div>
          <div className="text-xs text-zinc-500 mt-2">Tracked impressions across platform</div>
        </div>

        <div className="bg-[#111] border border-zinc-800/50 p-6 rounded-2xl flex flex-col justify-center">
          <div className="flex items-center gap-2 text-zinc-400 mb-2">
            <MousePointerClick className="w-5 h-5 text-emerald-500" /> <span className="font-semibold text-sm">Total Clicks</span>
          </div>
          <div className="text-3xl font-black text-white">{totalClicks}</div>
          <div className="text-xs text-zinc-500 mt-2">Direct clicks to sponsor destinations</div>
        </div>
      </div>

      {/* Campaigns Table */}
      <div className="bg-[#111] border border-zinc-800/50 rounded-2xl shadow-xl overflow-hidden flex flex-col">
        <div className="p-6 border-b border-zinc-800/50 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h3 className="text-xl font-bold text-white">Active Sponsor Directory</h3>
          <span className="text-xs text-zinc-500">
            {sponsors.length === 0 ? "No sponsors active (Homepage shows 0 sponsor cards)" : `${sponsors.length} sponsors currently live`}
          </span>
        </div>
        
        <div className="overflow-x-auto flex-1">
          {isLoading ? (
            <div className="p-12 text-center text-zinc-500">Loading sponsors...</div>
          ) : sponsors.length === 0 ? (
            <div className="p-12 text-center text-zinc-500 flex flex-col items-center justify-center">
              <Megaphone className="w-12 h-12 text-zinc-700 mb-3" />
              <p className="text-base font-semibold text-zinc-400">No active sponsors found in database.</p>
              <p className="text-xs text-zinc-600 mt-1 max-w-md">
                Because there are no sponsors uploaded, the homepage video grid cleanly displays 0 sponsor cards without any dummy placeholders.
              </p>
              <Link href="/admin/ads/create" className="mt-4 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs font-bold border border-zinc-700">
                Add New Sponsor
              </Link>
            </div>
          ) : (
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-[#161616] text-zinc-400 border-b border-zinc-800/50">
                <tr>
                  <th className="px-6 py-4 font-semibold">Campaign & Sponsor</th>
                  <th className="px-6 py-4 font-semibold">Badge</th>
                  <th className="px-6 py-4 font-semibold">Clicks / Impr.</th>
                  <th className="px-6 py-4 font-semibold">Target URL</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50 text-zinc-300">
                {sponsors.map(camp => (
                  <tr key={camp.id} className="hover:bg-[#1a1a1a] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {camp.thumbnail_url && (
                          <img src={camp.thumbnail_url} alt="" className="w-12 h-8 rounded object-cover border border-zinc-800" />
                        )}
                        <div>
                          <div className="font-bold text-white">{camp.title}</div>
                          <div className="text-xs text-zinc-500">Sponsor: {camp.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                        {camp.badge_text || 'SPONSORED'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs">
                        <span className="font-bold text-white">{camp.clicks || 0}</span> clicks / <span className="text-zinc-500">{camp.impressions || 0} impr.</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <a href={camp.target_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-blue-400 hover:underline max-w-[200px] truncate">
                        <span>{camp.target_url}</span>
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
