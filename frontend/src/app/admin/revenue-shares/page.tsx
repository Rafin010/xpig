'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  ShieldAlert, 
  ShieldCheck, 
  DollarSign, 
  TrendingUp, 
  Sliders, 
  Users, 
  Sparkles, 
  RefreshCw, 
  Eye, 
  Percent, 
  AlertTriangle, 
  Edit3, 
  Lock, 
  Check, 
  X, 
  ChevronRight, 
  ArrowUpRight, 
  Calculator, 
  MinusCircle, 
  PlusCircle, 
  Info,
  Building,
  CreditCard,
  Video
} from 'lucide-react';

interface PartnerShare {
  id: number;
  username: string;
  email: string;
  avatar_url?: string;
  role: string;
  uploaded_videos_count: number;
  revenue_share_pct: number;
  extra_cut_pct: number;
  fixed_deduction: number;
  notes: string;
  real_100_earnings: number;
  reported_base: number;
  final_net_payout: number;
  admin_retained: number;
  last_active?: string;
}

interface RevenueSharesData {
  gross_revenue: number;
  total_views: number;
  total_videos: number;
  global_haircut_pct: number;
  visible_pool_revenue: number;
  super_admin_net_profit: number;
  super_admin_profit_margin_pct: number;
  total_founder_payouts: number;
  partners: PartnerShare[];
}

export default function RevenueSharesPage() {
  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<RevenueSharesData | null>(null);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState(false);

  // Global Haircut Slider State
  const [haircutPct, setHaircutPct] = useState<number>(60);

  // Custom Interactive Calculator Playground State
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customRevenue, setCustomRevenue] = useState<number>(10000);
  const [customViews, setCustomViews] = useState<number>(250000);
  const [customHaircut, setCustomHaircut] = useState<number>(60);

  // Edit Modal State
  const [editingPartner, setEditingPartner] = useState<PartnerShare | null>(null);
  const [editSharePct, setEditSharePct] = useState<number>(10);
  const [editExtraCutPct, setEditExtraCutPct] = useState<number>(0);
  const [editFixedDeduction, setEditFixedDeduction] = useState<number>(0);
  const [editNotes, setEditNotes] = useState<string>('');
  const [savingPartner, setSavingPartner] = useState(false);

  // Check superuser role on mount
  useEffect(() => {
    try {
      const role = localStorage.getItem('xpig_admin_role');
      setIsSuperAdmin(role === 'superuser');
    } catch {
      setIsSuperAdmin(false);
    }
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('https://xpig.onrender.com/api/v1/admin/revenue-shares');
      if (res.ok) {
        const json = await res.json();
        setData(json);
        setHaircutPct(json.global_haircut_pct || 60);
        setCustomHaircut(json.global_haircut_pct || 60);
        if (json.gross_revenue > 0) {
          setCustomRevenue(json.gross_revenue);
        }
        if (json.total_views > 0) {
          setCustomViews(json.total_views);
        }
      }
    } catch (err) {
      console.error('Failed to load revenue shares ledger:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isSuperAdmin) {
      fetchData();
    }
  }, [isSuperAdmin]);

  // Save global haircut setting
  const handleSaveHaircut = async () => {
    setSavingSettings(true);
    try {
      const res = await fetch('https://xpig.onrender.com/api/v1/admin/revenue-shares/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ global_haircut_pct: haircutPct }),
      });
      if (res.ok) {
        setSettingsSuccess(true);
        setTimeout(() => setSettingsSuccess(false), 3000);
        fetchData();
      }
    } catch (err) {
      alert('Failed to save global haircut setting.');
    } finally {
      setSavingSettings(false);
    }
  };

  // Open edit modal
  const openEditModal = (p: PartnerShare) => {
    setEditingPartner(p);
    setEditSharePct(p.revenue_share_pct);
    setEditExtraCutPct(p.extra_cut_pct);
    setEditFixedDeduction(p.fixed_deduction);
    setEditNotes(p.notes || '');
  };

  // Save partner share & custom cuts
  const handleSavePartner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPartner) return;
    setSavingPartner(true);

    try {
      const res = await fetch(`https://xpig.onrender.com/api/v1/admin/revenue-shares/${editingPartner.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          revenue_share_pct: Number(editSharePct),
          extra_cut_pct: Number(editExtraCutPct),
          fixed_deduction: Number(editFixedDeduction),
          notes: editNotes.trim(),
        }),
      });

      if (res.ok) {
        setEditingPartner(null);
        fetchData();
      } else {
        alert('Failed to update partner share.');
      }
    } catch (err) {
      alert('Network error updating partner share.');
    } finally {
      setSavingPartner(false);
    }
  };

  // Live Calculated Metrics (Dynamic between Real Mode & Custom Simulation Mode)
  const activeMetrics = useMemo(() => {
    const revenue = isCustomMode ? customRevenue : (data?.gross_revenue || 0);
    const views = isCustomMode ? customViews : (data?.total_views || 0);
    const haircut = isCustomMode ? customHaircut : haircutPct;

    const visibleMultiplier = Math.max(0, Math.min(1, (100 - haircut) / 100));
    const visiblePool = round(revenue * visibleMultiplier);
    const superAdminHaircutRetained = round(revenue * (haircut / 100));

    const partners = (data?.partners || []).map((p) => {
      const real100 = round(revenue * (p.revenue_share_pct / 100));
      const reportedBase = round(visiblePool * (p.revenue_share_pct / 100));
      const effectivePct = Math.max(0, p.revenue_share_pct - p.extra_cut_pct);
      const netPayout = Math.max(0, round((visiblePool * (effectivePct / 100)) - p.fixed_deduction));
      const adminRetained = Math.max(0, round(real100 - netPayout));

      return {
        ...p,
        calculatedReal100: real100,
        calculatedReportedBase: reportedBase,
        calculatedNetPayout: netPayout,
        calculatedAdminRetained: adminRetained,
      };
    });

    const totalPayouts = round(partners.reduce((acc, curr) => acc + curr.calculatedNetPayout, 0));
    const superAdminNet = Math.max(0, round(revenue - totalPayouts));
    const margin = revenue > 0 ? round((superAdminNet / revenue) * 100) : 100;

    return {
      revenue,
      views,
      haircut,
      visiblePool,
      superAdminHaircutRetained,
      totalPayouts,
      superAdminNet,
      margin,
      partners,
    };
  }, [isCustomMode, customRevenue, customViews, customHaircut, haircutPct, data]);

  function round(val: number): number {
    return Math.round(val * 100) / 100;
  }

  // 403 Access Denied Guard
  if (isSuperAdmin === false) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mb-5 text-rose-500 shadow-xl shadow-rose-950/40">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-white">403 • Classified Restricted Area</h2>
        <p className="text-zinc-400 text-sm max-w-md mt-2 mb-6">
          This confidential revenue share and profit distribution ledger is strictly restricted to the Super Admin. Co-Founders and standard roles do not have authorization to view this docket.
        </p>
        <Link
          href="/admin"
          className="px-6 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 hover:text-white rounded-xl text-xs font-bold transition-all"
        >
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto pb-28">
      
      {/* 1. Header & Classified Security Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 sm:pb-6 border-b border-zinc-800/80">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-purple-950/40 to-pink-950/30 border border-purple-500/30 rounded-full text-[11px] font-bold text-purple-300 mb-2.5 shadow-sm">
            <Lock className="w-3.5 h-3.5 text-purple-400" />
            <span>সুপার অ্যাডমিন এক্সক্লুসিভ • গোপন লভ্যাংশ লেজার</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <DollarSign className="w-7 h-7 sm:w-8 sm:h-8 text-emerald-400" />
            <span>কো-ফাউন্ডার রেভিনিউ শেয়ার ও কাটছাঁট লেজার</span>
          </h1>
          <p className="text-zinc-400 text-xs sm:text-sm mt-1 max-w-3xl">
            স্পন্সরদের আসল রেভিনিউ, ৬০% গ্লোবাল হেয়ারকাট (লুকানো লাভ), প্রতিটি কো-ফাউন্ডারের বেস শেয়ার % এবং কাস্টম কাটছাঁট নির্ধারণের স্বয়ংক্রিয় হিসাব।
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsCustomMode(!isCustomMode)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border cursor-pointer ${
              isCustomMode
                ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-black border-amber-400 shadow-lg shadow-orange-900/30 ring-2 ring-amber-400/50'
                : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border-zinc-800'
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span>{isCustomMode ? 'কাস্টম মোড চালু আছে' : 'কাস্টম হিসাব ক্যালকুলেটর'}</span>
          </button>

          <button
            onClick={fetchData}
            disabled={loading}
            className="px-3.5 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2"
            title="Refresh Ledger"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-pink-500' : ''}`} />
          </button>
        </div>
      </div>

      {/* 2. Custom Calculator Playground Notification (When Active) */}
      {isCustomMode && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-zinc-900/90 to-orange-950/30 border border-amber-500/40 text-amber-200 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <Calculator className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-sm text-white flex items-center gap-2">
                  <span>কাস্টম সিমুলেশন ও প্রজেকশন মোড (Custom Playground)</span>
                  <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 text-[10px] rounded-md font-bold uppercase">সক্রিয়</span>
                </h3>
                <p className="text-xs text-amber-300/80 mt-0.5">
                  নিচের ইনপুটগুলো পরিবর্তন করে যেকোনো কাল্পনিক রেভিনিউ ও ভিউজ দিয়ে লাইভ হিসাব পরীক্ষা করুন।
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsCustomMode(false)}
              className="text-xs px-3 py-1.5 bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-300 hover:text-white transition-colors"
            >
              রিয়েল ডাটাতে ফিরে যান
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div>
              <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">
                কাস্টম মোট রেভিনিউ ($)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 font-bold">$</span>
                <input
                  type="number"
                  value={customRevenue}
                  onChange={(e) => setCustomRevenue(Math.max(0, Number(e.target.value)))}
                  className="w-full bg-zinc-900/90 border border-amber-500/40 rounded-xl pl-8 pr-3 py-2 text-sm text-white font-bold focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">
                কাস্টম প্ল্যাটফর্ম ভিউজ
              </label>
              <div className="relative">
                <Eye className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="number"
                  value={customViews}
                  onChange={(e) => setCustomViews(Math.max(0, Number(e.target.value)))}
                  className="w-full bg-zinc-900/90 border border-amber-500/40 rounded-xl pl-9 pr-3 py-2 text-sm text-white font-bold focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">
                হেয়ারকাট অনুপাত (%)
              </label>
              <div className="relative">
                <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
                <input
                  type="number"
                  min="0"
                  max="90"
                  value={customHaircut}
                  onChange={(e) => setCustomHaircut(Math.max(0, Math.min(90, Number(e.target.value))))}
                  className="w-full bg-zinc-900/90 border border-amber-500/40 rounded-xl pl-8 pr-3 py-2 text-sm text-white font-bold focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. 4 Executive KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Gross Platform Revenue */}
        <div className="bg-[#111114] border border-zinc-800/80 rounded-2xl p-5 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">মোট আসল রেভিনিউ</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Building className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">
            ${activeMetrics.revenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-zinc-500 mt-1 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
            <span>স্পন্সর ও অ্যাড ইনকাম (১০০% আসল)</span>
          </p>
        </div>

        {/* Card 2: Platform Views */}
        <div className="bg-[#111114] border border-zinc-800/80 rounded-2xl p-5 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">মোট প্ল্যাটফর্ম ভিউজ</span>
            <div className="w-8 h-8 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">
            {activeMetrics.views.toLocaleString()}
          </div>
          <p className="text-[11px] text-zinc-500 mt-1 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-pink-400" />
            <span>ভিডিও ভিউ ও অডিয়েন্স রিচ</span>
          </p>
        </div>

        {/* Card 3: Super Admin Net Profit (HIGHLIGHT) */}
        <div className="bg-gradient-to-br from-emerald-950/30 via-[#111114] to-zinc-900 border border-emerald-500/40 rounded-2xl p-5 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">সুপার অ্যাডমিন নেট লাভ</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-md shadow-emerald-900/30">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400">
            ${activeMetrics.superAdminNet.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-emerald-300/80 mt-1 flex items-center gap-1.5 font-bold">
            <span>আপনার ভাগে সংরক্ষিত: {activeMetrics.margin}%</span>
          </p>
        </div>

        {/* Card 4: Total Co-Founder Payout Pool */}
        <div className="bg-[#111114] border border-zinc-800/80 rounded-2xl p-5 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">অংশীদার পেআউট পুল</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">
            ${activeMetrics.totalPayouts.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-zinc-500 mt-1 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
            <span>{activeMetrics.partners.length} জন কো-ফাউন্ডারের মোট প্রাপ্যতা</span>
          </p>
        </div>

      </div>

      {/* 4. Global Haircut Concealment Control Engine */}
      <div className="bg-[#111114] border border-zinc-800/80 rounded-2xl p-6 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-pink-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <span>গ্লোবাল হেয়ারকাট ও কনসিলমেন্ট নিয়ন্ত্রণ (Concealment Engine)</span>
                <span className="px-2 py-0.5 bg-pink-500/15 border border-pink-500/30 text-pink-400 rounded-md text-[10px] font-black uppercase">
                  গোপন মোড
                </span>
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                কো-ফাউন্ডারদের চোখে মূল রেভিনিউ থেকে ৬০% কমিয়ে দেখানো হয়। এখান থেকে আপনি হেয়ারকাট অনুপাত অ্যাডজাস্ট করতে পারবেন।
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-xs text-zinc-400">দৃশ্যমান রেভিনিউ পুল</div>
              <div className="text-sm font-black text-white">
                ${activeMetrics.visiblePool.toLocaleString(undefined, { minimumFractionDigits: 2 })} ({(100 - activeMetrics.haircut)}%)
              </div>
            </div>
            <button
              onClick={handleSaveHaircut}
              disabled={savingSettings || isCustomMode}
              className="px-4 py-2 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 disabled:opacity-40 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-md shadow-pink-900/30 cursor-pointer"
            >
              {savingSettings ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : settingsSuccess ? (
                <Check className="w-3.5 h-3.5 text-emerald-300" />
              ) : (
                <Check className="w-3.5 h-3.5" />
              )}
              <span>{settingsSuccess ? 'সেভ হয়েছে!' : 'সেটিংস সেভ করুন'}</span>
            </button>
          </div>
        </div>

        {/* Slider & Explanation */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-400 font-medium">
              সুপার অ্যাডমিনের অফ-দ্য-টপ সংরক্ষিত হেয়ারকাট: <strong className="text-white text-sm">{haircutPct}%</strong>
            </span>
            <span className="text-zinc-400">
              কো-ফাউন্ডারদের চোখে দেখানো বেস: <strong className="text-pink-400 text-sm">{100 - haircutPct}%</strong>
            </span>
          </div>

          <div className="relative">
            <input
              type="range"
              min="0"
              max="90"
              step="1"
              value={haircutPct}
              onChange={(e) => setHaircutPct(Number(e.target.value))}
              disabled={isCustomMode}
              className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-pink-500"
            />
            <div className="flex justify-between text-[10px] text-zinc-500 mt-1 font-mono">
              <span>০% (কোনো কাটছাঁট নেই)</span>
              <span>৫০%</span>
              <span className="font-bold text-pink-400">৬০% (ডিফল্ট আর্কিটেকচার)</span>
              <span>৭০%</span>
              <span>৯০% (সর্বোচ্চ)</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
            <div className="p-3 bg-zinc-900/70 border border-zinc-800 rounded-xl flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-zinc-300">
                সুপার অ্যাডমিনের লুকানো সংরক্ষিত মুনাফা: <strong className="text-emerald-400">${activeMetrics.superAdminHaircutRetained.toLocaleString()}</strong> ({activeMetrics.haircut}%)
              </span>
            </div>
            <div className="p-3 bg-zinc-900/70 border border-zinc-800 rounded-xl flex items-center gap-2.5">
              <Info className="w-4 h-4 text-blue-400 shrink-0" />
              <span className="text-zinc-300">
                কো-ফাউন্ডারদের চোখে প্ল্যাটফর্ম সাইজ: <strong className="text-blue-400">${activeMetrics.visiblePool.toLocaleString()}</strong> ({100 - activeMetrics.haircut}%)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Co-Founder Equity & Cut Roster Table */}
      <div className="bg-[#111114] border border-zinc-800/80 rounded-2xl shadow-xl overflow-hidden">
        <div className="p-5 border-b border-zinc-800/80 flex items-center justify-between bg-zinc-900/40">
          <div>
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-400" />
              <span>কো-ফাউন্ডার পার্সেন্টেজ শেয়ার ও কাটছাঁট তালিকা</span>
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              প্রতিটি অংশীদারের জন্য ব্যক্তিগত শেয়ার %, এক্সট্রা কাটছাঁট এবং সুপার অ্যাডমিনের সংরক্ষিত মার্জিন
            </p>
          </div>

          <span className="px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-full text-xs font-bold text-zinc-300">
            {activeMetrics.partners.length} জন অংশীদার
          </span>
        </div>

        {loading ? (
          <div className="p-16 text-center text-zinc-500 text-xs flex flex-col items-center gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-pink-500" />
            <span>রেভিনিউ লেজার ডাটা লোড হচ্ছে...</span>
          </div>
        ) : activeMetrics.partners.length === 0 ? (
          <div className="p-16 text-center text-zinc-500 space-y-3">
            <Users className="w-10 h-10 text-zinc-700 mx-auto" />
            <p className="text-sm font-semibold text-zinc-300">কোনো কো-ফাউন্ডার যুক্ত করা নেই</p>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              টিম পেজে গিয়ে আপনার পার্টনারকে ইনভাইট করুন। যুক্ত হওয়ার সাথে সাথে এই তালিকায় চলে আসবে।
            </p>
            <Link
              href="/admin/team"
              className="inline-flex items-center gap-2 px-4 py-2 bg-pink-600 hover:bg-pink-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-pink-900/30"
            >
              <span>টিম পেজে যান</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-900/80 border-b border-zinc-800/80 text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">কো-ফাউন্ডার প্রোফাইল</th>
                  <th className="py-3.5 px-3">নির্ধারিত শেয়ার %</th>
                  <th className="py-3.5 px-3">১০০% আসল মান</th>
                  <th className="py-3.5 px-3">{100 - activeMetrics.haircut}% দৃশ্যমান বেস</th>
                  <th className="py-3.5 px-3">এক্সট্রা কাটছাঁট</th>
                  <th className="py-3.5 px-3">চূড়ান্ত নেট পেআউট</th>
                  <th className="py-3.5 px-3">অ্যাডমিনের সেভিংস</th>
                  <th className="py-3.5 px-4 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {activeMetrics.partners.map((p) => {
                  return (
                    <tr key={p.id} className="hover:bg-zinc-900/40 transition-colors">
                      
                      {/* 1. Partner Profile */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-700 flex items-center justify-center font-bold text-xs text-white shrink-0 overflow-hidden">
                            {p.avatar_url ? (
                              <img src={p.avatar_url} alt={p.username} className="w-full h-full object-cover" />
                            ) : (
                              p.email[0]?.toUpperCase() || 'U'
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-white flex items-center gap-1.5">
                              <span className="truncate max-w-[150px]" title={p.email}>{p.email}</span>
                              <span className="px-1.5 py-0.2 bg-zinc-800 text-zinc-300 rounded text-[9px] font-bold">
                                #{p.id}
                              </span>
                            </div>
                            <div className="text-[11px] text-zinc-500 flex items-center gap-1.5 mt-0.5">
                              <span>@{p.username}</span>
                              <span>•</span>
                              <span className="text-pink-400 font-medium">{p.uploaded_videos_count} ভিডিও</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* 2. Assigned Share % */}
                      <td className="py-4 px-3">
                        <span className="px-2.5 py-1 bg-purple-500/15 border border-purple-500/30 text-purple-300 font-bold rounded-lg text-xs">
                          {p.revenue_share_pct}%
                        </span>
                      </td>

                      {/* 3. Real 100% Value */}
                      <td className="py-4 px-3 font-mono text-zinc-400">
                        ${p.calculatedReal100.toFixed(2)}
                      </td>

                      {/* 4. Reported 40% Base */}
                      <td className="py-4 px-3 font-mono text-zinc-300">
                        ${p.calculatedReportedBase.toFixed(2)}
                      </td>

                      {/* 5. Extra Cut / Deductions */}
                      <td className="py-4 px-3">
                        {p.extra_cut_pct > 0 || p.fixed_deduction > 0 ? (
                          <div className="space-y-0.5">
                            {p.extra_cut_pct > 0 && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-rose-500/15 border border-rose-500/30 text-rose-400 rounded-md text-[10px] font-bold">
                                -{p.extra_cut_pct}% কাট
                              </span>
                            )}
                            {p.fixed_deduction > 0 && (
                              <div className="text-[10px] text-zinc-400 font-mono">
                                -${p.fixed_deduction} ফি
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-zinc-500 text-[11px] italic">কোনো কাট নেই</span>
                        )}
                      </td>

                      {/* 6. Final Net Payout (HIGHLIGHT GREEN) */}
                      <td className="py-4 px-3">
                        <div className="font-mono font-black text-sm text-emerald-400">
                          ${p.calculatedNetPayout.toFixed(2)}
                        </div>
                        <div className="text-[10px] text-zinc-500">
                          {activeMetrics.revenue > 0 ? ((p.calculatedNetPayout / activeMetrics.revenue) * 100).toFixed(1) : 0}% of Gross
                        </div>
                      </td>

                      {/* 7. Super Admin Kept (HIGHLIGHT BLUE/PURPLE) */}
                      <td className="py-4 px-3">
                        <div className="font-mono font-bold text-xs text-purple-300">
                          +${p.calculatedAdminRetained.toFixed(2)}
                        </div>
                        <div className="text-[10px] text-zinc-500">সাশ্রয় সংরক্ষিত</div>
                      </td>

                      {/* 8. Actions */}
                      <td className="py-4 px-4 text-right">
                        <button
                          onClick={() => openEditModal(p)}
                          className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700/80 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ml-auto cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-pink-400" />
                          <span>কাটছাঁট করুন</span>
                        </button>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 6. EDIT PARTNER SHARE & DEDUCTION MODAL */}
      {editingPartner && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#141417] border border-zinc-800 text-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/60">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-pink-500" />
                  <span>অংশীদারের পার্সেন্টেজ ও কাটছাঁট নির্ধারণ</span>
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5 font-mono">{editingPartner.email}</p>
              </div>
              <button
                onClick={() => setEditingPartner(null)}
                className="p-1.5 text-zinc-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePartner} className="p-6 space-y-5">
              
              {/* Field 1: Base Share % */}
              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                  নির্ধারিত বেস রেভিনিউ শেয়ার (%) <span className="text-pink-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    required
                    value={editSharePct}
                    onChange={(e) => setEditSharePct(Number(e.target.value))}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl py-2.5 px-3.5 text-sm text-white focus:outline-none focus:border-pink-500 transition-colors font-bold"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 font-bold">%</span>
                </div>
                <p className="text-[11px] text-zinc-500 mt-1">
                  কো-ফাউন্ডারের সাথে মূল চুক্তিকৃত শেয়ারের হার (যেমন: ১০%)।
                </p>
              </div>

              {/* Field 2: Extra Cut % */}
              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                  অতিরিক্ত কাটছাঁট / পেনাল্টি (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="50"
                    value={editExtraCutPct}
                    onChange={(e) => setEditExtraCutPct(Number(e.target.value))}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl py-2.5 px-3.5 text-sm text-white focus:outline-none focus:border-rose-500 transition-colors font-bold"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-rose-400 font-bold">% কাট</span>
                </div>
                <p className="text-[11px] text-zinc-500 mt-1">
                  আপনি চাইলে মূল শেয়ার থেকে অতিরিক্ত ২%, ৫% কমিয়ে দিতে পারবেন।
                </p>
              </div>

              {/* Field 3: Fixed Dollar Fee */}
              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                  নির্দিষ্ট ডলার কর্তন (সার্ভার/মেইনটেন্যান্স ফি)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 font-bold">$</span>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    value={editFixedDeduction}
                    onChange={(e) => setEditFixedDeduction(Number(e.target.value))}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl py-2.5 pl-8 pr-3.5 text-sm text-white focus:outline-none focus:border-pink-500 transition-colors font-bold"
                  />
                </div>
              </div>

              {/* Field 4: Admin Notes */}
              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                  সুপার অ্যাডমিন প্রাইভেট নোট (গোপন)
                </label>
                <input
                  type="text"
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="যেমন: কন্টেন্ট কম থাকায় ৫% কাটছাঁট প্রযোজ্য"
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl py-2.5 px-3.5 text-xs text-white focus:outline-none focus:border-pink-500 transition-colors placeholder-zinc-600"
                />
              </div>

              {/* Live Preview Box */}
              <div className="p-3.5 bg-zinc-900/80 border border-zinc-800 rounded-xl text-xs space-y-1.5">
                <div className="flex justify-between text-zinc-400">
                  <span>কার্যকর পেআউট শেয়ার:</span>
                  <strong className="text-white">{Math.max(0, editSharePct - editExtraCutPct).toFixed(1)}%</strong>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>দৃশ্যমান পুলে বর্তমান নেট পেআউট:</span>
                  <strong className="text-emerald-400 font-mono">
                    ${Math.max(0, (activeMetrics.visiblePool * (Math.max(0, editSharePct - editExtraCutPct) / 100)) - editFixedDeduction).toFixed(2)}
                  </strong>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setEditingPartner(null)}
                  className="flex-1 px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 rounded-xl font-semibold text-xs transition-colors"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={savingPartner}
                  className="flex-1 px-4 py-2.5 bg-pink-600 hover:bg-pink-500 text-white rounded-xl font-bold text-xs transition-all shadow-lg shadow-pink-900/30 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {savingPartner ? 'সংরক্ষণ হচ্ছে...' : 'কাটছাঁট সেভ করুন'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
