'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  Video,
  ChevronDown,
  Check,
  Calendar,
  ArrowUpDown,
  Filter
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

const TIME_FILTER_OPTIONS = [
  {
    id: 'Day',
    title: '24 Hours (Today)',
    subtitle: 'Hourly stream traffic & watch time',
    icon: Sparkles,
    badge: 'Today'
  },
  {
    id: 'Week',
    title: '7 Days (Past Week)',
    subtitle: 'Weekly stream reach & audience matrix',
    icon: Calendar,
    badge: '7 Days'
  },
  {
    id: 'Month',
    title: '30 Days (Past Month)',
    subtitle: 'Monthly retention & engagement growth',
    icon: BarChart3,
    badge: '30 Days'
  },
  {
    id: 'All',
    title: 'All Time (Lifetime)',
    subtitle: 'Platform-wide total historical consumption',
    icon: Clock,
    badge: 'All Time'
  }
] as const;

export default function AdminDashboard() {
  const [role, setRole] = useState<string>('superuser');
  const [timeFilter, setTimeFilter] = useState<'Day' | 'Week' | 'Month' | 'All'>('Week');
  const [loading, setLoading] = useState<boolean>(true);
  const [analytics, setAnalytics] = useState<any>(null);

  // Custom Popover Dropdown States
  const [isTimeFilterOpen, setIsTimeFilterOpen] = useState(false);
  const timeFilterRef = useRef<HTMLDivElement>(null);

  const [categorySortBy, setCategorySortBy] = useState<'watch_time' | 'views' | 'videos' | 'retention'>('watch_time');
  const [isCategorySortOpen, setIsCategorySortOpen] = useState(false);
  const categorySortRef = useRef<HTMLDivElement>(null);

  // Click Outside Listener for Popovers (Mouse and Touch)
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (timeFilterRef.current && !timeFilterRef.current.contains(e.target as Node)) {
        setIsTimeFilterOpen(false);
      }
      if (categorySortRef.current && !categorySortRef.current.contains(e.target as Node)) {
        setIsCategorySortOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside, { passive: true });
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

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

        {/* Custom Selection Pop-up Filter: Day, Week, Month, All */}
        <div className="relative self-start sm:self-auto" ref={timeFilterRef}>
          {(() => {
            const activeTimeOption = TIME_FILTER_OPTIONS.find(opt => opt.id === timeFilter) || TIME_FILTER_OPTIONS[1];
            const ActiveIcon = activeTimeOption.icon;

            return (
              <>
                <button
                  type="button"
                  onClick={() => setIsTimeFilterOpen(!isTimeFilterOpen)}
                  className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-[#141418] hover:bg-[#1b1b22] border border-zinc-700/80 hover:border-blue-500/60 text-white shadow-lg transition-all active:scale-95 group select-none"
                >
                  <div className="w-6 h-6 rounded-lg bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover:scale-105 transition-transform">
                    <ActiveIcon className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-left">
                    <div className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider leading-none">
                      Time Window
                    </div>
                    <div className="text-xs font-bold text-white leading-tight mt-0.5">
                      {activeTimeOption.title}
                    </div>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-zinc-400 ml-1 transition-transform duration-200 ${isTimeFilterOpen ? 'rotate-180 text-blue-400' : 'group-hover:text-white'}`} />
                </button>

                {/* Floating Custom Selection Pop-up Menu */}
                {isTimeFilterOpen && (
                  <div className="absolute left-0 sm:left-auto sm:right-0 mt-2 w-72 sm:w-80 max-w-[calc(100vw-2rem)] bg-[#121216]/95 backdrop-blur-xl border border-zinc-700/80 rounded-2xl p-1.5 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 space-y-1">
                    <div className="px-3 py-2 text-[11px] font-bold text-zinc-400 uppercase tracking-wider border-b border-zinc-800/80 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3 h-3 text-blue-400" />
                        Select Window
                      </span>
                      <span className="text-[10px] text-blue-400 font-mono">Real-Time Refresh</span>
                    </div>

                    {TIME_FILTER_OPTIONS.map((opt) => {
                      const Icon = opt.icon;
                      const isSelected = timeFilter === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => {
                            setTimeFilter(opt.id);
                            setIsTimeFilterOpen(false);
                          }}
                          className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-all text-left group ${
                            isSelected 
                              ? 'bg-blue-600/15 border border-blue-500/40 text-white' 
                              : 'hover:bg-zinc-800/60 text-zinc-300 hover:text-white border border-transparent'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                              isSelected 
                                ? 'bg-blue-600 text-white border-blue-500 shadow-sm' 
                                : 'bg-zinc-900 text-zinc-400 border-zinc-800 group-hover:text-white'
                            }`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className={`text-xs font-bold truncate ${isSelected ? 'text-blue-400 font-black' : 'text-white'}`}>
                                  {opt.title}
                                </span>
                                <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded border ${
                                  isSelected ? 'bg-blue-500/20 text-blue-300 border-blue-500/30 font-bold' : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                                }`}>
                                  {opt.badge}
                                </span>
                              </div>
                              <p className="text-[10px] text-zinc-400 truncate mt-0.5">
                                {opt.subtitle}
                              </p>
                            </div>
                          </div>

                          {isSelected && (
                            <Check className="w-4 h-4 text-blue-400 shrink-0 stroke-[3] ml-2" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </>
            );
          })()}
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

          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            {/* Custom Category Sort Popover */}
            <div className="relative" ref={categorySortRef}>
              <button
                type="button"
                onClick={() => setIsCategorySortOpen(!isCategorySortOpen)}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-xs font-semibold text-zinc-300 hover:text-white transition-all active:scale-95 shadow-sm"
              >
                <ArrowUpDown className="w-3.5 h-3.5 text-blue-400" />
                <span>
                  Sort:{' '}
                  <span className="text-white font-bold">
                    {categorySortBy === 'views'
                      ? 'Views'
                      : categorySortBy === 'videos'
                      ? 'Videos'
                      : categorySortBy === 'retention'
                      ? 'Retention'
                      : 'Watch Time'}
                  </span>
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 transition-transform ${isCategorySortOpen ? 'rotate-180' : ''}`} />
              </button>

              {isCategorySortOpen && (
                <div className="absolute left-0 sm:left-auto sm:right-0 mt-2 w-52 max-w-[calc(100vw-2rem)] bg-[#121216]/95 backdrop-blur-xl border border-zinc-700/80 rounded-xl p-1 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 space-y-0.5">
                  {[
                    { id: 'watch_time', label: 'Watch Time Share' },
                    { id: 'views', label: 'Total Views' },
                    { id: 'videos', label: 'Video Count' },
                    { id: 'retention', label: 'Avg Retention Rate' },
                  ].map((sOpt) => (
                    <button
                      key={sOpt.id}
                      type="button"
                      onClick={() => {
                        setCategorySortBy(sOpt.id as any);
                        setIsCategorySortOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                        categorySortBy === sOpt.id
                          ? 'bg-blue-600/20 text-blue-400 font-bold'
                          : 'text-zinc-300 hover:text-white hover:bg-zinc-800/60'
                      }`}
                    >
                      <span>{sOpt.label}</span>
                      {categorySortBy === sOpt.id && <Check className="w-3.5 h-3.5 text-blue-400 stroke-[3]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="text-xs font-mono text-zinc-400 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-xl">
              {categoryList.length} Categories
            </div>
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
              {[...categoryList].sort((a: any, b: any) => {
                if (categorySortBy === 'views') return (b.views || 0) - (a.views || 0);
                if (categorySortBy === 'videos') return (b.video_count || 0) - (a.video_count || 0);
                if (categorySortBy === 'retention') return (b.avg_watch_seconds || 0) - (a.avg_watch_seconds || 0);
                return (b.watch_time_percentage || 0) - (a.watch_time_percentage || 0);
              }).map((cat: any) => {
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
