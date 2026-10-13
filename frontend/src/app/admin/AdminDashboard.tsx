'use client';

import React, { useState, useEffect } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar 
} from 'recharts';
import { 
  Eye, 
  DollarSign, 
  Users, 
  TrendingUp, 
  PlayCircle, 
  Clock, 
  Activity, 
  Sparkles,
  BarChart3,
  Layers,
  Flame,
  CheckCircle2,
  RefreshCw,
  Video
} from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://xpig.onrender.com';

const CATEGORY_COLORS: { [key: string]: string } = {
  'Deshi': '#3b82f6',
  'Hot': '#ef4444',
  'HD': '#10b981',
  'Viral': '#ec4899',
  'Trending': '#f59e0b',
  'Bangla': '#8b5cf6',
  'Couples': '#f43f5e',
  'Exclusive': '#6366f1',
  'Premium': '#eab308',
  'All': '#64748b'
};

export default function AdminDashboard() {
  const [role, setRole] = useState<string>('superuser');
  const [timeFilter, setTimeFilter] = useState<'Day' | 'Week' | 'Month' | 'All'>('Week');
  const [loading, setLoading] = useState<boolean>(true);
  const [analytics, setAnalytics] = useState<any>(null);

  // Load Admin Role from storage
  useEffect(() => {
    try {
      const storedRole = localStorage.getItem('xpig_admin_role');
      if (storedRole) setRole(storedRole);
    } catch {}
  }, []);

  // Fetch Comprehensive Analytics Overview with Time-Window Filter
  const fetchAnalytics = async () => {
    try {
      const roleParam = role === 'cofounder' ? '&role=cofounder' : '';
      const res = await fetch(
        `${API_BASE}/api/v1/admin/analytics/overview?time_range=${timeFilter.toLowerCase()}${roleParam}`
      );
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
      }
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 15000); // 15s auto polling for live data
    return () => clearInterval(interval);
  }, [timeFilter, role]);

  // Safe defaults
  const watchTime = analytics?.watch_time || {
    total_seconds: 0,
    total_hours: 0,
    formatted_total: '0s',
    all_time_seconds: 0,
    formatted_all_time: '0s',
    avg_seconds_per_view: 0,
    formatted_avg_per_view: '0s',
    avg_seconds_per_user: 0,
    formatted_avg_per_user: '0s'
  };

  const audience = analytics?.audience || {
    live_users: 0,
    today_visitors: 0,
    week_visitors: 0,
    month_visitors: 0,
    avg_daily_users: 0,
    avg_weekly_users: 0,
    avg_monthly_users: 0
  };

  const platform = analytics?.platform || {
    total_videos: 0,
    total_users: 0,
    total_views: 0,
    period_views: 0
  };

  const categoryList = analytics?.category_analytics || [];
  const trendChart = analytics?.trend_chart || [];
  const peakHours = analytics?.peak_hours || [];

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300 pb-12">
      
      {/* 1. Header & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <span>Mission Control Analytics</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 font-semibold font-mono">
              v2.0
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Real-time watch time, audience retention, and category intelligence
          </p>
        </div>

        {/* Time Filters: Day, Week, Month, All */}
        <div className="flex items-center gap-1 bg-[#141416] p-1 rounded-xl border border-zinc-800 self-start sm:self-auto shadow-inner">
          {(['Day', 'Week', 'Month', 'All'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setTimeFilter(filter)}
              className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                timeFilter === filter
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
              }`}
            >
              {filter === 'Day' ? '24h (Day)' : filter === 'Week' ? '7 Days (Week)' : filter === 'Month' ? '30 Days (Month)' : 'All Time'}
            </button>
          ))}
        </div>
      </div>

      {/* 2. WATCH TIME INTELLIGENCE CENTER (Dedicated Section Requested by User) */}
      <div className="bg-[#111114] border border-zinc-800/90 rounded-2xl p-4 sm:p-6 shadow-2xl relative overflow-hidden space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-2">
                Watch Time & Stream Consumption
              </h2>
              <p className="text-xs text-zinc-400">
                Filtered window: <span className="text-amber-400 font-semibold">{analytics?.period_label || '7 Days (This Week)'}</span>
              </p>
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-full text-[11px] font-mono text-zinc-400">
            <span>All-Time Total:</span>
            <span className="text-white font-bold">{watchTime.formatted_all_time}</span>
          </div>
        </div>

        {/* 3 Watch Time Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {/* Card 1: Total Watch Time */}
          <div className="bg-zinc-900/70 border border-zinc-800/80 hover:border-amber-500/40 p-4 sm:p-5 rounded-xl transition-all shadow-md group">
            <div className="flex items-center justify-between text-zinc-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                Total Watch Time
              </span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-3xl sm:text-4xl font-black text-white tracking-tight group-hover:scale-105 transition-transform duration-200">
              {watchTime.formatted_total}
            </div>
            <p className="text-[11px] text-zinc-400 mt-2 font-medium">
              ≈ {watchTime.total_hours} Hours total stream time ({timeFilter})
            </p>
          </div>

          {/* Card 2: Average Watch Time Per View */}
          <div className="bg-zinc-900/70 border border-zinc-800/80 hover:border-blue-500/40 p-4 sm:p-5 rounded-xl transition-all shadow-md group">
            <div className="flex items-center justify-between text-zinc-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400">
                Avg Watch Time / View
              </span>
              <Eye className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-3xl sm:text-4xl font-black text-white tracking-tight group-hover:scale-105 transition-transform duration-200">
              {watchTime.formatted_avg_per_view}
            </div>
            <p className="text-[11px] text-zinc-400 mt-2 font-medium">
              Average playback duration per user impression
            </p>
          </div>

          {/* Card 3: Average Watch Time Per User Session */}
          <div className="bg-zinc-900/70 border border-zinc-800/80 hover:border-emerald-500/40 p-4 sm:p-5 rounded-xl transition-all shadow-md group">
            <div className="flex items-center justify-between text-zinc-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                Avg Watch Time / User
              </span>
              <Users className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-3xl sm:text-4xl font-black text-white tracking-tight group-hover:scale-105 transition-transform duration-200">
              {watchTime.formatted_avg_per_user}
            </div>
            <p className="text-[11px] text-zinc-400 mt-2 font-medium">
              Average engagement per active visitor session
            </p>
          </div>
        </div>
      </div>

      {/* 3. AUDIENCE & USER FLOW TELEMETRY */}
      <div className="bg-[#111114] border border-zinc-800/90 rounded-2xl p-4 sm:p-6 shadow-2xl relative overflow-hidden space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shrink-0">
              <Activity className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-2">
                Audience & User Flow Telemetry
              </h2>
              <p className="text-xs text-zinc-400">
                Real-time concurrent sessions and calculated daily / weekly averages
              </p>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-full text-[11px] font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-emerald-400 font-bold">RADAR LIVE</span>
          </div>
        </div>

        {/* 4 Audience KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Card 1: Live Concurrent */}
          <div className="bg-zinc-900/70 border border-zinc-800/80 hover:border-emerald-500/40 p-4 rounded-xl transition-all shadow-md">
            <div className="flex items-center justify-between text-zinc-400 mb-1.5">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5 truncate">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Active Right Now
              </span>
              <Activity className="w-4 h-4 text-emerald-400 shrink-0" />
            </div>
            <div className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              {audience.live_users}
            </div>
            <p className="text-[10px] sm:text-xs text-zinc-400 mt-1.5 font-medium truncate">
              Live concurrent sessions
            </p>
          </div>

          {/* Card 2: Average Daily Users */}
          <div className="bg-zinc-900/70 border border-zinc-800/80 hover:border-blue-500/40 p-4 rounded-xl transition-all shadow-md">
            <div className="flex items-center justify-between text-zinc-400 mb-1.5">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-blue-400 truncate">
                Avg Users / Day
              </span>
              <Users className="w-4 h-4 text-blue-400 shrink-0" />
            </div>
            <div className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              {audience.avg_daily_users}
            </div>
            <p className="text-[10px] sm:text-xs text-zinc-400 mt-1.5 font-medium truncate">
              দৈনিক গড় ইউজার ভলিউম
            </p>
          </div>

          {/* Card 3: 7-Day Total Reach */}
          <div className="bg-zinc-900/70 border border-zinc-800/80 hover:border-purple-500/40 p-4 rounded-xl transition-all shadow-md">
            <div className="flex items-center justify-between text-zinc-400 mb-1.5">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-purple-400 truncate">
                7-Day Reach
              </span>
              <TrendingUp className="w-4 h-4 text-purple-400 shrink-0" />
            </div>
            <div className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              {audience.week_visitors.toLocaleString()}
            </div>
            <p className="text-[10px] sm:text-xs text-zinc-400 mt-1.5 font-medium truncate">
              সাপ্তাহিক ভিজিটর রিচ
            </p>
          </div>

          {/* Card 4: 30-Day Monthly Reach */}
          <div className="bg-zinc-900/70 border border-zinc-800/80 hover:border-pink-500/40 p-4 rounded-xl transition-all shadow-md">
            <div className="flex items-center justify-between text-zinc-400 mb-1.5">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-pink-400 truncate">
                30-Day Traffic
              </span>
              <Eye className="w-4 h-4 text-pink-400 shrink-0" />
            </div>
            <div className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              {audience.month_visitors.toLocaleString()}
            </div>
            <p className="text-[10px] sm:text-xs text-zinc-400 mt-1.5 font-medium truncate">
              মাসিক ইউনিক ভিজিটর
            </p>
          </div>
        </div>
      </div>

      {/* 4. CATEGORY INTELLIGENCE & ENGAGEMENT MATRIX (Core User Request) */}
      <div className="bg-[#111114] border border-zinc-800/90 rounded-2xl p-4 sm:p-6 shadow-2xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-2">
                Category Watch Time & Engagement Matrix
              </h2>
              <p className="text-xs text-zinc-400">
                ক্যাটাগরি ভিত্তিক ওয়াচ টাইম শেয়ার, ভিউ ও ইউজার ধরে রাখার হার (Retention Rate)
              </p>
            </div>
          </div>

          <div className="text-xs font-mono text-zinc-400 bg-zinc-900 border border-zinc-800 px-3 py-1 rounded-full self-start sm:self-auto">
            {categoryList.length} Categories Tracked
          </div>
        </div>

        {/* Category Performance Breakdown Table / Cards */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-[#18181c] text-zinc-400 font-semibold border-b border-zinc-800/80">
              <tr>
                <th className="px-4 py-3 rounded-l-xl">Category</th>
                <th className="px-4 py-3">Watch Time Share (% of Total)</th>
                <th className="px-4 py-3 text-right">Total Watch Time</th>
                <th className="px-4 py-3 text-right">Views</th>
                <th className="px-4 py-3 text-right">Videos</th>
                <th className="px-4 py-3 text-right rounded-r-xl">Avg Retention</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50 text-zinc-300">
              {categoryList.map((cat: any) => {
                const color = CATEGORY_COLORS[cat.name] || '#3b82f6';
                return (
                  <tr key={cat.name} className="hover:bg-zinc-900/50 transition-colors">
                    <td className="px-4 py-3.5 font-bold text-white flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: color }}
                      />
                      <span>{cat.name}</span>
                    </td>
                    <td className="px-4 py-3.5 min-w-[160px] sm:min-w-[200px]">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                          <div
                            className="h-full rounded-full transition-all duration-300"
                            style={{
                              width: `${cat.watch_time_percentage}%`,
                              backgroundColor: color
                            }}
                          />
                        </div>
                        <span className="font-mono text-xs font-bold text-white shrink-0">
                          {cat.watch_time_percentage}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono font-bold text-amber-400">
                      {cat.formatted_watch_time}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono text-white">
                      {cat.views.toLocaleString()}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono text-zinc-400">
                      {cat.video_count}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono font-semibold text-emerald-400">
                      {cat.formatted_avg_watch}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. VISUAL CHARTS (AreaChart & BarChart) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Watch Time vs Views Progression AreaChart */}
        <div className="lg:col-span-2 bg-[#111114] border border-zinc-800/90 p-4 sm:p-6 rounded-2xl shadow-2xl">
          <div className="flex items-center justify-between mb-4 sm:mb-6 pb-3 border-b border-zinc-800/80">
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-400" /> Watch Time & Views Trend
            </h3>
            <span className="text-xs text-zinc-400 font-mono">{timeFilter} Progression</span>
          </div>
          <div className="h-[220px] sm:h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendChart}>
                <defs>
                  <linearGradient id="colorWatchTime" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.35}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="name" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis yAxisId="left" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}`} />
                <YAxis yAxisId="right" orientation="right" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}h`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '10px' }}
                  itemStyle={{ fontWeight: 'bold' }}
                />
                <Area yAxisId="left" type="monotone" dataKey="views" name="Views" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorViews)" />
                <Area yAxisId="right" type="monotone" dataKey="watchTime" name="Watch Time (hrs)" stroke="#f59e0b" strokeWidth={2.5} fillOpacity={1} fill="url(#colorWatchTime)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Peak User Activity 24h BarChart */}
        <div className="bg-[#111114] border border-zinc-800/90 p-4 sm:p-6 rounded-2xl shadow-2xl flex flex-col">
          <div className="flex items-center justify-between mb-3 pb-3 border-b border-zinc-800/80">
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-400" /> Peak User Activity
            </h3>
            <span className="text-[11px] font-mono text-purple-400">24-Hour Cycle</span>
          </div>
          <p className="text-xs text-zinc-400 mb-4">Hourly visitor traffic throughout the day</p>
          
          <div className="h-[200px] sm:h-[240px] w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={peakHours}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="hour" stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{fill: '#18181b'}}
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}
                  itemStyle={{ color: '#c084fc', fontWeight: 'bold' }}
                />
                <Bar dataKey="active" name="Activity Score" fill="#a855f7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

    </div>
  );
}
