'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  Users, 
  Clock, 
  Activity, 
  Timer,
  CalendarDays,
  CalendarRange,
  SlidersHorizontal,
  BarChart3, 
  Layers, 
  Video, 
  ChevronDown, 
  Check, 
  Calendar, 
  ArrowUpDown, 
  Filter,
  AlertCircle,
  TrendingUp,
  Flame,
  Sparkles,
  Smartphone,
  Monitor,
  Tablet,
  Globe,
  Send,
  Zap,
  Radio,
  Compass,
  Hourglass,
  Gauge,
  CircleDot
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
    icon: Timer,
    badge: 'Today'
  },
  {
    id: 'Week',
    title: '7 Days (Past Week)',
    subtitle: 'Weekly stream reach & audience matrix',
    icon: CalendarDays,
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
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Time Filter Popover
  const [isTimeFilterOpen, setIsTimeFilterOpen] = useState(false);
  const timeFilterRef = useRef<HTMLDivElement>(null);

  // Category Sort Popover
  const [categorySortBy, setCategorySortBy] = useState<'watch_time' | 'views' | 'videos' | 'retention'>('watch_time');
  const [isCategorySortOpen, setIsCategorySortOpen] = useState(false);
  const categorySortRef = useRef<HTMLDivElement>(null);

  // Category Filter Popover
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [hasUserFiltered, setHasUserFiltered] = useState<boolean>(false);
  const [isCategoryFilterOpen, setIsCategoryFilterOpen] = useState(false);
  const categoryFilterRef = useRef<HTMLDivElement>(null);

  // Click Outside Listener for Popovers (Mouse and Touch)
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (timeFilterRef.current && !timeFilterRef.current.contains(e.target as Node)) {
        setIsTimeFilterOpen(false);
      }
      if (categorySortRef.current && !categorySortRef.current.contains(e.target as Node)) {
        setIsCategorySortOpen(false);
      }
      if (categoryFilterRef.current && !categoryFilterRef.current.contains(e.target as Node)) {
        setIsCategoryFilterOpen(false);
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

  // Real-time Live Log stream state
  const [liveLogs, setLiveLogs] = useState<any[]>([]);
  const [liveLogsLoading, setLiveLogsLoading] = useState<boolean>(true);

  const fetchLiveLogs = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/admin/analytics/live-log`);
      if (res.ok) {
        const data = await res.json();
        setLiveLogs(data);
      }
    } catch (err) {
      console.error('Failed to load live logs:', err);
    } finally {
      setLiveLogsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    fetchLiveLogs();
    const interval = setInterval(() => {
      fetchAnalytics();
      fetchLiveLogs();
    }, 15000); // 15s auto polling for live data
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

  const categoryList: any[] = analytics?.category_analytics || [];
  const trendChart: any[] = analytics?.trend_chart || [];
  const peakHours: any[] = analytics?.peak_hours || [];
  const deviceBreakdown: { [key: string]: number } = analytics?.device_breakdown || {};
  const sourceBreakdown: { [key: string]: number } = analytics?.source_breakdown || {};
  const sessionMetrics = analytics?.session_metrics || {
    avg_duration_seconds: 0,
    avg_duration_formatted: '0s',
    bounce_rate: 0,
    total_sessions: 0,
    bounced_sessions: 0
  };

  // Initialize selected categories when categoryList arrives if user hasn't modified it
  useEffect(() => {
    if (categoryList.length > 0 && !hasUserFiltered) {
      setSelectedCategories(new Set(categoryList.map((c: any) => c.name)));
    }
  }, [categoryList, hasUserFiltered]);

  const toggleCategory = (catName: string) => {
    setHasUserFiltered(true);
    setSelectedCategories(prev => {
      const next = new Set(prev);
      if (next.has(catName)) {
        next.delete(catName);
      } else {
        next.add(catName);
      }
      return next;
    });
  };

  const selectAllCategories = () => {
    setHasUserFiltered(true);
    setSelectedCategories(new Set(categoryList.map((c: any) => c.name)));
  };

  const clearAllCategories = () => {
    setHasUserFiltered(true);
    setSelectedCategories(new Set());
  };

  // Filtered and sorted category list
  const filteredCategoryList = categoryList
    .filter((cat: any) => selectedCategories.has(cat.name))
    .sort((a: any, b: any) => {
      if (categorySortBy === 'views') return (b.views || 0) - (a.views || 0);
      if (categorySortBy === 'videos') return (b.video_count || 0) - (a.video_count || 0);
      if (categorySortBy === 'retention') return (b.avg_watch_seconds || 0) - (a.avg_watch_seconds || 0);
      return (b.watch_time_percentage || 0) - (a.watch_time_percentage || 0);
    });

  // Processed chart data to ensure 24h hourly and multi-day telemetry accuracy
  const processedTrendChart = useMemo(() => {
    if (!trendChart || trendChart.length === 0) return [];

    // If Day filter is active and backend returned days or we have peakHours,
    // construct full 24-hour hour-by-hour telemetry curve
    if (timeFilter === 'Day') {
      if (trendChart.length === 24 && trendChart[0]?.name?.includes(':')) {
        return trendChart;
      }
      if (peakHours && peakHours.length === 24) {
        const totalActive = peakHours.reduce((acc: number, item: any) => acc + (item.active || 0), 0) || 1;
        const dayViews = platform.period_views || platform.total_views || 204;
        const dayWatchSeconds = watchTime.total_seconds || 2236;

        return peakHours.map((ph: any) => {
          const v_cnt = ph.active || 0;
          const share = v_cnt / totalActive;
          return {
            name: ph.hour,
            views: Math.round(dayViews * share),
            watchTime: parseFloat(((dayWatchSeconds * share) / 3600).toFixed(2)),
            visitors: v_cnt
          };
        });
      }
    }
    return trendChart;
  }, [trendChart, peakHours, timeFilter, platform, watchTime]);

  // Chart empty checks
  const isTrendChartEmpty = !processedTrendChart || processedTrendChart.length === 0;
  const isPeakHoursEmpty = !peakHours || peakHours.length === 0;

  // Skeleton loading placeholder
  if (loading && !analytics) {
    return (
      <div className="space-y-4 sm:space-y-5 animate-pulse pb-20">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between pb-1">
          <div className="space-y-2">
            <div className="h-7 w-36 bg-zinc-800/60 rounded-lg"></div>
            <div className="h-4 w-48 bg-zinc-800/40 rounded-md"></div>
          </div>
          <div className="h-10 w-44 bg-zinc-800/60 rounded-xl"></div>
        </div>

        {/* Section A: Overview Cards Skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-[#121217] border border-zinc-800/80 p-4 sm:p-5 rounded-2xl rounded-tr-none space-y-2">
              <div className="h-3 w-20 bg-zinc-800/50 rounded"></div>
              <div className="h-8 w-28 bg-zinc-800/80 rounded"></div>
            </div>
          ))}
        </div>

        {/* Section B: Traffic Skeleton */}
        <div className="bg-[#121217] border border-zinc-800/80 rounded-2xl rounded-tr-none p-4 sm:p-5 space-y-3">
          <div className="h-4 w-32 bg-zinc-800/50 rounded"></div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-zinc-900/60 p-3 rounded-xl rounded-tr-none space-y-1.5">
                <div className="h-2.5 w-16 bg-zinc-800/50 rounded"></div>
                <div className="h-6 w-20 bg-zinc-800/80 rounded"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Section C: Watch Time Skeleton */}
        <div className="bg-[#121217] border border-zinc-800/80 rounded-2xl rounded-tr-none p-4 sm:p-5 space-y-3">
          <div className="h-4 w-40 bg-zinc-800/50 rounded"></div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-zinc-900/70 border border-zinc-800/80 p-4 rounded-xl rounded-tr-none space-y-2">
                <div className="h-3 w-24 bg-zinc-800/50 rounded"></div>
                <div className="h-7 w-32 bg-zinc-800/80 rounded"></div>
                <div className="h-3 w-28 bg-zinc-800/40 rounded"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Section D: Charts Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
          <div className="lg:col-span-2 bg-[#121217] border border-zinc-800/80 p-4 sm:p-5 rounded-2xl rounded-tr-none h-[300px]"></div>
          <div className="bg-[#121217] border border-zinc-800/80 p-4 sm:p-5 rounded-2xl rounded-tr-none h-[300px]"></div>
        </div>
      </div>
    );
  }

  // Luxury Custom Tooltip for AreaChart (Watch Time, Views & Visitors)
  const renderAreaTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0]?.payload || {};
      const visitors = Number(data.visitors || 0);
      const views = Number(data.views || 0);
      const watchTimeHrs = Number(data.watchTime || 0);
      const watchTimeMins = Math.round(watchTimeHrs * 60);

      return (
        <div className="bg-[#101015]/98 backdrop-blur-2xl border border-zinc-700/80 rounded-2xl p-3 sm:p-4 shadow-2xl ring-1 ring-white/10 text-xs space-y-2.5 min-w-[210px] select-none">
          <div className="flex items-center justify-between pb-1.5 border-b border-zinc-800 font-bold">
            <span className="flex items-center gap-1.5 text-white">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              {timeFilter === 'Day' ? `Hour ${label}` : label}
            </span>
            <span className="text-[10px] font-mono text-emerald-400 px-1.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              Live Telemetry
            </span>
          </div>

          <div className="space-y-1.5 font-mono text-[11px]">
            <div className="flex items-center justify-between gap-4">
              <span className="text-zinc-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-400" />
                Visitors / Traffic:
              </span>
              <span className="font-black text-purple-300">
                {visitors.toLocaleString()} users
              </span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <span className="text-zinc-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-400" />
                Video Views:
              </span>
              <span className="font-black text-blue-300">
                {views.toLocaleString()} views
              </span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <span className="text-zinc-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                Watch Time:
              </span>
              <span className="font-black text-amber-300">
                {watchTimeHrs}h ({watchTimeMins}m)
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Luxury Custom Tooltip for Peak Hours BarChart
  const renderBarTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0]?.payload || {};
      const activeCount = Number(data.active || 0);

      return (
        <div className="bg-[#101015]/98 backdrop-blur-2xl border border-zinc-700/80 rounded-2xl p-3 shadow-2xl ring-1 ring-white/10 text-xs space-y-1.5 min-w-[170px] select-none">
          <div className="flex items-center justify-between pb-1 border-b border-zinc-800 font-bold text-white">
            <span>⏰ Hour {label}</span>
            <span className="text-[10px] text-purple-400 font-mono px-1.5 py-0.2 rounded bg-purple-500/10">24h Cycle</span>
          </div>
          <div className="flex items-center justify-between font-mono text-[11px] text-zinc-300 pt-0.5">
            <span>Active Sessions:</span>
            <span className="font-black text-purple-400 text-sm">
              {activeCount.toLocaleString()}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-300 pb-20">
      
      {/* Header & Luxury Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-zinc-800/60">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">Dashboard</h1>
            <span className="px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-mono font-bold uppercase tracking-wider">
              Control
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">Real-time performance & audience intelligence</p>
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
                  className="flex items-center gap-2.5 px-3.5 py-2 rounded-2xl rounded-tr-sm bg-gradient-to-br from-[#16161d] to-[#0e0e12] hover:from-[#1d1d26] hover:to-[#13131a] border border-zinc-700/80 hover:border-blue-500/50 text-white shadow-xl transition-all active:scale-95 group select-none relative overflow-hidden cursor-pointer"
                >
                  <div className="w-6 h-6 rounded-lg bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover:scale-105 transition-transform">
                    <ActiveIcon className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-left">
                    <div className="text-[9px] text-zinc-400 font-semibold uppercase tracking-wider leading-none">
                      Window
                    </div>
                    <div className="text-xs font-bold text-white leading-tight mt-0.5">
                      {activeTimeOption.title}
                    </div>
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 ml-1 transition-transform duration-200 ${isTimeFilterOpen ? 'rotate-180 text-blue-400' : 'group-hover:text-white'}`} />
                </button>

                {/* Floating Selection Pop-up Menu (Fully Mobile-Friendly & Luxury Glass) */}
                {isTimeFilterOpen && (
                  <div className="fixed inset-x-3 top-20 z-50 sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-2 sm:w-80 max-w-sm mx-auto sm:mx-0 bg-[#0e0e14]/98 backdrop-blur-2xl border border-zinc-700/80 rounded-2xl rounded-tr-sm p-2 shadow-2xl animate-in fade-in zoom-in-95 duration-150 space-y-1.5 ring-1 ring-white/10">
                    <div className="px-3 py-2 text-[11px] font-bold text-zinc-400 uppercase tracking-wider border-b border-zinc-800/80 flex items-center justify-between">
                      <span className="flex items-center gap-2 text-zinc-200">
                        <SlidersHorizontal className="w-3.5 h-3.5 text-blue-400" />
                        Select Window
                      </span>
                      <span className="text-[10px] text-blue-400 font-mono px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20">Live Sync</span>
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
                          className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-all text-left group cursor-pointer ${
                            isSelected 
                              ? 'bg-gradient-to-r from-blue-600/20 to-blue-500/10 border border-blue-500/50 text-white shadow-inner' 
                              : 'hover:bg-zinc-800/60 text-zinc-300 hover:text-white border border-transparent'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                              isSelected 
                                ? 'bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-900/40' 
                                : 'bg-zinc-900 text-zinc-400 border-zinc-800 group-hover:text-white group-hover:border-zinc-700'
                            }`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className={`text-xs font-bold truncate ${isSelected ? 'text-blue-300 font-black' : 'text-white'}`}>
                                  {opt.title}
                                </span>
                                <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded border ${
                                  isSelected ? 'bg-blue-500/25 text-blue-200 border-blue-400/40 font-bold' : 'bg-zinc-800 text-zinc-400 border-zinc-700'
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

      {/* 1. Section A: Platform Overview Bar (4 Luxury Cards with Asymmetric Corner & Ambient Watermark) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Videos */}
        <div className="relative overflow-hidden rounded-2xl rounded-tr-none bg-gradient-to-br from-[#16161c] via-[#101014] to-[#0a0a0d] border border-zinc-800/80 hover:border-blue-500/40 p-4 sm:p-5 shadow-xl transition-all duration-300 group">
          {/* Top shine line */}
          <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-blue-400/20 to-transparent pointer-events-none" />
          {/* Ambient Background Watermark Icon */}
          <div className="absolute -bottom-3 -right-3 text-white/[0.03] group-hover:text-blue-500/[0.08] group-hover:scale-110 transition-all duration-500 pointer-events-none select-none">
            <Video className="w-20 h-20 sm:w-24 sm:h-24 stroke-[1.2]" />
          </div>

          <div className="relative z-10 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                Total Videos
              </span>
              <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0 group-hover:scale-105 transition-transform">
                <Video className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl lg:text-4xl font-black font-mono tracking-tight text-white tabular-nums drop-shadow-md">
              {(platform.total_videos || 0).toLocaleString()}
            </div>
          </div>
        </div>

        {/* Total Users */}
        <div className="relative overflow-hidden rounded-2xl rounded-tr-none bg-gradient-to-br from-[#16161c] via-[#101014] to-[#0a0a0d] border border-zinc-800/80 hover:border-purple-500/40 p-4 sm:p-5 shadow-xl transition-all duration-300 group">
          <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-purple-400/20 to-transparent pointer-events-none" />
          {/* Ambient Background Watermark Icon */}
          <div className="absolute -bottom-3 -right-3 text-white/[0.03] group-hover:text-purple-500/[0.08] group-hover:scale-110 transition-all duration-500 pointer-events-none select-none">
            <Users className="w-20 h-20 sm:w-24 sm:h-24 stroke-[1.2]" />
          </div>

          <div className="relative z-10 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                Total Users
              </span>
              <div className="w-7 h-7 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0 group-hover:scale-105 transition-transform">
                <Users className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl lg:text-4xl font-black font-mono tracking-tight text-white tabular-nums drop-shadow-md">
              {(platform.total_users || 0).toLocaleString()}
            </div>
          </div>
        </div>

        {/* Total Views */}
        <div className="relative overflow-hidden rounded-2xl rounded-tr-none bg-gradient-to-br from-[#16161c] via-[#101014] to-[#0a0a0d] border border-zinc-800/80 hover:border-pink-500/40 p-4 sm:p-5 shadow-xl transition-all duration-300 group">
          <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-pink-400/20 to-transparent pointer-events-none" />
          {/* Ambient Background Watermark Icon */}
          <div className="absolute -bottom-3 -right-3 text-white/[0.03] group-hover:text-pink-500/[0.08] group-hover:scale-110 transition-all duration-500 pointer-events-none select-none">
            <Eye className="w-20 h-20 sm:w-24 sm:h-24 stroke-[1.2]" />
          </div>

          <div className="relative z-10 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-pink-400" />
                Total Views
              </span>
              <div className="w-7 h-7 rounded-lg bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400 shrink-0 group-hover:scale-105 transition-transform">
                <Eye className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl lg:text-4xl font-black font-mono tracking-tight text-white tabular-nums drop-shadow-md">
              {(platform.total_views || 0).toLocaleString()}
            </div>
          </div>
        </div>

        {/* Live Now */}
        <div className="relative overflow-hidden rounded-2xl rounded-tr-none bg-gradient-to-br from-[#16161c] via-[#101014] to-[#0a0a0d] border border-zinc-800/80 hover:border-emerald-500/40 p-4 sm:p-5 shadow-xl transition-all duration-300 group">
          <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-400/20 to-transparent pointer-events-none" />
          {/* Ambient Background Watermark Icon */}
          <div className="absolute -bottom-3 -right-3 text-white/[0.03] group-hover:text-emerald-500/[0.08] group-hover:scale-110 transition-all duration-500 pointer-events-none select-none">
            <Activity className="w-20 h-20 sm:w-24 sm:h-24 stroke-[1.2]" />
          </div>

          <div className="relative z-10 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live Now
              </span>
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 group-hover:scale-105 transition-transform">
                <Activity className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl lg:text-4xl font-black font-mono tracking-tight text-white tabular-nums drop-shadow-md">
              {(audience.live_users || 0).toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Section B: Today's Traffic Summary (Luxury Card with Corner Accent & Background Watermarks) */}
      <div className="relative overflow-hidden rounded-2xl rounded-tr-none bg-gradient-to-br from-[#16161c] via-[#101014] to-[#0a0a0d] border border-zinc-800/80 p-4 sm:p-5 shadow-xl">
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />

        <div className="flex items-center justify-between pb-3 mb-3.5 border-b border-zinc-800/60">
          <div className="flex items-center gap-2 text-sm font-bold text-zinc-200">
            <CalendarRange className="w-4 h-4 text-blue-400" />
            <span>Today&apos;s Traffic Matrix</span>
            <span className="text-xs font-normal text-zinc-400 hidden sm:inline">
              • {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
          <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-zinc-800/80 border border-zinc-700/60 text-zinc-400">
            Audience Flow
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Today */}
          <div className="relative overflow-hidden rounded-xl rounded-tr-none bg-zinc-900/60 border border-zinc-800/70 hover:border-zinc-700 p-3 sm:p-4 group transition-all">
            <div className="absolute -bottom-2 -right-2 text-white/[0.03] group-hover:text-white/[0.06] transition-all pointer-events-none">
              <Users className="w-12 h-12 stroke-[1.2]" />
            </div>
            <div className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">Today</div>
            <div className="text-xl sm:text-2xl lg:text-3xl font-black font-mono tracking-tight text-white tabular-nums mt-1">
              {(audience.today_visitors || 0).toLocaleString()}
            </div>
          </div>

          {/* This Week */}
          <div className="relative overflow-hidden rounded-xl rounded-tr-none bg-zinc-900/60 border border-zinc-800/70 hover:border-zinc-700 p-3 sm:p-4 group transition-all">
            <div className="absolute -bottom-2 -right-2 text-white/[0.03] group-hover:text-white/[0.06] transition-all pointer-events-none">
              <Calendar className="w-12 h-12 stroke-[1.2]" />
            </div>
            <div className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">This Week</div>
            <div className="text-xl sm:text-2xl lg:text-3xl font-black font-mono tracking-tight text-white tabular-nums mt-1">
              {(audience.week_visitors || 0).toLocaleString()}
            </div>
          </div>

          {/* This Month */}
          <div className="relative overflow-hidden rounded-xl rounded-tr-none bg-zinc-900/60 border border-zinc-800/70 hover:border-zinc-700 p-3 sm:p-4 group transition-all">
            <div className="absolute -bottom-2 -right-2 text-white/[0.03] group-hover:text-white/[0.06] transition-all pointer-events-none">
              <BarChart3 className="w-12 h-12 stroke-[1.2]" />
            </div>
            <div className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">This Month</div>
            <div className="text-xl sm:text-2xl lg:text-3xl font-black font-mono tracking-tight text-white tabular-nums mt-1">
              {(audience.month_visitors || 0).toLocaleString()}
            </div>
          </div>

          {/* Avg / Day (Strictly Integer / আস্ত সংখ্যা, no decimals) */}
          <div className="relative overflow-hidden rounded-xl rounded-tr-none bg-zinc-900/60 border border-zinc-800/70 hover:border-blue-500/40 p-3 sm:p-4 group transition-all">
            <div className="absolute -bottom-2 -right-2 text-white/[0.03] group-hover:text-blue-500/[0.08] transition-all pointer-events-none">
              <TrendingUp className="w-12 h-12 stroke-[1.2]" />
            </div>
            <div className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider flex items-center justify-between">
              <span>Avg / Day</span>
              <span className="text-[9px] font-mono text-blue-400">DAILY</span>
            </div>
            <div className="text-xl sm:text-2xl lg:text-3xl font-black font-mono tracking-tight text-white tabular-nums mt-1">
              {Math.round(Number(audience.avg_daily_users || 0)).toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Section C: Watch Time Intelligence (Compact, Clean & Luxury Styled) */}
      <div className="relative overflow-hidden rounded-2xl rounded-tr-none bg-gradient-to-br from-[#16161c] via-[#101014] to-[#0a0a0d] border border-zinc-800/80 p-4 sm:p-5 shadow-xl space-y-3.5">
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-amber-400/20 to-transparent pointer-events-none" />

        <div className="flex items-center justify-between pb-2.5 border-b border-zinc-800/60">
          <h2 className="text-sm font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            Watch Time Intelligence
          </h2>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-zinc-900/90 border border-zinc-800 rounded-full text-[11px] font-mono text-zinc-400">
            <span>All-Time:</span>
            <span className="text-white font-bold">{watchTime.formatted_all_time}</span>
          </div>
        </div>

        {/* 3 Watch Time Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {/* Card 1: Total Watch Time */}
          <div className="relative overflow-hidden rounded-xl rounded-tr-none bg-zinc-900/70 border border-zinc-800/80 hover:border-amber-500/40 p-4 transition-all shadow-md group">
            {/* Ambient Watermark */}
            <div className="absolute -bottom-3 -right-3 text-white/[0.03] group-hover:text-amber-500/[0.08] group-hover:scale-110 transition-all duration-300 pointer-events-none select-none">
              <Clock className="w-16 h-16 stroke-[1.2]" />
            </div>

            <div className="relative z-10">
              <div className="flex items-center justify-between text-zinc-400 mb-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                  Total Watch Time
                </span>
                <Clock className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <div className="text-xl sm:text-2xl font-black font-mono tracking-tight text-white tabular-nums drop-shadow-sm group-hover:scale-105 transition-transform duration-200">
                {watchTime.formatted_total}
              </div>
              <p className="text-[10px] sm:text-[11px] text-zinc-400 mt-1 font-medium">
                ≈ {watchTime.total_hours} Hours total ({timeFilter})
              </p>
            </div>
          </div>

          {/* Card 2: Average Watch Time Per View */}
          <div className="relative overflow-hidden rounded-xl rounded-tr-none bg-zinc-900/70 border border-zinc-800/80 hover:border-blue-500/40 p-4 transition-all shadow-md group">
            {/* Ambient Watermark */}
            <div className="absolute -bottom-3 -right-3 text-white/[0.03] group-hover:text-blue-500/[0.08] group-hover:scale-110 transition-all duration-300 pointer-events-none select-none">
              <Eye className="w-16 h-16 stroke-[1.2]" />
            </div>

            <div className="relative z-10">
              <div className="flex items-center justify-between text-zinc-400 mb-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400">
                  Avg Watch Time / View
                </span>
                <Eye className="w-3.5 h-3.5 text-blue-400" />
              </div>
              <div className="text-xl sm:text-2xl font-black font-mono tracking-tight text-white tabular-nums drop-shadow-sm group-hover:scale-105 transition-transform duration-200">
                {watchTime.formatted_avg_per_view}
              </div>
              <p className="text-[10px] sm:text-[11px] text-zinc-400 mt-1 font-medium">
                Playback duration per impression
              </p>
            </div>
          </div>

          {/* Card 3: Average Watch Time Per User Session */}
          <div className="relative overflow-hidden rounded-xl rounded-tr-none bg-zinc-900/70 border border-zinc-800/80 hover:border-emerald-500/40 p-4 transition-all shadow-md group">
            {/* Ambient Watermark */}
            <div className="absolute -bottom-3 -right-3 text-white/[0.03] group-hover:text-emerald-500/[0.08] group-hover:scale-110 transition-all duration-300 pointer-events-none select-none">
              <Users className="w-16 h-16 stroke-[1.2]" />
            </div>

            <div className="relative z-10">
              <div className="flex items-center justify-between text-zinc-400 mb-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                  Avg Watch Time / User
                </span>
                <Users className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="text-xl sm:text-2xl font-black font-mono tracking-tight text-white tabular-nums drop-shadow-sm group-hover:scale-105 transition-transform duration-200">
                {watchTime.formatted_avg_per_user}
              </div>
              <p className="text-[10px] sm:text-[11px] text-zinc-400 mt-1 font-medium">
                Engagement per active visitor session
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Section D: Visual Charts (AreaChart with Visitors & BarChart) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
        {/* Watch Time vs Views & Visitors Progression AreaChart */}
        <div className="lg:col-span-2 min-w-0 relative overflow-hidden rounded-2xl rounded-tr-none bg-gradient-to-br from-[#16161c] via-[#101014] to-[#0a0a0d] border border-zinc-800/80 p-4 sm:p-5 shadow-xl flex flex-col justify-between">
          <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-blue-400/20 to-transparent pointer-events-none" />

          <div className="flex items-center justify-between mb-3 pb-3 border-b border-zinc-800/60">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" /> Watch Time, Views & Visitors
              </h3>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                {timeFilter === 'Day' ? '24-hour hourly traffic, stream impressions & watch time' : `${timeFilter} historical trajectory`}
              </p>
            </div>
            <span className="text-xs text-zinc-400 font-mono px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800">
              {timeFilter} Trend
            </span>
          </div>

          <div className="w-full min-w-0 h-[280px] sm:h-[320px] min-h-[260px] relative">
            {isMounted && processedTrendChart.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={260}>
                <AreaChart data={processedTrendChart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorWatchTime" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.35}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a855f7" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#232329" vertical={false} />
                  <XAxis dataKey="name" stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis yAxisId="left" stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}`} />
                  <YAxis yAxisId="right" orientation="right" stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}h`} />
                  <Tooltip content={renderAreaTooltip} />
                  <Area yAxisId="left" type="monotone" dataKey="views" name="Views" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorViews)" />
                  <Area yAxisId="left" type="monotone" dataKey="visitors" name="Visitors" stroke="#a855f7" strokeWidth={2} fillOpacity={1} fill="url(#colorVisitors)" />
                  <Area yAxisId="right" type="monotone" dataKey="watchTime" name="Watch Time (hrs)" stroke="#f59e0b" strokeWidth={2.5} fillOpacity={1} fill="url(#colorWatchTime)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-zinc-500">
                <AlertCircle className="w-8 h-8 text-zinc-600 mb-2 animate-pulse" />
                <p className="text-xs">Loading telemetry chart...</p>
              </div>
            )}
          </div>
        </div>

        {/* Peak User Activity 24h BarChart */}
        <div className="min-w-0 relative overflow-hidden rounded-2xl rounded-tr-none bg-gradient-to-br from-[#16161c] via-[#101014] to-[#0a0a0d] border border-zinc-800/80 p-4 sm:p-5 shadow-xl flex flex-col justify-between">
          <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-purple-400/20 to-transparent pointer-events-none" />

          <div className="flex items-center justify-between mb-1 pb-3 border-b border-zinc-800/60">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-purple-400" /> Peak User Activity
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">24h distribution of active visitors</p>
            </div>
            <span className="text-[11px] font-mono text-purple-400 px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20">
              24h Cycle
            </span>
          </div>

          <div className="w-full min-w-0 h-[280px] sm:h-[320px] min-h-[260px] relative">
            {isMounted && peakHours.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={260}>
                <BarChart data={peakHours} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#232329" vertical={false} />
                  <XAxis dataKey="hour" stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip content={renderBarTooltip} cursor={{ fill: '#1a1a22' }} />
                  <Bar dataKey="active" name="Activity Score" fill="#a855f7" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-zinc-500">
                <AlertCircle className="w-8 h-8 text-zinc-600 mb-2 animate-pulse" />
                <p className="text-xs">Loading activity metrics...</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 5. Section E: Category Intelligence & Engagement Matrix (with Filter Popup) */}
      <div className="relative overflow-hidden rounded-2xl rounded-tr-none bg-gradient-to-br from-[#16161c] via-[#101014] to-[#0a0a0d] border border-zinc-800/80 p-4 sm:p-5 shadow-xl space-y-4">
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-blue-400/20 to-transparent pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/60 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
                Category Watch Time & Engagement Matrix
              </h2>
              <p className="text-xs text-zinc-400">
                Watch time distribution, impressions, and audience retention by category
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {/* Category Filter Popover */}
            <div className="relative" ref={categoryFilterRef}>
              <button
                type="button"
                onClick={() => setIsCategoryFilterOpen(!isCategoryFilterOpen)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all active:scale-95 shadow-sm cursor-pointer ${
                  selectedCategories.size < categoryList.length
                    ? 'bg-blue-600/15 border-blue-500/40 text-blue-400'
                    : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white'
                }`}
              >
                <Filter className="w-3.5 h-3.5" />
                <span>Filter</span>
                {selectedCategories.size < categoryList.length && (
                  <span className="px-1.5 py-0.2 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-mono font-bold">
                    {selectedCategories.size}/{categoryList.length}
                  </span>
                )}
                <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 transition-transform ${isCategoryFilterOpen ? 'rotate-180' : ''}`} />
              </button>

              {isCategoryFilterOpen && (
                <div className="fixed inset-x-3 top-24 sm:absolute sm:inset-auto sm:left-auto sm:right-0 sm:top-full sm:mt-2 w-auto sm:w-60 bg-[#121216]/98 backdrop-blur-xl border border-zinc-700/80 rounded-xl p-2.5 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 space-y-2 ring-1 ring-white/10">
                  <div className="flex items-center justify-between pb-1.5 border-b border-zinc-800 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                    <span>Filter Categories</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={selectAllCategories}
                        className="text-[10px] text-blue-400 hover:text-blue-300 font-semibold cursor-pointer"
                      >
                        All
                      </button>
                      <span className="text-zinc-600">|</span>
                      <button
                        type="button"
                        onClick={clearAllCategories}
                        className="text-[10px] text-zinc-400 hover:text-zinc-300 font-semibold cursor-pointer"
                      >
                        Clear
                      </button>
                    </div>
                  </div>

                  <div className="max-h-56 overflow-y-auto space-y-1 pr-1">
                    {categoryList.map((cat: any) => {
                      const isChecked = selectedCategories.has(cat.name);
                      const color = CATEGORY_COLORS[cat.name] || '#3b82f6';
                      return (
                        <button
                          key={cat.name}
                          type="button"
                          onClick={() => toggleCategory(cat.name)}
                          className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs text-left hover:bg-zinc-800/60 transition-colors group cursor-pointer"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span
                              className="w-2 h-2 rounded-full shrink-0"
                              style={{ backgroundColor: color }}
                            />
                            <span className={`truncate ${isChecked ? 'text-white font-medium' : 'text-zinc-400'}`}>
                              {cat.name}
                            </span>
                          </div>
                          <div
                            className={`w-4 h-4 rounded border flex items-center justify-center transition-colors shrink-0 ${
                              isChecked
                                ? 'bg-blue-600 border-blue-500 text-white'
                                : 'border-zinc-700 bg-zinc-900 group-hover:border-zinc-600'
                            }`}
                          >
                            {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Custom Category Sort Popover */}
            <div className="relative" ref={categorySortRef}>
              <button
                type="button"
                onClick={() => setIsCategorySortOpen(!isCategorySortOpen)}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-xs font-semibold text-zinc-300 hover:text-white transition-all active:scale-95 shadow-sm cursor-pointer"
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
                <div className="fixed inset-x-3 top-24 sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-2 w-auto sm:w-52 max-w-sm bg-[#121216]/98 backdrop-blur-xl border border-zinc-700/80 rounded-xl p-1.5 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 space-y-0.5 ring-1 ring-white/10">
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
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
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

            <div className="text-xs font-mono text-zinc-400 bg-zinc-900 border border-zinc-800 px-2.5 py-1.5 rounded-xl">
              {filteredCategoryList.length} of {categoryList.length}
            </div>
          </div>
        </div>

        {/* Category Performance Breakdown Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-[#18181f] text-zinc-400 font-semibold border-b border-zinc-800/80">
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
              {filteredCategoryList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-zinc-500">
                    <div className="flex flex-col items-center justify-center gap-1.5">
                      <Filter className="w-5 h-5 text-zinc-600 mb-1" />
                      <span>No categories match your filter</span>
                      <button
                        type="button"
                        onClick={selectAllCategories}
                        className="text-xs text-blue-400 hover:underline mt-1 cursor-pointer font-medium"
                      >
                        Select all categories
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCategoryList.map((cat: any) => {
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
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. Section F: Session Engagement & Retention Metrics (Luxury Cards) */}
      <div className="relative overflow-hidden rounded-2xl rounded-tr-none bg-gradient-to-br from-[#16161c] via-[#101014] to-[#0a0a0d] border border-zinc-800/80 p-4 sm:p-5 shadow-xl space-y-3.5">
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-purple-400/20 to-transparent pointer-events-none" />

        <div className="flex items-center justify-between pb-2.5 border-b border-zinc-800/60">
          <h2 className="text-sm font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
            <Hourglass className="w-4 h-4 text-purple-400" />
            Session Engagement & Retention Intelligence
          </h2>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-zinc-900/90 border border-zinc-800 rounded-full text-[11px] font-mono text-zinc-400">
            <span>Window:</span>
            <span className="text-white font-bold">{timeFilter}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {/* Card 1: Average Session Duration */}
          <div className="relative overflow-hidden rounded-xl rounded-tr-none bg-zinc-900/70 border border-zinc-800/80 hover:border-purple-500/40 p-4 transition-all shadow-md group">
            <div className="absolute -bottom-3 -right-3 text-white/[0.03] group-hover:text-purple-500/[0.08] group-hover:scale-110 transition-all duration-300 pointer-events-none select-none">
              <Hourglass className="w-16 h-16 stroke-[1.2]" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center justify-between text-zinc-400 mb-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400">
                  Avg Session Duration
                </span>
                <Hourglass className="w-3.5 h-3.5 text-purple-400" />
              </div>
              <div className="text-xl sm:text-2xl font-black font-mono tracking-tight text-white tabular-nums drop-shadow-sm group-hover:scale-105 transition-transform duration-200">
                {sessionMetrics.avg_duration_formatted}
              </div>
              <p className="text-[10px] sm:text-[11px] text-zinc-400 mt-1 font-medium">
                Average browsing duration per session
              </p>
            </div>
          </div>

          {/* Card 2: Bounce Rate */}
          <div className="relative overflow-hidden rounded-xl rounded-tr-none bg-zinc-900/70 border border-zinc-800/80 hover:border-rose-500/40 p-4 transition-all shadow-md group">
            <div className="absolute -bottom-3 -right-3 text-white/[0.03] group-hover:text-rose-500/[0.08] group-hover:scale-110 transition-all duration-300 pointer-events-none select-none">
              <Zap className="w-16 h-16 stroke-[1.2]" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center justify-between text-zinc-400 mb-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400">
                  Bounce Rate (&lt;10s)
                </span>
                <Zap className="w-3.5 h-3.5 text-rose-400" />
              </div>
              <div className="text-xl sm:text-2xl font-black font-mono tracking-tight text-white tabular-nums drop-shadow-sm group-hover:scale-105 transition-transform duration-200">
                {sessionMetrics.bounce_rate}%
              </div>
              <p className="text-[10px] sm:text-[11px] text-zinc-400 mt-1 font-medium">
                {sessionMetrics.bounced_sessions.toLocaleString()} of {sessionMetrics.total_sessions.toLocaleString()} exited immediately
              </p>
            </div>
          </div>

          {/* Card 3: Engaged Active Audience */}
          <div className="relative overflow-hidden rounded-xl rounded-tr-none bg-zinc-900/70 border border-zinc-800/80 hover:border-emerald-500/40 p-4 transition-all shadow-md group">
            <div className="absolute -bottom-3 -right-3 text-white/[0.03] group-hover:text-emerald-500/[0.08] group-hover:scale-110 transition-all duration-300 pointer-events-none select-none">
              <Users className="w-16 h-16 stroke-[1.2]" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center justify-between text-zinc-400 mb-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                  Engaged Active Audience
                </span>
                <Users className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="text-xl sm:text-2xl font-black font-mono tracking-tight text-white tabular-nums drop-shadow-sm group-hover:scale-105 transition-transform duration-200">
                {Math.max(0, sessionMetrics.total_sessions - sessionMetrics.bounced_sessions).toLocaleString()}
              </div>
              <p className="text-[10px] sm:text-[11px] text-zinc-400 mt-1 font-medium">
                Visitors stayed &gt; 10s watching or exploring
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 7. Section G & H: Device Intelligence & Acquisition Sources (2-Column Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
        {/* Device Matrix */}
        <div className="relative overflow-hidden rounded-2xl rounded-tr-none bg-gradient-to-br from-[#16161c] via-[#101014] to-[#0a0a0d] border border-zinc-800/80 p-4 sm:p-5 shadow-xl flex flex-col justify-between">
          <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-blue-400/20 to-transparent pointer-events-none" />
          <div className="absolute -bottom-4 -right-4 text-white/[0.02] pointer-events-none select-none">
            <Smartphone className="w-28 h-28 stroke-[1.1]" />
          </div>

          <div className="relative z-10">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800/60 mb-3.5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Device Intelligence</h3>
                  <p className="text-[11px] text-zinc-400">Visitor distribution by hardware</p>
                </div>
              </div>
              <span className="text-[10px] font-mono text-blue-400 px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20">
                Hardware
              </span>
            </div>

            {(() => {
              const totalDevices = Object.values(deviceBreakdown).reduce((a, b) => a + b, 0) || 0;
              const mobileCount = deviceBreakdown['mobile'] || 0;
              const desktopCount = deviceBreakdown['desktop'] || 0;
              const tabletCount = deviceBreakdown['tablet'] || 0;
              const otherCount = Math.max(0, totalDevices - (mobileCount + desktopCount + tabletCount));

              const mobilePct = totalDevices > 0 ? Math.round((mobileCount / totalDevices) * 100) : 0;
              const desktopPct = totalDevices > 0 ? Math.round((desktopCount / totalDevices) * 100) : 0;
              const tabletPct = totalDevices > 0 ? Math.round((tabletCount / totalDevices) * 100) : 0;

              return (
                <div className="space-y-3.5">
                  {/* Mobile Row */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 text-zinc-300 font-medium">
                        <Smartphone className="w-3.5 h-3.5 text-blue-400" />
                        <span>Mobile (Smartphones)</span>
                      </div>
                      <div className="flex items-center gap-2 font-mono">
                        <span className="text-white font-bold">{mobileCount.toLocaleString()}</span>
                        <span className="text-blue-400 font-black">{mobilePct}%</span>
                      </div>
                    </div>
                    <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                      <div className="h-full bg-blue-500 rounded-full transition-all duration-500" style={{ width: `${mobilePct}%` }} />
                    </div>
                  </div>

                  {/* Desktop Row */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 text-zinc-300 font-medium">
                        <Monitor className="w-3.5 h-3.5 text-purple-400" />
                        <span>Desktop / Laptop</span>
                      </div>
                      <div className="flex items-center gap-2 font-mono">
                        <span className="text-white font-bold">{desktopCount.toLocaleString()}</span>
                        <span className="text-purple-400 font-black">{desktopPct}%</span>
                      </div>
                    </div>
                    <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                      <div className="h-full bg-purple-500 rounded-full transition-all duration-500" style={{ width: `${desktopPct}%` }} />
                    </div>
                  </div>

                  {/* Tablet Row */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 text-zinc-300 font-medium">
                        <Tablet className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Tablets &amp; iPads</span>
                      </div>
                      <div className="flex items-center gap-2 font-mono">
                        <span className="text-white font-bold">{tabletCount.toLocaleString()}</span>
                        <span className="text-emerald-400 font-black">{tabletPct}%</span>
                      </div>
                    </div>
                    <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                      <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${tabletPct}%` }} />
                    </div>
                  </div>

                  {totalDevices === 0 && (
                    <p className="text-xs text-zinc-500 text-center py-2">
                      New device telemetry will record as visitors browse with the updated app.
                    </p>
                  )}
                </div>
              );
            })()}
          </div>
        </div>

        {/* Traffic Channels & Sources */}
        <div className="relative overflow-hidden rounded-2xl rounded-tr-none bg-gradient-to-br from-[#16161c] via-[#101014] to-[#0a0a0d] border border-zinc-800/80 p-4 sm:p-5 shadow-xl flex flex-col justify-between">
          <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-400/20 to-transparent pointer-events-none" />
          <div className="absolute -bottom-4 -right-4 text-white/[0.02] pointer-events-none select-none">
            <Send className="w-28 h-28 stroke-[1.1]" />
          </div>

          <div className="relative z-10">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800/60 mb-3.5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Compass className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Traffic Acquisition Channels</h3>
                  <p className="text-[11px] text-zinc-400">Referrals, bots, and direct links</p>
                </div>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                Sources
              </span>
            </div>

            {(() => {
              const totalSources = Object.values(sourceBreakdown).reduce((a, b) => a + b, 0) || 0;
              const telegramCount = sourceBreakdown['telegram'] || 0;
              const directCount = sourceBreakdown['direct'] || 0;
              const googleCount = sourceBreakdown['google'] || 0;
              const socialCount = (sourceBreakdown['facebook'] || 0) + (sourceBreakdown['twitter'] || 0) + (sourceBreakdown['youtube'] || 0);

              const tgPct = totalSources > 0 ? Math.round((telegramCount / totalSources) * 100) : 0;
              const directPct = totalSources > 0 ? Math.round((directCount / totalSources) * 100) : 0;
              const googlePct = totalSources > 0 ? Math.round((googleCount / totalSources) * 100) : 0;
              const socialPct = totalSources > 0 ? Math.round((socialCount / totalSources) * 100) : 0;

              return (
                <div className="space-y-3.5">
                  {/* Telegram Channel Row */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 text-zinc-300 font-medium">
                        <Send className="w-3.5 h-3.5 text-[#229ED9]" />
                        <span>Telegram Bot Links &amp; Unlocks</span>
                      </div>
                      <div className="flex items-center gap-2 font-mono">
                        <span className="text-white font-bold">{telegramCount.toLocaleString()}</span>
                        <span className="text-[#229ED9] font-black">{tgPct}%</span>
                      </div>
                    </div>
                    <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                      <div className="h-full bg-[#229ED9] rounded-full transition-all duration-500" style={{ width: `${tgPct}%` }} />
                    </div>
                  </div>

                  {/* Direct Row */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 text-zinc-300 font-medium">
                        <Compass className="w-3.5 h-3.5 text-zinc-400" />
                        <span>Direct URL &amp; Bookmarks</span>
                      </div>
                      <div className="flex items-center gap-2 font-mono">
                        <span className="text-white font-bold">{directCount.toLocaleString()}</span>
                        <span className="text-zinc-300 font-black">{directPct}%</span>
                      </div>
                    </div>
                    <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                      <div className="h-full bg-zinc-500 rounded-full transition-all duration-500" style={{ width: `${directPct}%` }} />
                    </div>
                  </div>

                  {/* Google Search Row */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 text-zinc-300 font-medium">
                        <Globe className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Google Search &amp; Organic</span>
                      </div>
                      <div className="flex items-center gap-2 font-mono">
                        <span className="text-white font-bold">{googleCount.toLocaleString()}</span>
                        <span className="text-emerald-400 font-black">{googlePct}%</span>
                      </div>
                    </div>
                    <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                      <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${googlePct}%` }} />
                    </div>
                  </div>

                  {totalSources === 0 && (
                    <p className="text-xs text-zinc-500 text-center py-2">
                      New traffic source telemetry will record as visitors browse with the updated app.
                    </p>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      </div>

      {/* 8. Section I: Real-time Live Traffic Stream & Visitor Telemetry (Live Log Table) */}
      <div className="relative overflow-hidden rounded-2xl rounded-tr-none bg-gradient-to-br from-[#16161c] via-[#101014] to-[#0a0a0d] border border-zinc-800/80 p-4 sm:p-5 shadow-xl space-y-4">
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-400/20 to-transparent pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/60 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <Radio className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
                  Real-time Live Traffic Stream &amp; Telemetry
                </h2>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <p className="text-xs text-zinc-400">
                Live stream of active visitors, devices, sources, and active pages (past 10 minutes)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold">
              {liveLogs.filter(l => l.is_live).length} Live Now
            </span>
            <span className="px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400">
              {liveLogs.length} in 10m
            </span>
          </div>
        </div>

        {/* Live Traffic Stream Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#18181f] text-zinc-400 font-semibold border-b border-zinc-800/80">
              <tr>
                <th className="px-3.5 py-2.5 rounded-l-xl">Status</th>
                <th className="px-3.5 py-2.5">Session</th>
                <th className="px-3.5 py-2.5">Device &amp; OS</th>
                <th className="px-3.5 py-2.5">Browser</th>
                <th className="px-3.5 py-2.5">Traffic Source</th>
                <th className="px-3.5 py-2.5">Active Page</th>
                <th className="px-3.5 py-2.5 text-right rounded-r-xl">Session Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50 text-zinc-300">
              {liveLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-zinc-500">
                    <div className="flex flex-col items-center justify-center gap-1.5">
                      <Radio className="w-5 h-5 text-zinc-600 mb-1" />
                      <span>Waiting for live visitor telemetry...</span>
                      <span className="text-[11px] text-zinc-600">Active sessions in the last 10 minutes will stream here automatically.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                liveLogs.map((log: any, idx: number) => {
                  const isLive = log.is_live;
                  const source = log.source || 'direct';
                  const device = log.device || 'unknown';

                  return (
                    <tr key={idx} className="hover:bg-zinc-900/60 transition-colors">
                      {/* Status */}
                      <td className="px-3.5 py-3 font-semibold">
                        {isLive ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            Live
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                            Recent
                          </span>
                        )}
                      </td>

                      {/* Session ID */}
                      <td className="px-3.5 py-3 font-mono text-zinc-400 font-bold text-[11px]">
                        #{log.session_id}
                      </td>

                      {/* Device & OS */}
                      <td className="px-3.5 py-3">
                        <div className="flex items-center gap-1.5">
                          {device === 'mobile' ? (
                            <Smartphone className="w-3.5 h-3.5 text-blue-400" />
                          ) : device === 'tablet' ? (
                            <Tablet className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Monitor className="w-3.5 h-3.5 text-purple-400" />
                          )}
                          <span className="text-white capitalize">{device}</span>
                          <span className="text-zinc-500">•</span>
                          <span className="text-zinc-400 text-[11px]">{log.os}</span>
                        </div>
                      </td>

                      {/* Browser */}
                      <td className="px-3.5 py-3 text-zinc-300">
                        <span className="px-2 py-0.5 rounded bg-zinc-800/80 border border-zinc-700/60 text-[11px] font-medium">
                          {log.browser}
                        </span>
                      </td>

                      {/* Traffic Source */}
                      <td className="px-3.5 py-3">
                        {source === 'telegram' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/15 border border-blue-500/30 text-[#229ED9] text-[10px] font-bold">
                            <Send className="w-2.5 h-2.5" /> Telegram
                          </span>
                        ) : source === 'google' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
                            <Globe className="w-2.5 h-2.5" /> Google
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-300 text-[10px]">
                            <Compass className="w-2.5 h-2.5" /> Direct
                          </span>
                        )}
                      </td>

                      {/* Active Page */}
                      <td className="px-3.5 py-3 font-mono text-[11px] text-zinc-300">
                        <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-blue-300">
                          {log.page}
                        </span>
                      </td>

                      {/* Duration */}
                      <td className="px-3.5 py-3 text-right font-mono font-bold text-white text-[11px]">
                        {log.duration_formatted}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
