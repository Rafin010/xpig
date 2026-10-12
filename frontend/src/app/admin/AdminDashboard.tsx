'use client';
import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { Eye, DollarSign, Users, Megaphone, TrendingUp, ArrowUpRight, PlayCircle, Clock, Activity, UserCircle } from 'lucide-react';

const viewData: any[] = [];
const peakHoursData: any[] = [];
const demoData: any[] = [];
const topVideos: any[] = [];

const COLORS = ['#3b82f6', '#ec4899', '#8b5cf6'];

export default function AdminDashboard() {
  const [timeFilter, setTimeFilter] = useState('Week');
  const [durationFilter, setDurationFilter] = useState('All');
  const [stats, setStats] = useState({ total_videos: 0, total_users: 0, total_views: 0 });
  const [traffic, setTraffic] = useState({ live_users: 0, today_visitors: 0, week_visitors: 0, month_visitors: 0 });

  useEffect(() => {
    fetch('https://xpig.onrender.com/api/v1/admin/stats')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error(err));
      
    const fetchTraffic = () => {
      fetch('https://xpig.onrender.com/api/v1/analytics/stats')
        .then(res => res.json())
        .then(data => setTraffic(data))
        .catch(err => console.error(err));
    };
    fetchTraffic();
    const interval = setInterval(fetchTraffic, 10000);
    return () => clearInterval(interval);
  }, []);

  const StatCard = ({ title, value, change, icon: Icon, color }: any) => (
    <div className="bg-[#111111] border border-zinc-800/50 p-4 sm:p-6 rounded-2xl flex items-start justify-between shadow-xl">
      <div>
        <p className="text-xs sm:text-sm font-medium text-zinc-400 mb-1">{title}</p>
        <h3 className="text-2xl sm:text-3xl font-black text-white">{value}</h3>
        <div className="flex items-center gap-1 mt-1.5 text-xs sm:text-sm text-green-400 font-medium">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>{change} this {timeFilter.toLowerCase()}</span>
        </div>
      </div>
      <div className={`p-3 sm:p-4 rounded-xl bg-${color}-500/10 shrink-0`}>
        <Icon className={`w-5 h-5 sm:w-6 sm:h-6 text-${color}-500`} />
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Platform Overview</h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-0.5 sm:mt-1">Real-time metrics and analytics for XPIG.</p>
        </div>
        <div className="flex items-center gap-1.5 bg-[#1a1a1a] p-1 rounded-xl border border-zinc-800 self-start sm:self-auto overflow-x-auto max-w-full">
          {['Day', 'Week', 'Month', 'Year'].map(f => (
            <button 
              key={f}
              onClick={() => setTimeFilter(f)}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-bold transition-all shrink-0 ${timeFilter === f ? 'bg-pink-600 text-white shadow-lg' : 'text-zinc-400 hover:text-white'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>
      
      {/* Traffic Analytics (Real-Time Mission-Control Console) */}
      <div className="bg-[#111113] border border-zinc-800/80 p-4 sm:p-6 rounded-2xl shadow-2xl relative overflow-hidden">
        {/* Header with Live Pulsing Radar Beacon */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6 pb-4 border-b border-zinc-800/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 shrink-0">
              <Activity className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-2">
                Live Traffic & Audience Telemetry
              </h3>
              <p className="text-[11px] sm:text-xs text-zinc-400">Real-time concurrent sessions and active visitor flow</p>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-[11px] sm:text-xs font-mono self-start sm:self-auto">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-emerald-400 font-bold tracking-wider">LIVE TELEMETRY</span>
            <span className="text-zinc-600">•</span>
            <span className="text-zinc-400 text-[10px]">10s Polling</span>
          </div>
        </div>

        {/* 4 Mission-Control Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
          
          {/* Card 1: Live Concurrent Users */}
          <div className="bg-zinc-900/60 border border-zinc-800/80 hover:border-emerald-500/40 p-3 sm:p-4.5 rounded-xl transition-all shadow-md group">
            <div className="flex items-center justify-between text-zinc-400 mb-1.5">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1 sm:gap-1.5 truncate">
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
                Active Right Now
              </span>
              <Activity className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0" />
            </div>
            <div className="text-2xl sm:text-4xl font-black text-white tracking-tight group-hover:scale-105 transition-transform duration-200">
              {traffic.live_users}
            </div>
            <p className="text-[10px] sm:text-xs text-zinc-400 mt-1 sm:mt-2 font-medium truncate">
              Concurrent live users
            </p>
          </div>

          {/* Card 2: Today's Unique Visitors */}
          <div className="bg-zinc-900/60 border border-zinc-800/80 hover:border-blue-500/40 p-3 sm:p-4.5 rounded-xl transition-all shadow-md group">
            <div className="flex items-center justify-between text-zinc-400 mb-1.5">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-blue-400 truncate">
                Today&apos;s Visitors
              </span>
              <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-400 shrink-0" />
            </div>
            <div className="text-2xl sm:text-4xl font-black text-white tracking-tight group-hover:scale-105 transition-transform duration-200">
              {traffic.today_visitors.toLocaleString()}
            </div>
            <p className="text-[10px] sm:text-xs text-zinc-400 mt-1 sm:mt-2 font-medium truncate">
              24-hour unique reach
            </p>
          </div>

          {/* Card 3: 7-Day Active Reach */}
          <div className="bg-zinc-900/60 border border-zinc-800/80 hover:border-purple-500/40 p-3 sm:p-4.5 rounded-xl transition-all shadow-md group">
            <div className="flex items-center justify-between text-zinc-400 mb-1.5">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-purple-400 truncate">
                7-Day Active Reach
              </span>
              <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-400 shrink-0" />
            </div>
            <div className="text-2xl sm:text-4xl font-black text-white tracking-tight group-hover:scale-105 transition-transform duration-200">
              {traffic.week_visitors.toLocaleString()}
            </div>
            <p className="text-[10px] sm:text-xs text-zinc-400 mt-1 sm:mt-2 font-medium truncate">
              Weekly visitor volume
            </p>
          </div>

          {/* Card 4: 30-Day Monthly Reach */}
          <div className="bg-zinc-900/60 border border-zinc-800/80 hover:border-pink-500/40 p-3 sm:p-4.5 rounded-xl transition-all shadow-md group">
            <div className="flex items-center justify-between text-zinc-400 mb-1.5">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-pink-400 truncate">
                30-Day Traffic
              </span>
              <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-pink-400 shrink-0" />
            </div>
            <div className="text-2xl sm:text-4xl font-black text-white tracking-tight group-hover:scale-105 transition-transform duration-200">
              {traffic.month_visitors.toLocaleString()}
            </div>
            <p className="text-[10px] sm:text-xs text-zinc-400 mt-1 sm:mt-2 font-medium truncate">
              Monthly impressions
            </p>
          </div>

        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <StatCard title="Total Videos" value={stats.total_videos} change="+0%" icon={PlayCircle} color="orange" />
        <StatCard title="Total Users" value={stats.total_users} change="+0%" icon={Users} color="blue" />
        <StatCard title="Total Views" value={stats.total_views} change="+0%" icon={Eye} color="pink" />
        <StatCard title="Total Revenue" value="$0" change="+0%" icon={DollarSign} color="emerald" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Watch Time Chart */}
        <div className="lg:col-span-2 bg-[#111111] border border-zinc-800/50 p-4 sm:p-6 rounded-2xl shadow-xl">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-500" /> Watch Time & Views Overview
            </h3>
          </div>
          <div className="h-[220px] sm:h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={viewData}>
                <defs>
                  <linearGradient id="colorWatchTime" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ec4899" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="name" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis yAxisId="left" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${val/1000}k`} />
                <YAxis yAxisId="right" orientation="right" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}h`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}
                  itemStyle={{ fontWeight: 'bold' }}
                />
                <Area yAxisId="left" type="monotone" dataKey="views" name="Views" stroke="#ec4899" strokeWidth={2} fillOpacity={1} fill="url(#colorViews)" />
                <Area yAxisId="right" type="monotone" dataKey="watchTime" name="Watch Time (hrs)" stroke="#f97316" strokeWidth={3} fillOpacity={1} fill="url(#colorWatchTime)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Demographics Pie Chart */}
        <div className="bg-[#111111] border border-zinc-800/50 p-6 rounded-2xl shadow-xl flex flex-col">
          <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-2">
            <UserCircle className="w-5 h-5 text-blue-500" /> User Demographics
          </h3>
          <p className="text-sm text-zinc-400 mb-4">Gender distribution among active users.</p>
          
          <div className="flex-1 min-h-[200px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={demoData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {demoData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-black text-white">0%</span>
              <span className="text-xs font-bold text-blue-500">Male</span>
            </div>
          </div>
          
          <div className="flex justify-center gap-4 mt-4 text-sm font-semibold">
            {demoData.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }}></div>
                <span className="text-zinc-300">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Peak Activity Chart */}
        <div className="bg-[#111111] border border-zinc-800/50 p-4 sm:p-6 rounded-2xl shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-500" /> Peak User Activity
            </h3>
            <select 
              className="bg-[#1a1a1a] border border-zinc-800 text-xs sm:text-sm rounded-lg px-3 py-1.5 text-zinc-300 outline-none focus:border-pink-500 self-start sm:self-auto"
              value={durationFilter}
              onChange={(e) => setDurationFilter(e.target.value)}
            >
              <option value="All">All Durations</option>
              <option value="Short">Active &lt; 5 mins</option>
              <option value="Medium">Active 5-20 mins</option>
              <option value="Long">Active &gt; 20 mins</option>
            </select>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400 mb-4 sm:mb-6">Shows what time of day users are most active.</p>
          
          <div className="h-[200px] sm:h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={peakHoursData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="hour" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{fill: '#18181b'}}
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}
                  itemStyle={{ color: '#a855f7', fontWeight: 'bold' }}
                />
                <Bar dataKey="active" name="Active Users (k)" fill="#a855f7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Videos Table */}
        <div className="bg-[#111111] border border-zinc-800/50 rounded-2xl shadow-xl overflow-hidden flex flex-col">
          <div className="p-4 sm:p-6 border-b border-zinc-800/50 flex justify-between items-center">
            <h3 className="text-base sm:text-lg font-bold text-white">Top Performing Videos</h3>
            <button className="text-sm text-pink-500 font-semibold hover:text-pink-400 flex items-center gap-1">
              View All <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#161616] text-zinc-400">
                <tr>
                  <th className="px-6 py-4 font-semibold">Video</th>
                  <th className="px-6 py-4 font-semibold">Total Views</th>
                  <th className="px-6 py-4 font-semibold">Revenue Generated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50 text-zinc-300">
                {topVideos.map(video => (
                  <tr key={video.id} className="hover:bg-[#161616] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-8 bg-zinc-800 rounded flex items-center justify-center shrink-0">
                          <PlayCircle className="w-4 h-4 text-zinc-500" />
                        </div>
                        <span className="font-medium text-white truncate max-w-[200px]">{video.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold">{video.views}</td>
                    <td className="px-6 py-4 text-emerald-400 font-medium">{video.rev}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
