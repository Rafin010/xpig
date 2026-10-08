'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { PlayCircle, UploadCloud, Eye, TrendingUp, Filter, Search, MoreVertical, CheckCircle2, XCircle } from 'lucide-react';

interface Video {
  id: string | number;
  title: string;
  creator_id: string | number;
  views: number;
  created_at?: string;
  status: string;
}

export default function VideoManagementPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchVideos() {
      try {
        const res = await fetch('http://127.0.0.1:8000/api/v1/videos/');
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        // The API returns an array directly
        if (Array.isArray(data)) {
          setVideos(data);
        } else {
          setVideos([]);
        }
      } catch (err) {
        console.error('Error fetching videos:', err);
        setVideos([]);
      } finally {
        setLoading(false);
      }
    }
    fetchVideos();
  }, []);

  const totalViews = videos.reduce((acc, vid) => acc + (vid.views || 0), 0);
  const activeVaultCount = videos.length;
  // using empty data array for charts
  const analyticsData: any[] = [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-zinc-800/50 pb-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Video Analytics & Management</h1>
          <p className="text-zinc-400 mt-1">Track upload trends, total views, and moderate content.</p>
        </div>
        <Link href="/admin/videos/upload" className="flex items-center gap-2 px-6 py-3 bg-pink-600 hover:bg-pink-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-pink-900/20">
          <UploadCloud className="w-5 h-5" />
          Direct Upload
        </Link>
      </div>

      {/* Analytics KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#111] border border-zinc-800/50 p-6 rounded-2xl flex flex-col justify-center shadow-xl">
          <div className="flex items-center gap-2 text-zinc-400 mb-2">
            <UploadCloud className="w-5 h-5 text-blue-500" /> <span className="font-semibold text-sm">Total Uploads</span>
          </div>
          <div className="text-4xl font-black text-white">{activeVaultCount}</div>
          <div className="text-xs text-green-400 mt-2 flex items-center gap-1"><TrendingUp className="w-3 h-3"/> Calculated dynamically</div>
        </div>
        <div className="bg-[#111] border border-zinc-800/50 p-6 rounded-2xl flex flex-col justify-center shadow-xl">
          <div className="flex items-center gap-2 text-zinc-400 mb-2">
            <Eye className="w-5 h-5 text-pink-500" /> <span className="font-semibold text-sm">Total Video Views</span>
          </div>
          <div className="text-4xl font-black text-white">{totalViews}</div>
          <div className="text-xs text-green-400 mt-2 flex items-center gap-1"><TrendingUp className="w-3 h-3"/> Across all fetched videos</div>
        </div>
        <div className="bg-[#111] border border-zinc-800/50 p-6 rounded-2xl flex flex-col justify-center shadow-xl">
          <div className="flex items-center gap-2 text-zinc-400 mb-2">
            <PlayCircle className="w-5 h-5 text-purple-500" /> <span className="font-semibold text-sm">Active Content Vault</span>
          </div>
          <div className="text-4xl font-black text-white">{activeVaultCount}</div>
          <div className="text-xs text-zinc-500 mt-2">Total fetched videos on platform</div>
        </div>
      </div>

      {/* Advanced Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Uploads Chart */}
        <div className="bg-[#111] border border-zinc-800/50 p-6 rounded-2xl shadow-xl">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-blue-500" /> Daily Upload Volume
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analyticsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="day" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{fill: '#18181b'}}
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}
                  itemStyle={{ color: '#3b82f6', fontWeight: 'bold' }}
                />
                <Bar dataKey="uploads" name="Videos Uploaded" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Views Chart */}
        <div className="bg-[#111] border border-zinc-800/50 p-6 rounded-2xl shadow-xl">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <Eye className="w-5 h-5 text-pink-500" /> Platform Views Trend
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analyticsData}>
                <defs>
                  <linearGradient id="colorViewsTrend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="day" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${val/1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}
                  itemStyle={{ color: '#ec4899', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="views" name="Total Views" stroke="#ec4899" strokeWidth={3} fillOpacity={1} fill="url(#colorViewsTrend)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Video Content Table */}
      <div className="bg-[#111] border border-zinc-800/50 rounded-2xl shadow-xl overflow-hidden flex flex-col">
        <div className="p-6 border-b border-zinc-800/50 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h3 className="text-xl font-bold text-white">Video Moderation Queue</h3>
          <div className="flex gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input type="text" placeholder="Search videos by title or uploader..." className="w-full bg-[#1a1a1a] border border-zinc-800 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-pink-500" />
            </div>
            <button className="p-2 bg-[#1a1a1a] border border-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors">
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto flex-1">
          {loading ? (
            <div className="p-8 text-center text-zinc-500">Loading videos...</div>
          ) : videos.length === 0 ? (
            <div className="p-8 text-center text-zinc-500">No videos found.</div>
          ) : (
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-[#161616] text-zinc-400 border-b border-zinc-800/50">
                <tr>
                  <th className="px-6 py-4 font-semibold">Video Title</th>
                  <th className="px-6 py-4 font-semibold">Creator ID</th>
                  <th className="px-6 py-4 font-semibold">Total Views</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50 text-zinc-300">
                {videos.map(vid => (
                  <tr key={vid.id} className="hover:bg-[#1a1a1a] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-bold text-white flex items-center gap-2">
                        <PlayCircle className="w-4 h-4 text-pink-500" />
                        {vid.title}
                      </div>
                      <div className="text-xs text-zinc-500 mt-0.5 ml-6">ID: {vid.id}</div>
                    </td>
                    <td className="px-6 py-4 text-zinc-400 font-medium">{vid.creator_id}</td>
                    <td className="px-6 py-4 font-semibold">{vid.views || 0}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded text-xs font-bold ${
                        vid.status === 'Published' || vid.status === 'published' ? 'bg-green-500/10 text-green-400' : 
                        vid.status === 'Pending Review' || vid.status === 'pending' ? 'bg-amber-500/10 text-amber-400' : 
                        'bg-red-500/10 text-red-500'
                      }`}>
                        {vid.status || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {(vid.status === 'Pending Review' || vid.status === 'pending') && (
                          <button className="p-2 text-zinc-500 hover:text-green-500 transition-colors bg-[#222] rounded-lg border border-zinc-700" title="Approve Video">
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        )}
                        <button className="p-2 text-zinc-500 hover:text-red-500 transition-colors bg-[#222] rounded-lg border border-zinc-700" title="Delete/Reject Video">
                          <XCircle className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-zinc-500 hover:text-white transition-colors bg-[#222] rounded-lg border border-zinc-700">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
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
