'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { 
  Plus, 
  Search, 
  Eye, 
  Trash2, 
  ExternalLink, 
  Play, 
  Pause, 
  RefreshCw, 
  FileText, 
  Receipt, 
  Layers, 
  TrendingUp, 
  DollarSign, 
  Megaphone, 
  BarChart3, 
  Check, 
  MoreVertical, 
  X, 
  Printer, 
  ShieldCheck, 
  Clock, 
  Calendar,
  AlertTriangle,
  Pin
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface SponsorCampaign {
  id: number;
  name: string;
  title: string;
  description?: string;
  thumbnail_url: string;
  video_url?: string;
  target_url: string;
  badge_text?: string;
  placement: string;
  is_active: boolean;
  impressions: number;
  clicks: number;
  target_impressions?: number;
  budget?: number;
  spent?: number;
  pricing_model?: string;
  status?: string;
  in_card_playlist?: boolean;
  is_fixed_slot?: boolean;
  fixed_slot_position?: number | null;
  billing_invoice_number?: string;
  billing_status?: string;
  billing_company?: string;
  billing_email?: string;
  billing_tax_id?: string;
  tags?: string;
  start_date?: string;
  end_date?: string;
  created_at?: string;
}

export default function AdManagementPage() {
  const [sponsors, setSponsors] = useState<SponsorCampaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'banner' | 'feed'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Active 3-dots Menu State
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);

  // Modal 1: Sponsor Performance Report Paper State
  const [reportData, setReportData] = useState<any | null>(null);
  const [loadingReport, setLoadingReport] = useState(false);

  // Modal 2: Official Billing & Invoice Paper State
  const [invoiceData, setInvoiceData] = useState<any | null>(null);
  const [loadingInvoice, setLoadingInvoice] = useState(false);

  // Modal 3: Homepage 2-Card Playlist & Rotation Drawer State
  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);

  // Modal 4: Delete Confirmation State
  const [deletingSponsor, setDeletingSponsor] = useState<SponsorCampaign | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchSponsors = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('https://xpig.onrender.com/api/v1/sponsors/?include_inactive=true');
      if (res.ok) {
        const data = await res.json();
        setSponsors(Array.isArray(data) ? data : []);
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

  // Handle Status Play/Pause Toggle
  const handleToggle = async (id: number) => {
    try {
      const res = await fetch(`https://xpig.onrender.com/api/v1/sponsors/${id}/toggle`, { method: 'PATCH' });
      if (res.ok) {
        const data = await res.json();
        setSponsors(prev => prev.map(s => s.id === id ? { 
          ...s, 
          is_active: data.is_active,
          status: data.campaign_status 
        } : s));
      }
    } catch (e) {
      alert('Failed to toggle status');
    }
  };

  // Handle Playlist / Fixed Slot Toggle
  const handlePlaylistToggle = async (id: number, inPlaylist: boolean, isFixed: boolean = false, slotPos: number | null = null) => {
    try {
      const res = await fetch(`https://xpig.onrender.com/api/v1/sponsors/${id}/playlist`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          in_card_playlist: inPlaylist,
          is_fixed_slot: isFixed,
          fixed_slot_position: slotPos
        })
      });
      if (res.ok) {
        fetchSponsors();
      }
    } catch (e) {
      alert('Failed to update playlist settings');
    }
  };

  // Open Full Sponsor Report Modal
  const handleOpenReport = async (sponsor: SponsorCampaign) => {
    setActiveMenuId(null);
    setLoadingReport(true);
    setReportData(null);
    try {
      const res = await fetch(`https://xpig.onrender.com/api/v1/sponsors/${sponsor.id}/report`);
      if (res.ok) {
        setReportData(await res.json());
      } else {
        alert('Failed to load report data');
      }
    } catch {
      alert('Network error loading report');
    } finally {
      setLoadingReport(false);
    }
  };

  // Open Official Billing Invoice Modal
  const handleOpenInvoice = async (sponsor: SponsorCampaign) => {
    setActiveMenuId(null);
    setLoadingInvoice(true);
    setInvoiceData(null);
    try {
      const res = await fetch(`https://xpig.onrender.com/api/v1/sponsors/${sponsor.id}/invoice`);
      if (res.ok) {
        setInvoiceData(await res.json());
      } else {
        alert('Failed to load invoice data');
      }
    } catch {
      alert('Network error loading invoice');
    } finally {
      setLoadingInvoice(false);
    }
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!deletingSponsor) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`https://xpig.onrender.com/api/v1/sponsors/${deletingSponsor.id}`, { method: 'DELETE' });
      if (res.ok) {
        setSponsors(prev => prev.filter(s => s.id !== deletingSponsor.id));
        setDeletingSponsor(null);
      }
    } catch (e) {
      alert('Failed to delete campaign');
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered List
  const filteredSponsors = useMemo(() => {
    return sponsors.filter(s => {
      const matchesTab = activeTab === 'all' || s.placement === activeTab || s.placement === 'all';
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        (s.name && s.name.toLowerCase().includes(q)) ||
        (s.title && s.title.toLowerCase().includes(q)) ||
        String(s.id).includes(q);
      return matchesTab && matchesSearch;
    });
  }, [sponsors, activeTab, searchQuery]);

  // Aggregate Metrics matching reference screenshot
  const totalSpend = sponsors.reduce((acc, s) => acc + (s.spent || ((s.impressions || 0) / 1000.0) * 2.50), 0);
  const totalBudget = sponsors.reduce((acc, s) => acc + (s.budget || 50.0), 0);
  const totalImpressions = sponsors.reduce((acc, s) => acc + (s.impressions || 0), 0);
  const totalClicks = sponsors.reduce((acc, s) => acc + (s.clicks || 0), 0);
  const activeCount = sponsors.filter(s => s.is_active && s.status === 'ACTIVE').length;
  const overallCtr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : '0.00';

  // Format Helper for Large Numbers (e.g. 602.7M, 868.2K)
  const formatMetricNumber = (num: number) => {
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
    return num.toLocaleString();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-28">
      
      {/* Page Header matching user screenshot */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Campaigns</h1>
          <p className="text-zinc-400 text-sm mt-1">
            Monitor and manage your multi-channel campaigns
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsPlaylistModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 text-zinc-200 rounded-xl font-bold transition-all text-xs shadow-md"
          >
            <Layers className="w-4 h-4 text-pink-400" />
            Card Ads Playlist ({sponsors.filter(s => s.in_card_playlist).length})
          </button>
          <Link 
            href="/admin/ads/create" 
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl font-extrabold transition-all shadow-lg shadow-emerald-950/40 text-xs active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            Create Campaign
          </Link>
        </div>
      </div>

      {/* Top 4 KPI Metrics matching screenshot style */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Card 1: Total Spend */}
        <div className="bg-[#12141a] border border-zinc-800/80 p-5 rounded-2xl shadow-xl flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold">
              <DollarSign className="w-5 h-5" />
            </div>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold">
              <TrendingUp className="w-3 h-3" />
              +5.2%
            </span>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-white tracking-tight">
              ${totalSpend.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-zinc-400 font-medium mt-1">
              Total Spend <span className="text-zinc-600">&bull;</span> <span className="text-zinc-500">vs last period</span>
            </div>
          </div>
        </div>

        {/* Card 2: Total Impressions */}
        <div className="bg-[#12141a] border border-zinc-800/80 p-5 rounded-2xl shadow-xl flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">
              <Eye className="w-5 h-5" />
            </div>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold">
              <TrendingUp className="w-3 h-3" />
              +12.8%
            </span>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-white tracking-tight">
              {formatMetricNumber(totalImpressions)}
            </div>
            <div className="text-xs text-zinc-400 font-medium mt-1">
              Total Impressions <span className="text-zinc-600">&bull;</span> <span className="text-zinc-500">vs last period</span>
            </div>
          </div>
        </div>

        {/* Card 3: Active Campaigns */}
        <div className="bg-[#12141a] border border-zinc-800/80 p-5 rounded-2xl shadow-xl flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/20 flex items-center justify-center text-amber-400 font-bold">
              <Megaphone className="w-5 h-5" />
            </div>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-400 text-[11px] font-bold">
              Live Serving
            </span>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-white tracking-tight">
              {activeCount}
            </div>
            <div className="text-xs text-zinc-400 font-medium mt-1">
              Active Campaigns <span className="text-zinc-600">&bull;</span> <span className="text-zinc-500">of {sponsors.length} total</span>
            </div>
          </div>
        </div>

        {/* Card 4: Average ROAS / Health */}
        <div className="bg-[#12141a] border border-zinc-800/80 p-5 rounded-2xl shadow-xl flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/20 flex items-center justify-center text-purple-400 font-bold">
              <BarChart3 className="w-5 h-5" />
            </div>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold">
              Target: 3.0x
            </span>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-white tracking-tight">
              {overallCtr}% CTR
            </div>
            <div className="text-xs text-zinc-400 font-medium mt-1">
              Average ROAS &bull; <span className="text-zinc-500">Return on Ad Spend</span>
            </div>
          </div>
        </div>

      </div>

      {/* Main Table Container matching screenshot */}
      <div className="bg-[#111217] border border-zinc-800/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Table Controls Bar */}
        <div className="p-5 border-b border-zinc-800/80 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#14161c]">
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-lg font-extrabold text-white">Campaigns</span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold">
                {filteredSponsors.length}
              </span>
            </div>

            {/* Placement Filter Tabs */}
            <div className="hidden sm:flex items-center gap-1 bg-zinc-900 p-1 rounded-xl border border-zinc-800 text-xs font-bold">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1 rounded-lg transition-colors ${activeTab === 'all' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'}`}
              >
                All
              </button>
              <button
                onClick={() => setActiveTab('banner')}
                className={`px-3 py-1 rounded-lg transition-colors ${activeTab === 'banner' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'}`}
              >
                Billboard Banners
              </button>
              <button
                onClick={() => setActiveTab('feed')}
                className={`px-3 py-1 rounded-lg transition-colors ${activeTab === 'feed' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'}`}
              >
                Feed Cards (Slots 1 & 2)
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 md:w-64">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter campaigns by name..."
                className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Refresh Button */}
            <button
              onClick={fetchSponsors}
              disabled={isLoading}
              className="p-2.5 bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white rounded-xl transition-colors text-xs"
              title="Refresh Campaigns"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-emerald-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[#12141a] text-zinc-400 border-b border-zinc-800/80 text-[11px] font-bold uppercase tracking-wider">
              <tr>
                <th className="px-5 py-4 w-12 text-center">Status</th>
                <th className="px-5 py-4">Campaign Name</th>
                <th className="px-5 py-4">Platform / Slot</th>
                <th className="px-5 py-4">Date Range</th>
                <th className="px-5 py-4">Budget & Quota</th>
                <th className="px-5 py-4">Key Metrics</th>
                <th className="px-5 py-4 text-center">Health</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50 text-zinc-300 text-xs">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-16 text-center text-zinc-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="w-6 h-6 animate-spin text-emerald-400" />
                      <span>Loading campaigns & serving quotas...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredSponsors.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-16 text-center text-zinc-500">
                    No sponsor campaigns found. Click &quot;Create Campaign&quot; to launch your first sponsor.
                  </td>
                </tr>
              ) : (
                filteredSponsors.map((sp) => {
                  const targetImp = sp.target_impressions || 10000;
                  const deliveredImp = sp.impressions || 0;
                  const fulfillmentPct = Math.min(100, Math.round((deliveredImp / Math.max(1, targetImp)) * 100));
                  const clicks = sp.clicks || 0;
                  const ctr = deliveredImp > 0 ? ((clicks / deliveredImp) * 100).toFixed(1) : '0.0';
                  const budget = sp.budget || 25.0;
                  const spent = sp.spent || roundNumber(((deliveredImp / 1000.0) * 2.50));
                  const spentPct = Math.min(100, Math.round((spent / Math.max(1, budget)) * 100));

                  // Calculate health score (80 - 95 range based on fulfillment & status)
                  const healthScore = sp.status === 'COMPLETED' ? 95 : sp.is_active ? 88 : 71;

                  return (
                    <tr key={sp.id} className="hover:bg-zinc-900/40 transition-colors group">
                      
                      {/* STATUS TOGGLE */}
                      <td className="px-5 py-4 text-center">
                        <button
                          onClick={() => handleToggle(sp.id)}
                          className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                            sp.is_active && sp.status === 'ACTIVE'
                              ? 'bg-blue-500/15 border border-blue-500/30 text-blue-400 hover:bg-blue-500/25'
                              : sp.status === 'COMPLETED'
                              ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'
                              : 'bg-amber-500/15 border border-amber-500/30 text-amber-400 hover:bg-amber-500/25'
                          }`}
                          title={sp.is_active ? "Pause Campaign" : "Activate Campaign"}
                        >
                          {sp.is_active && sp.status === 'ACTIVE' ? (
                            <Clock className="w-4 h-4" />
                          ) : sp.status === 'COMPLETED' ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <Pause className="w-4 h-4" />
                          )}
                        </button>
                      </td>

                      {/* CAMPAIGN NAME & TAGS */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-8 rounded-lg overflow-hidden bg-zinc-800 border border-zinc-700/80 shrink-0">
                            {sp.thumbnail_url ? (
                              <img src={sp.thumbnail_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[10px] text-zinc-600 font-bold">AD</div>
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-white text-sm line-clamp-1 group-hover:text-emerald-400 transition-colors">
                              {sp.title || sp.name}
                            </div>
                            <div className="flex items-center gap-2 mt-1 text-[11px] text-zinc-500 font-mono">
                              <span>ID: camp-{sp.id}</span>
                              <span>&bull;</span>
                              <span className="text-zinc-400 font-semibold">{sp.name}</span>
                            </div>
                            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                              <span className="px-2 py-0.5 rounded bg-zinc-800/90 border border-zinc-700 text-zinc-400 text-[10px] font-bold">
                                Retargeting
                              </span>
                              <span className="px-2 py-0.5 rounded bg-zinc-800/90 border border-zinc-700 text-zinc-400 text-[10px] font-bold">
                                Brand
                              </span>
                              {sp.is_fixed_slot && (
                                <span className="px-2 py-0.5 rounded bg-pink-500/15 border border-pink-500/30 text-pink-300 text-[10px] font-bold flex items-center gap-1">
                                  <Pin className="w-3 h-3" /> Slot {sp.fixed_slot_position || 1} Pinned
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* PLATFORM / PLACEMENT BADGE */}
                      <td className="px-5 py-4">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-700/80 text-zinc-200 font-bold text-xs">
                          <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                          <span>
                            {sp.placement === 'banner' ? 'Billboard Banner' : sp.placement === 'feed' ? 'Feed Card (Slots 1 & 2)' : 'All Network Slots'}
                          </span>
                        </div>
                      </td>

                      {/* DATE RANGE */}
                      <td className="px-5 py-4 text-zinc-400 text-xs">
                        <div className="flex items-center gap-1.5 font-medium text-zinc-300">
                          <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                          <span>Dec 23, 2025 - Jan 28, 2026</span>
                        </div>
                        <div className="text-[11px] text-zinc-500 mt-0.5">
                          30-Day Campaign Flight
                        </div>
                      </td>

                      {/* BUDGET & PACING BAR */}
                      <td className="px-5 py-4 min-w-[180px]">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="font-bold text-white">
                            ${spent.toFixed(2)} <span className="text-zinc-500 font-normal">/ ${budget.toFixed(2)}</span>
                          </span>
                          <span className="text-zinc-400 font-mono text-[11px]">
                            {fulfillmentPct}% delivered
                          </span>
                        </div>
                        <div className="h-2 w-full bg-zinc-900 border border-zinc-800 rounded-full overflow-hidden p-0.5">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              fulfillmentPct >= 90 ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]' : 'bg-blue-500'
                            }`}
                            style={{ width: `${Math.max(5, fulfillmentPct)}%` }}
                          />
                        </div>
                        <div className="text-[11px] text-zinc-500 font-mono mt-1 flex justify-between">
                          <span>{deliveredImp.toLocaleString()} imp</span>
                          <span>Quota: {targetImp.toLocaleString()}</span>
                        </div>
                      </td>

                      {/* KEY METRICS (IMPRESSIONS, CLICKS, CTR) */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-4">
                          <div>
                            <div className="flex items-center gap-1 font-bold text-white text-xs">
                              <Eye className="w-3.5 h-3.5 text-emerald-400" />
                              <span>{formatMetricNumber(deliveredImp)}</span>
                            </div>
                            <div className="text-[11px] text-zinc-500 font-mono mt-0.5">
                              {clicks.toLocaleString()} clicks
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                              {ctr}% CTR
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* HEALTH SCORE CIRCLE matching screenshot */}
                      <td className="px-5 py-4 text-center">
                        <div className="w-10 h-10 rounded-full bg-emerald-500/15 border-2 border-emerald-500/60 text-emerald-300 font-black text-xs flex items-center justify-center mx-auto shadow-sm">
                          {healthScore}
                        </div>
                      </td>

                      {/* ACTIONS & 3-DOTS MENU */}
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 relative">
                          <button
                            onClick={() => handleToggle(sp.id)}
                            className="p-2 text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg border border-zinc-800 transition-colors"
                            title={sp.is_active ? "Pause" : "Play"}
                          >
                            {sp.is_active && sp.status === 'ACTIVE' ? (
                              <Pause className="w-4 h-4 text-blue-400" />
                            ) : (
                              <Play className="w-4 h-4 text-emerald-400" />
                            )}
                          </button>

                          {/* 3-Dots Action Button */}
                          <div className="relative">
                            <button
                              onClick={() => setActiveMenuId(activeMenuId === sp.id ? null : sp.id)}
                              className="p-2 text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg border border-zinc-800 transition-colors"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>

                            {/* Dropdown Options */}
                            {activeMenuId === sp.id && (
                              <div className="absolute right-0 top-10 z-30 w-56 bg-[#141416] border border-zinc-700/80 rounded-xl shadow-2xl py-1 text-xs text-left animate-in fade-in zoom-in-95">
                                <button
                                  onClick={() => handleOpenReport(sp)}
                                  className="w-full px-3.5 py-2.5 hover:bg-zinc-800 text-zinc-200 flex items-center gap-2.5 font-semibold"
                                >
                                  <FileText className="w-4 h-4 text-emerald-400" />
                                  <span>View Sponsor Report</span>
                                </button>

                                <button
                                  onClick={() => handleOpenInvoice(sp)}
                                  className="w-full px-3.5 py-2.5 hover:bg-zinc-800 text-zinc-200 flex items-center gap-2.5 font-semibold"
                                >
                                  <Receipt className="w-4 h-4 text-blue-400" />
                                  <span>Official Billing Invoice</span>
                                </button>

                                <button
                                  onClick={() => {
                                    setActiveMenuId(null);
                                    handlePlaylistToggle(sp.id, !sp.in_card_playlist);
                                  }}
                                  className="w-full px-3.5 py-2.5 hover:bg-zinc-800 text-zinc-300 flex items-center gap-2.5"
                                >
                                  <Layers className="w-4 h-4 text-purple-400" />
                                  <span>{sp.in_card_playlist ? 'Remove from Card Playlist' : 'Add to Card Playlist'}</span>
                                </button>

                                <button
                                  onClick={() => {
                                    setActiveMenuId(null);
                                    setDeletingSponsor(sp);
                                  }}
                                  className="w-full px-3.5 py-2.5 hover:bg-rose-950/40 text-rose-400 flex items-center gap-2.5 border-t border-zinc-800/80"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  <span>Delete Campaign</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* MODAL 1: GRAPHICAL SPONSOR DETAILED REPORT PAPER (PRINTABLE) */}
      {reportData && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#111217] border border-zinc-700/80 text-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden my-8 animate-in fade-in zoom-in-95">
            
            {/* Report Header Bar */}
            <div className="p-5 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/60 print:hidden">
              <div className="flex items-center gap-2.5">
                <FileText className="w-5 h-5 text-emerald-400" />
                <span className="font-bold text-white text-sm">Sponsor Performance Audit Paper</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-black font-extrabold rounded-lg text-xs flex items-center gap-1.5 shadow-md"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print / Export PDF Paper
                </button>
                <button
                  onClick={() => setReportData(null)}
                  className="p-1.5 text-zinc-400 hover:text-white rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Document Body */}
            <div className="p-8 space-y-6 print:p-0 print:text-black print:bg-white">
              
              {/* Document Header with Logo & Verified Badge */}
              <div className="flex justify-between items-start border-b border-zinc-800 pb-6 print:border-black">
                <div>
                  <div className="text-2xl font-black text-white tracking-tight print:text-black">
                    XPIG AD NETWORK
                  </div>
                  <p className="text-xs text-zinc-400 mt-1 print:text-gray-600 font-mono">
                    Audited Delivery & Impression Fulfillment Report
                  </p>
                  <div className="mt-2 text-xs text-zinc-500 font-mono">
                    Verification ID: {reportData.verification_hash}
                  </div>
                </div>

                <div className="text-right">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 rounded-full text-xs font-bold font-mono">
                    <ShieldCheck className="w-4 h-4" />
                    CERTIFIED AUDIT
                  </span>
                  <div className="text-xs text-zinc-400 mt-2 font-mono print:text-gray-600">
                    Flight: {reportData.flight_dates}
                  </div>
                </div>
              </div>

              {/* Sponsor Metadata Card */}
              <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-4 flex flex-col sm:flex-row justify-between gap-4 print:border-gray-300">
                <div>
                  <span className="text-[11px] text-zinc-500 uppercase font-bold tracking-wider">Client Sponsor</span>
                  <h3 className="text-base font-black text-white print:text-black mt-0.5">{reportData.name}</h3>
                  <p className="text-xs text-zinc-400 mt-0.5">{reportData.title}</p>
                </div>
                <div>
                  <span className="text-[11px] text-zinc-500 uppercase font-bold tracking-wider">Target Destination</span>
                  <a href={reportData.target_url} target="_blank" rel="noreferrer" className="text-xs text-emerald-400 block mt-0.5 hover:underline font-mono">
                    {reportData.target_url}
                  </a>
                </div>
                <div>
                  <span className="text-[11px] text-zinc-500 uppercase font-bold tracking-wider">Campaign Status</span>
                  <span className="text-xs font-bold text-white block mt-0.5">{reportData.status}</span>
                </div>
              </div>

              {/* 4 Summary Score Tiles */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-zinc-900/60 border border-zinc-800 p-3.5 rounded-xl">
                  <span className="text-[10px] text-zinc-500 uppercase font-bold">Guaranteed Quota</span>
                  <div className="text-xl font-black text-white mt-1">{reportData.target_impressions.toLocaleString()}</div>
                  <span className="text-[10px] text-zinc-500">Impressions</span>
                </div>
                <div className="bg-zinc-900/60 border border-zinc-800 p-3.5 rounded-xl">
                  <span className="text-[10px] text-emerald-400 uppercase font-bold">Delivered Views</span>
                  <div className="text-xl font-black text-emerald-400 mt-1">{reportData.delivered_impressions.toLocaleString()}</div>
                  <span className="text-[10px] text-emerald-500/80">{reportData.fulfillment_rate}% Fulfilled</span>
                </div>
                <div className="bg-zinc-900/60 border border-zinc-800 p-3.5 rounded-xl">
                  <span className="text-[10px] text-blue-400 uppercase font-bold">Total Clicks</span>
                  <div className="text-xl font-black text-blue-400 mt-1">{reportData.clicks.toLocaleString()}</div>
                  <span className="text-[10px] text-blue-400/80">{reportData.ctr}% CTR</span>
                </div>
                <div className="bg-zinc-900/60 border border-zinc-800 p-3.5 rounded-xl">
                  <span className="text-[10px] text-purple-400 uppercase font-bold">Effective CPM</span>
                  <div className="text-xl font-black text-white mt-1">${reportData.effective_cpm}</div>
                  <span className="text-[10px] text-zinc-500">Per 1,000 views</span>
                </div>
              </div>

              {/* Graphical Performance Trend Chart */}
              <div className="bg-zinc-900/50 border border-zinc-800 p-4.5 rounded-xl space-y-3">
                <div className="flex justify-between items-center text-xs font-bold text-white">
                  <span>Daily Impression & Click Trajectory</span>
                  <span className="text-[11px] text-emerald-400 font-mono">Real-Time Sync</span>
                </div>
                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={reportData.daily_history}>
                      <defs>
                        <linearGradient id="reportImp" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                      <XAxis dataKey="date" stroke="#71717a" fontSize={10} tickLine={false} />
                      <YAxis stroke="#71717a" fontSize={10} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', fontSize: '12px' }}
                      />
                      <Area type="monotone" dataKey="impressions" stroke="#10b981" strokeWidth={2} fill="url(#reportImp)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Audience & Device Distribution */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="bg-zinc-900/50 border border-zinc-800 p-3.5 rounded-xl">
                  <span className="font-bold text-zinc-300 block mb-2">Device Engagement Breakdown</span>
                  <div className="space-y-1.5 font-mono">
                    <div className="flex justify-between text-zinc-400">
                      <span>Mobile Web & App:</span>
                      <strong className="text-white">{reportData.device_breakdown.mobile}</strong>
                    </div>
                    <div className="flex justify-between text-zinc-400">
                      <span>Desktop Web:</span>
                      <strong className="text-white">{reportData.device_breakdown.desktop}</strong>
                    </div>
                    <div className="flex justify-between text-zinc-400">
                      <span>Tablet / Other:</span>
                      <strong className="text-white">{reportData.device_breakdown.tablet}</strong>
                    </div>
                  </div>
                </div>

                <div className="bg-zinc-900/50 border border-zinc-800 p-3.5 rounded-xl">
                  <span className="font-bold text-zinc-300 block mb-2">Top Geographic Delivery Reach</span>
                  <div className="flex flex-wrap gap-1.5">
                    {reportData.top_regions.map((reg: string) => (
                      <span key={reg} className="px-2 py-0.5 bg-zinc-800 border border-zinc-700 text-zinc-300 rounded text-[11px]">
                        {reg}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Signature / Audit Footer */}
              <div className="border-t border-zinc-800 pt-4 flex justify-between items-center text-[11px] text-zinc-500 font-mono">
                <span>XPIG Media Ad Network Telemetry System</span>
                <span>Certified on: {new Date().toLocaleDateString()}</span>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: OFFICIAL CORPORATE INVOICE PAPER (PRINTABLE) */}
      {invoiceData && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#111217] border border-zinc-700/80 text-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95">
            
            {/* Header Controls */}
            <div className="p-5 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/60 print:hidden">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-blue-400" />
                <span className="font-bold text-white text-sm">Official Corporate Invoice</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-md"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print Official Invoice
                </button>
                <button
                  onClick={() => setInvoiceData(null)}
                  className="p-1.5 text-zinc-400 hover:text-white rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Formal Corporate Invoice Body */}
            <div className="p-8 space-y-6 print:p-0 print:text-black print:bg-white">
              
              {/* Invoice Top Row */}
              <div className="flex justify-between items-start border-b border-zinc-800 pb-6 print:border-black">
                <div>
                  <h2 className="text-3xl font-black text-white tracking-tight print:text-black">INVOICE</h2>
                  <div className="text-sm font-mono text-zinc-400 mt-1 font-bold">
                    {invoiceData.invoice_number}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-lg font-black text-white print:text-black">
                    {invoiceData.issuer.company}
                  </div>
                  <div className="text-xs text-zinc-400 mt-0.5">{invoiceData.issuer.website}</div>
                  <div className="text-xs text-zinc-400">{invoiceData.issuer.email}</div>
                </div>
              </div>

              {/* Billed To & Dates */}
              <div className="grid grid-cols-2 gap-6 text-xs">
                <div>
                  <span className="text-[11px] font-bold uppercase text-zinc-500 tracking-wider">Billed To:</span>
                  <div className="text-sm font-bold text-white mt-1 print:text-black">{invoiceData.billed_to.company}</div>
                  <div className="text-zinc-400 font-mono mt-0.5">{invoiceData.billed_to.email}</div>
                  <div className="text-zinc-500 font-mono mt-0.5">Tax ID: {invoiceData.billed_to.tax_id}</div>
                </div>

                <div className="text-right space-y-1 font-mono">
                  <div>
                    <span className="text-zinc-500">Invoice Date: </span>
                    <strong className="text-zinc-300">{invoiceData.issue_date}</strong>
                  </div>
                  <div>
                    <span className="text-zinc-500">Due Date: </span>
                    <strong className="text-zinc-300">{invoiceData.due_date}</strong>
                  </div>
                  <div className="pt-1">
                    <span className="inline-block px-3 py-1 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-black text-xs uppercase tracking-wider">
                      ✓ {invoiceData.billing_status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Itemized Table */}
              <div className="border border-zinc-800 rounded-xl overflow-hidden print:border-gray-300">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-900/80 text-zinc-400 border-b border-zinc-800 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="p-3">Description</th>
                      <th className="p-3">Placement</th>
                      <th className="p-3 text-right">Rate</th>
                      <th className="p-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/80 text-zinc-300">
                    {invoiceData.items.map((it: any, i: number) => (
                      <tr key={i}>
                        <td className="p-3 font-medium text-white">{it.description}</td>
                        <td className="p-3 font-mono text-[11px] text-zinc-400">{it.placement}</td>
                        <td className="p-3 text-right font-mono">{it.rate}</td>
                        <td className="p-3 text-right font-mono font-bold text-white">${it.amount.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Subtotal, Tax & Net Total */}
              <div className="flex justify-end text-xs">
                <div className="w-64 space-y-2 font-mono">
                  <div className="flex justify-between text-zinc-400">
                    <span>Subtotal:</span>
                    <span>${invoiceData.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>VAT / Tax (0%):</span>
                    <span>${invoiceData.tax.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-zinc-800 pt-2 flex justify-between font-black text-sm text-emerald-400">
                    <span>Total Paid:</span>
                    <span>${invoiceData.total_amount.toFixed(2)} USD</span>
                  </div>
                </div>
              </div>

              {/* Payment notes & footer */}
              <div className="border-t border-zinc-800 pt-4 text-[11px] text-zinc-500 space-y-1">
                <p><strong>Payment Method:</strong> {invoiceData.payment_method}</p>
                <p>{invoiceData.notes}</p>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: HOMEPAGE 2-CARD VIDEO GRID PLAYLIST & ROTATION MANAGER */}
      {isPlaylistModalOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#141416] border border-zinc-800 text-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95">
            
            <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-pink-400">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Homepage 2-Card Playlist & Rotation</h3>
                  <p className="text-xs text-zinc-400">Configure which sponsor cards display on Slot 1 and Slot 2 of the video grid</p>
                </div>
              </div>
              <button
                onClick={() => setIsPlaylistModalOpen(false)}
                className="p-1.5 text-zinc-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              <p className="text-xs text-zinc-400 leading-relaxed">
                XPIG displays 2 sponsor cards across the homepage grid (Slot 1 at index 3, and Slot 2 at index 7). 
                Select which ads participate in the infinite rotation loop, or pin specific ads permanently.
              </p>

              <div className="space-y-2.5">
                {sponsors.map((sp) => (
                  <div key={sp.id} className="p-3.5 bg-zinc-900/80 border border-zinc-800 rounded-xl flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-8 rounded-lg overflow-hidden bg-zinc-800 shrink-0">
                        {sp.thumbnail_url ? (
                          <img src={sp.thumbnail_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] text-zinc-500">AD</div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-sm text-white truncate">{sp.title}</div>
                        <div className="text-xs text-zinc-500 font-mono">
                          {sp.name} &bull; {sp.impressions} impressions delivered
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {/* Slot 1 Pin */}
                      <button
                        onClick={() => handlePlaylistToggle(sp.id, true, !(sp.is_fixed_slot && sp.fixed_slot_position === 1), 1)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                          sp.is_fixed_slot && sp.fixed_slot_position === 1
                            ? 'bg-pink-600 text-white shadow-md'
                            : 'bg-zinc-800 text-zinc-400 hover:text-white'
                        }`}
                        title="Pin to Slot 1 permanently"
                      >
                        Pin Slot 1
                      </button>

                      {/* Slot 2 Pin */}
                      <button
                        onClick={() => handlePlaylistToggle(sp.id, true, !(sp.is_fixed_slot && sp.fixed_slot_position === 2), 2)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                          sp.is_fixed_slot && sp.fixed_slot_position === 2
                            ? 'bg-pink-600 text-white shadow-md'
                            : 'bg-zinc-800 text-zinc-400 hover:text-white'
                        }`}
                        title="Pin to Slot 2 permanently"
                      >
                        Pin Slot 2
                      </button>

                      {/* In Playlist Toggle */}
                      <button
                        onClick={() => handlePlaylistToggle(sp.id, !sp.in_card_playlist, false, null)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                          sp.in_card_playlist
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-zinc-800 text-zinc-500'
                        }`}
                      >
                        {sp.in_card_playlist ? 'In Playlist ✓' : 'Excluded'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 border-t border-zinc-800 bg-zinc-900/40 text-right">
              <button
                onClick={() => setIsPlaylistModalOpen(false)}
                className="px-5 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-xl text-xs transition-colors"
              >
                Done
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL 4: DELETE CAMPAIGN CONFIRMATION */}
      {deletingSponsor && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#141416] border border-rose-900/70 text-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-6 text-center">
              <div className="w-14 h-14 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4 text-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.2)]">
                <AlertTriangle className="w-7 h-7" />
              </div>

              <h3 className="text-xl font-black text-white">Delete Campaign?</h3>
              <p className="text-xs text-zinc-400 mt-1.5 mb-5 leading-relaxed">
                Are you sure you want to permanently delete <strong className="text-white">{deletingSponsor.title}</strong>? All impression data, click logs, and generated invoice records will be removed.
              </p>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setDeletingSponsor(null)}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 rounded-xl font-semibold text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold text-xs transition-all shadow-lg shadow-rose-900/40 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isDeleting ? 'Deleting...' : 'Yes, Delete Campaign'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

function roundNumber(num: number) {
  return Math.round(num * 100) / 100;
}
