'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { 
  ShieldAlert, 
  ShieldCheck, 
  DollarSign, 
  TrendingUp, 
  Sliders, 
  Users, 
  RefreshCw, 
  Eye, 
  Percent, 
  Edit3, 
  Lock, 
  Check, 
  X, 
  ChevronRight, 
  ArrowUpRight, 
  Calculator, 
  Info,
  Building,
  CreditCard,
  Video,
  FileText,
  Printer,
  Download,
  Copy,
  CheckCircle2,
  Share2,
  PieChart,
  Server,
  HardDrive,
  Sparkles
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
  total_operational_expense?: number;
  cdn_storage_expense?: number;
  server_infra_expense?: number;
  operations_reserve_expense?: number;
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

  // Custom Interactive Simulator Mode State
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customRevenue, setCustomRevenue] = useState<number>(10000);
  const [customViews, setCustomViews] = useState<number>(250000);
  const [customHaircut, setCustomHaircut] = useState<number>(60);

  // Quick Edit Partner Modal State
  const [editingPartner, setEditingPartner] = useState<PartnerShare | null>(null);
  const [editSharePct, setEditSharePct] = useState<number>(10);
  const [editExtraCutPct, setEditExtraCutPct] = useState<number>(0);
  const [editFixedDeduction, setEditFixedDeduction] = useState<number>(0);
  const [editNotes, setEditNotes] = useState<string>('');
  const [savingPartner, setSavingPartner] = useState(false);

  // Receipt Modal State
  const [receiptPartner, setReceiptPartner] = useState<PartnerShare | null>(null);
  const [receiptViewMode, setReceiptViewMode] = useState<'partner' | 'admin'>('partner');
  const [receiptCopied, setReceiptCopied] = useState(false);
  const [showReceiptCustomizer, setShowReceiptCustomizer] = useState(false);

  // In-Receipt Customization Overrides (Allows instant editing on the receipt before export)
  const [receiptPeriod, setReceiptPeriod] = useState<string>('October 2026 Billing Cycle');
  const [receiptPaymentMethod, setReceiptPaymentMethod] = useState<string>('Bank Wire / USDT');
  const [receiptCustomGross, setReceiptCustomGross] = useState<number>(0);
  const [receiptCustomHaircut, setReceiptCustomHaircut] = useState<number>(60);
  const [receiptCustomSharePct, setReceiptCustomSharePct] = useState<number>(10);
  const [receiptCustomDeduction, setReceiptCustomDeduction] = useState<number>(0);
  const [receiptCustomMemo, setReceiptCustomMemo] = useState<string>('Verified and disbursed pursuant to platform equity agreement.');

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

  // Save global haircut setting to database
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

  function round(val: number): number {
    return Math.round(val * 100) / 100;
  }

  // Live Calculated Metrics (Dynamic between Real Mode & Custom Simulation Mode)
  const activeMetrics = useMemo(() => {
    const revenue = isCustomMode ? customRevenue : (data?.gross_revenue || 0);
    const views = isCustomMode ? customViews : (data?.total_views || 0);
    const haircut = isCustomMode ? customHaircut : haircutPct;

    const visibleMultiplier = Math.max(0, Math.min(1, (100 - haircut) / 100));
    const visiblePool = round(revenue * visibleMultiplier);
    const superAdminHaircutRetained = round(revenue * (haircut / 100));

    // Legitimate operational expense breakdown representing the 60% haircut
    const totalOperationalExpense = round(revenue * (haircut / 100));
    const cdnStorageExpense = round(revenue * ((haircut * 0.50) / 100));
    const serverInfraExpense = round(revenue * ((haircut * 0.3333) / 100));
    const operationsReserveExpense = round(Math.max(0, totalOperationalExpense - cdnStorageExpense - serverInfraExpense));

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
      totalOperationalExpense,
      cdnStorageExpense,
      serverInfraExpense,
      operationsReserveExpense,
      totalPayouts,
      superAdminNet,
      margin,
      partners,
    };
  }, [isCustomMode, customRevenue, customViews, customHaircut, haircutPct, data]);

  // Open Receipt Modal for a given partner
  const openReceiptModal = (p: PartnerShare) => {
    setReceiptPartner(p);
    setReceiptViewMode('partner');
    setShowReceiptCustomizer(false);
    setReceiptCustomGross(activeMetrics.revenue > 0 ? activeMetrics.revenue : 10000);
    setReceiptCustomHaircut(activeMetrics.haircut);
    setReceiptCustomSharePct(p.revenue_share_pct);
    setReceiptCustomDeduction(p.fixed_deduction);
    setReceiptPeriod('October 2026 Billing Cycle');
    setReceiptPaymentMethod('Bank Wire / USDT');
    setReceiptCustomMemo('Verified and disbursed pursuant to platform equity agreement.');
  };

  // Dynamic calculations for the current receipt
  const currentReceiptData = useMemo(() => {
    if (!receiptPartner) return null;

    const gross = receiptCustomGross > 0 ? receiptCustomGross : activeMetrics.revenue;
    const haircut = receiptCustomHaircut;
    const visiblePool = round(gross * Math.max(0, (100 - haircut) / 100));

    // Legitimate expense line items
    const cdnCost = round(gross * ((haircut * 0.50) / 100));
    const serverCost = round(gross * ((haircut * 0.3333) / 100));
    const reserveCost = round(Math.max(0, (gross * (haircut / 100)) - cdnCost - serverCost));
    const totalOverhead = round(cdnCost + serverCost + reserveCost);

    const sharePct = receiptCustomSharePct;
    const baseShareAmount = round(visiblePool * (sharePct / 100));
    const deduction = receiptCustomDeduction;
    const finalNet = Math.max(0, round(baseShareAmount - deduction));

    // Admin secret data
    const real100 = round(gross * (sharePct / 100));
    const adminRetained = Math.max(0, round(real100 - finalNet));
    const overallAdminNet = Math.max(0, round(gross - finalNet));
    const overallMargin = gross > 0 ? round((overallAdminNet / gross) * 100) : 100;

    return {
      partner: receiptPartner,
      receiptId: `XPG-REC-202610-${receiptPartner.id.toString().padStart(4, '0')}`,
      date: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }),
      gross,
      haircut,
      visiblePool,
      cdnCost,
      serverCost,
      reserveCost,
      totalOverhead,
      sharePct,
      baseShareAmount,
      deduction,
      finalNet,
      real100,
      adminRetained,
      overallAdminNet,
      overallMargin,
    };
  }, [
    receiptPartner, 
    receiptCustomGross, 
    receiptCustomHaircut, 
    receiptCustomSharePct, 
    receiptCustomDeduction, 
    activeMetrics
  ]);

  // Native Print Handler for crisp A4 PDF export
  const handlePrintReceipt = () => {
    window.print();
  };

  // Copy Telegram / WhatsApp Formatted Statement
  const handleCopyReceiptText = () => {
    if (!currentReceiptData) return;
    const d = currentReceiptData;

    let text = '';
    if (receiptViewMode === 'partner') {
      text = `🏛️ *XPIG MEDIA NETWORK • OFFICIAL PAYOUT STATEMENT*
📋 *Receipt ID:* \`${d.receiptId}\`
📅 *Period:* ${receiptPeriod}
👤 *Partner:* ${d.partner.username} (${d.partner.email})
🏷️ *Role:* Co-Founder & Content Partner
━━━━━━━━━━━━━━━━━━━━
📈 *Gross Inflow Attributed:* $${d.gross.toLocaleString(undefined, { minimumFractionDigits: 2 })}

⚙️ *Platform Overhead & Operating Expenses:*
• Cloud Video CDN & Storage (Cloudflare R2): -$${d.cdnCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}
• Core Server Compute & Database API: -$${d.serverCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}
• Network Maintenance & Platform Reserve: -$${d.reserveCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}
*Total Operational Overhead (${d.haircut}%):* -$${d.totalOverhead.toLocaleString(undefined, { minimumFractionDigits: 2 })}

📊 *Net Distributable Platform Profit Pool:* $${d.visiblePool.toLocaleString(undefined, { minimumFractionDigits: 2 })}
💰 *Your Contracted Equity Share (${d.sharePct}%):* +$${d.baseShareAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
${d.deduction > 0 ? `🔻 *Operational Fee / Deductions:* -$${d.deduction.toLocaleString(undefined, { minimumFractionDigits: 2 })}\n` : ''}━━━━━━━━━━━━━━━━━━━━
✅ *FINAL NET PAYABLE PAYOUT:* *$${d.finalNet.toLocaleString(undefined, { minimumFractionDigits: 2 })}*
💳 *Settlement Method:* ${receiptPaymentMethod}
📌 *Status:* Verified & Cleared
📝 *Memo:* ${receiptCustomMemo}`;
    } else {
      text = `🔒 *[CONFIDENTIAL] SUPER ADMIN REVENUE AUDIT*
📋 *Receipt ID:* \`${d.receiptId}\`
👤 *Partner:* ${d.partner.username} (${d.partner.email})
━━━━━━━━━━━━━━━━━━━━
💵 *Real Gross Platform Revenue:* $${d.gross.toLocaleString(undefined, { minimumFractionDigits: 2 })}
🛡️ *Concealment Haircut (${d.haircut}%):* $${d.totalOverhead.toLocaleString(undefined, { minimumFractionDigits: 2 })}
📦 *Visible Distributable Pool (40%):* $${d.visiblePool.toLocaleString(undefined, { minimumFractionDigits: 2 })}
🤝 *Partner Base Share (${d.sharePct}%):* $${d.baseShareAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
🔻 *Deductions Applied:* -$${d.deduction.toLocaleString(undefined, { minimumFractionDigits: 2 })}
💸 *Partner Net Payout:* $${d.finalNet.toLocaleString(undefined, { minimumFractionDigits: 2 })}
━━━━━━━━━━━━━━━━━━━━
👑 *Super Admin Retained from Partner:* +$${d.adminRetained.toLocaleString(undefined, { minimumFractionDigits: 2 })}
💎 *Super Admin Overall Net Profit:* $${d.overallAdminNet.toLocaleString(undefined, { minimumFractionDigits: 2 })} (${d.overallMargin}% Margin)`;
    }

    navigator.clipboard.writeText(text);
    setReceiptCopied(true);
    setTimeout(() => setReceiptCopied(false), 2500);
  };

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
      
      {/* 1. Top Executive Header with Dual Mode Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 pb-5 border-b border-zinc-800/80">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-purple-950/40 to-pink-950/30 border border-purple-500/30 rounded-full text-[11px] font-bold text-purple-300 mb-2.5 shadow-sm">
            <Lock className="w-3.5 h-3.5 text-purple-400" />
            <span>সুপার অ্যাডমিন এক্সক্লুসিভ • গোপন লভ্যাংশ ও পেআউট লেজার</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <DollarSign className="w-7 h-7 sm:w-8 sm:h-8 text-emerald-400" />
            <span>কো-ফাউন্ডার রেভিনিউ শেয়ার ও পেআউট রিসিপ্ট সিস্টেম</span>
          </h1>
          <p className="text-zinc-400 text-xs sm:text-sm mt-1 max-w-3xl">
            লাইভ স্পন্সর আয়, ৬০% প্ল্যাটফর্ম হোস্টিং ও অপারেশন ব্যয় সমন্বয় এবং পার্টনারদের জন্য কাস্টমাইজেবল অফিশিয়াল পেআউট রিসিপ্ট জেনারেটর।
          </p>
        </div>

        {/* Action Controls: Auto vs Custom Mode Switcher */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="p-1 bg-zinc-900/90 border border-zinc-800 rounded-xl flex items-center gap-1 shadow-inner">
            <button
              onClick={() => setIsCustomMode(false)}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                !isCustomMode
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>⚡ অটো (লাইভ ডাটা)</span>
            </button>
            <button
              onClick={() => setIsCustomMode(true)}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                isCustomMode
                  ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-black shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>🎛️ কাস্টম সিমুলেটর</span>
            </button>
          </div>

          <button
            onClick={fetchData}
            disabled={loading}
            className="p-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center cursor-pointer"
            title="Refresh Ledger"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-pink-500' : ''}`} />
          </button>
        </div>
      </div>

      {/* 2. Custom Simulator Playground Bar (Active only in Custom Mode) */}
      {isCustomMode && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-zinc-900/90 to-orange-950/30 border border-amber-500/40 text-amber-200 shadow-xl space-y-4 animate-in fade-in slide-in-from-top-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                <Calculator className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-sm text-white flex items-center gap-2">
                  <span>কাস্টম ক্যালকুলেটর ও সিমুলেটর প্লেগ্রাউন্ড</span>
                  <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 text-[10px] rounded-md font-bold uppercase">সক্রিয়</span>
                </h3>
                <p className="text-xs text-amber-300/80 mt-0.5">
                  নিচের সংখ্যাগুলো পরিবর্তন করে যেকোনো কাল্পনিক আয়, ভিউ ও খরচের লাইভ প্রভাব পরীক্ষা করুন।
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsCustomMode(false)}
              className="text-xs px-3 py-1.5 bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-300 hover:text-white transition-colors cursor-pointer self-start sm:self-auto"
            >
              লাইভ ডাটায় ফিরুন
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div>
              <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">
                কাল্পনিক মোট আয় ($)
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
                কাল্পনিক প্ল্যাটফর্ম ভিউজ
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
                অপারেশন ব্যয় / হেয়ারকাট অনুপাত (%)
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

      {/* 3. 4 Executive Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Gross Platform Revenue */}
        <div className="bg-[#111114] border border-zinc-800/80 rounded-2xl p-5 shadow-xl relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">মোট প্ল্যাটফর্ম আয় (Gross)</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Building className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono">
            ${activeMetrics.revenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-zinc-500 mt-1 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
            <span>স্পন্সর ও বিজ্ঞাপনের মোট ইনকাম</span>
          </p>
        </div>

        {/* Card 2: Operational Overhead (The 60% Legitimate Expense) */}
        <div className="bg-[#111114] border border-zinc-800/80 rounded-2xl p-5 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">হোস্টিং ও অপারেশন ব্যয়</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Server className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">
            ${activeMetrics.totalOperationalExpense.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-zinc-400 mt-1 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span>ভিডিও CDN, সার্ভার ও রিজার্ভ</span>
            </span>
            <span className="font-bold text-amber-400">{activeMetrics.haircut}% ব্যয়</span>
          </p>
        </div>

        {/* Card 3: Net Distributable Pool (The 40% Visible Pool) */}
        <div className="bg-[#111114] border border-zinc-800/80 rounded-2xl p-5 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">বণ্টনযোগ্য প্রফিট পুল</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <PieChart className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono">
            ${activeMetrics.visiblePool.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-zinc-400 mt-1 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
              <span>অংশীদারদের মধ্যে বণ্টনযোগ্য</span>
            </span>
            <span className="font-bold text-purple-400">{100 - activeMetrics.haircut}% পুল</span>
          </p>
        </div>

        {/* Card 4: Super Admin Retained Profit (HIGHLIGHT GREEN) */}
        <div className="bg-gradient-to-br from-emerald-950/30 via-[#111114] to-zinc-900 border border-emerald-500/40 rounded-2xl p-5 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">সুপার অ্যাডমিন নিট লাভ</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-md shadow-emerald-900/30">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
            ${activeMetrics.superAdminNet.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-emerald-300/80 mt-1 flex items-center justify-between font-bold">
            <span>আপনার সুরক্ষিত মার্জিন:</span>
            <span className="px-2 py-0.5 bg-emerald-500/20 border border-emerald-500/30 rounded text-emerald-300">
              {activeMetrics.margin}%
            </span>
          </p>
        </div>

      </div>

      {/* 4. Platform Overhead Breakdown & Concealment Engine */}
      <div className="bg-[#111114] border border-zinc-800/80 rounded-2xl p-6 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-pink-400 shrink-0">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <span>প্ল্যাটফর্ম ইনফ্রাস্ট্রাকচার ব্যয় ও কনসিলমেন্ট নিয়ন্ত্রণ</span>
                <span className="px-2 py-0.5 bg-pink-500/15 border border-pink-500/30 text-pink-400 rounded-md text-[10px] font-black uppercase">
                  গোপন মোড
                </span>
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                রিসিপ্টে এই ৬০% ব্যয় ক্লাউড স্টোরেজ, ব্যান্ডউইথ ও সার্ভার অপারেটিং খরচ হিসেবে বিশ্বাসযোগ্যভাবে উপস্থাপন করা হয়।
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            <div className="text-right hidden sm:block">
              <div className="text-xs text-zinc-400">দৃশ্যমান পুল সাইজ</div>
              <div className="text-sm font-black text-white font-mono">
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

        {/* Overhead Slider */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-400 font-medium">
              সুপার অ্যাডমিনের অফ-দ্য-টপ সংরক্ষিত অনুপাত: <strong className="text-white text-sm">{haircutPct}%</strong>
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
              <span>৪০%</span>
              <span className="font-bold text-pink-400">৬০% (ডিফল্ট আর্কিটেকচার)</span>
              <span>৭০%</span>
              <span>৯০% (সর্বোচ্চ)</span>
            </div>
          </div>

          {/* Legitimate Itemized Expense Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
            <div className="p-3 bg-zinc-900/70 border border-zinc-800 rounded-xl space-y-1">
              <div className="flex items-center justify-between text-zinc-400">
                <span className="flex items-center gap-1.5 font-medium">
                  <HardDrive className="w-3.5 h-3.5 text-blue-400" />
                  <span>ক্লাউড ভিডিও স্টোরেজ ও CDN</span>
                </span>
                <span className="font-bold text-blue-400">{(activeMetrics.haircut * 0.50).toFixed(0)}%</span>
              </div>
              <div className="text-sm font-bold text-white font-mono">
                ${activeMetrics.cdnStorageExpense.toLocaleString()}
              </div>
            </div>

            <div className="p-3 bg-zinc-900/70 border border-zinc-800 rounded-xl space-y-1">
              <div className="flex items-center justify-between text-zinc-400">
                <span className="flex items-center gap-1.5 font-medium">
                  <Server className="w-3.5 h-3.5 text-purple-400" />
                  <span>সার্ভার ইনফ্রাস্ট্রাকচার ও API</span>
                </span>
                <span className="font-bold text-purple-400">{(activeMetrics.haircut * 0.3333).toFixed(0)}%</span>
              </div>
              <div className="text-sm font-bold text-white font-mono">
                ${activeMetrics.serverInfraExpense.toLocaleString()}
              </div>
            </div>

            <div className="p-3 bg-zinc-900/70 border border-zinc-800 rounded-xl space-y-1">
              <div className="flex items-center justify-between text-zinc-400">
                <span className="flex items-center gap-1.5 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>অপারেশন ও প্ল্যাটফর্ম রিজার্ভ</span>
                </span>
                <span className="font-bold text-emerald-400">
                  {Math.max(0, activeMetrics.haircut - Math.round(activeMetrics.haircut * 0.50) - Math.round(activeMetrics.haircut * 0.3333))}%
                </span>
              </div>
              <div className="text-sm font-bold text-white font-mono">
                ${activeMetrics.operationsReserveExpense.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Co-Founder Equity & Cut Roster Table */}
      <div className="bg-[#111114] border border-zinc-800/80 rounded-2xl shadow-xl overflow-hidden">
        <div className="p-5 border-b border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-900/40">
          <div>
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-400" />
              <span>কো-ফাউন্ডার শেয়ার ও পেআউট রোস্টার</span>
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              প্রতিটি অংশীদারের জন্য চুক্তিভিত্তিক শেয়ার %, কাটছাঁট এবং অফিশিয়াল রিসিপ্ট তৈরির সুবিধা।
            </p>
          </div>

          <span className="px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-full text-xs font-bold text-zinc-300 self-start sm:self-auto">
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
                  <th className="py-3.5 px-3">চুক্তির শেয়ার %</th>
                  <th className="py-3.5 px-3">বণ্টনযোগ্য বরাদ্দ ($)</th>
                  <th className="py-3.5 px-3">কাটছাঁট / পেনাল্টি</th>
                  <th className="py-3.5 px-3">চূড়ান্ত নিট পেআউট</th>
                  <th className="py-3.5 px-3">অ্যাডমিন মার্জিন</th>
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

                      {/* 3. Distributable Allocation */}
                      <td className="py-4 px-3 font-mono text-zinc-300">
                        ${p.calculatedReportedBase.toFixed(2)}
                      </td>

                      {/* 4. Extra Cut / Deductions */}
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

                      {/* 5. Final Net Payout (HIGHLIGHT GREEN) */}
                      <td className="py-4 px-3">
                        <div className="font-mono font-black text-sm text-emerald-400">
                          ${p.calculatedNetPayout.toFixed(2)}
                        </div>
                        <div className="text-[10px] text-zinc-500">
                          {activeMetrics.revenue > 0 ? ((p.calculatedNetPayout / activeMetrics.revenue) * 100).toFixed(1) : 0}% of Gross
                        </div>
                      </td>

                      {/* 6. Super Admin Kept */}
                      <td className="py-4 px-3">
                        <div className="font-mono font-bold text-xs text-purple-300">
                          +${p.calculatedAdminRetained.toFixed(2)}
                        </div>
                        <div className="text-[10px] text-zinc-500">সেভিংস মার্জিন</div>
                      </td>

                      {/* 7. Actions: Receipt Button & Edit Button */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openReceiptModal(p)}
                            className="px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm shadow-emerald-950/40 cursor-pointer"
                            title="Generate and Download Statement Receipt"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>রিসিপ্ট ডাউনলোড</span>
                          </button>

                          <button
                            onClick={() => openEditModal(p)}
                            className="px-2.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700/80 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer"
                            title="Adjust Partner Percentages"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-pink-400" />
                            <span className="hidden sm:inline">কাটছাঁট</span>
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 6. EXECUTIVE PRINTABLE & DOWNLOADABLE RECEIPT MODAL */}
      {receiptPartner && currentReceiptData && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-[#121215] border border-zinc-800 text-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Top Bar */}
            <div className="p-4 sm:p-5 border-b border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-900/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <span>অফিশিয়াল পেআউট স্টেটমেন্ট ও ইনভয়েস</span>
                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] rounded-md font-bold uppercase">
                      ভেরিফাইড
                    </span>
                  </h3>
                  <p className="text-xs text-zinc-400 font-mono">
                    রিসিপ্ট নং: {currentReceiptData.receiptId} • {currentReceiptData.partner.email}
                  </p>
                </div>
              </div>

              {/* View Switcher: Official Partner vs Super Admin Audit */}
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <div className="p-1 bg-zinc-950 border border-zinc-800 rounded-xl flex items-center gap-1 text-[11px] font-bold">
                  <button
                    onClick={() => setReceiptViewMode('partner')}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      receiptViewMode === 'partner'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    পার্টনার রিসিপ্ট (অফিশিয়াল)
                  </button>
                  <button
                    onClick={() => setReceiptViewMode('admin')}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      receiptViewMode === 'admin'
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    সুপার অ্যাডমিন অডিট
                  </button>
                </div>

                <button
                  onClick={() => setReceiptPartner(null)}
                  className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* In-Receipt Quick Customization Toolbar Toggle */}
            <div className="px-5 py-2.5 bg-zinc-900/50 border-b border-zinc-800/80 flex items-center justify-between text-xs">
              <span className="text-zinc-400 flex items-center gap-2">
                <Sliders className="w-3.5 h-3.5 text-pink-400" />
                <span>রিসিপ্ট প্রিন্ট বা পাঠানোর আগে ডাটা কাস্টমাইজ করতে চান?</span>
              </span>
              <button
                onClick={() => setShowReceiptCustomizer(!showReceiptCustomizer)}
                className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white rounded-lg font-bold transition-colors cursor-pointer"
              >
                {showReceiptCustomizer ? 'কাস্টমাইজার লুকান' : 'কাস্টমাইজ করুন'}
              </button>
            </div>

            {/* Customizer Drawer */}
            {showReceiptCustomizer && (
              <div className="p-5 bg-zinc-950/80 border-b border-zinc-800 space-y-4 animate-in fade-in text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-zinc-400 block mb-1 font-bold">স্টেটমেন্ট পিরিয়ড / মাস</label>
                    <input
                      type="text"
                      value={receiptPeriod}
                      onChange={(e) => setReceiptPeriod(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-white font-medium"
                    />
                  </div>
                  <div>
                    <label className="text-zinc-400 block mb-1 font-bold">মোট গ্রস রেভিনিউ ($)</label>
                    <input
                      type="number"
                      value={receiptCustomGross}
                      onChange={(e) => setReceiptCustomGross(Math.max(0, Number(e.target.value)))}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-white font-bold font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-zinc-400 block mb-1 font-bold">হোস্টিং ও অপারেশন ব্যয় (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="90"
                      value={receiptCustomHaircut}
                      onChange={(e) => setReceiptCustomHaircut(Math.max(0, Math.min(90, Number(e.target.value))))}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-white font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-zinc-400 block mb-1 font-bold">কো-ফাউন্ডার শেয়ার (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={receiptCustomSharePct}
                      onChange={(e) => setReceiptCustomSharePct(Number(e.target.value))}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-zinc-400 block mb-1 font-bold">ফিক্সড কর্তন / অপারেশন ফি ($)</label>
                    <input
                      type="number"
                      min="0"
                      value={receiptCustomDeduction}
                      onChange={(e) => setReceiptCustomDeduction(Number(e.target.value))}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-zinc-400 block mb-1 font-bold">পেমেন্ট মেথড</label>
                    <input
                      type="text"
                      value={receiptPaymentMethod}
                      onChange={(e) => setReceiptPaymentMethod(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-white font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-zinc-400 block mb-1 font-bold">অফিশিয়াল ফুটনোট / মেমো</label>
                  <input
                    type="text"
                    value={receiptCustomMemo}
                    onChange={(e) => setReceiptCustomMemo(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-white text-xs"
                  />
                </div>
              </div>
            )}

            {/* THE FORMAL CORPORATE PRINTABLE INVOICE DOCKET */}
            <div className="p-6 sm:p-8 max-h-[62vh] overflow-y-auto space-y-6" id="xpig-printable-receipt">
              
              {/* Receipt Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b-2 border-zinc-800 pb-6">
                <div>
                  <div className="text-xl sm:text-2xl font-black text-white tracking-wider flex items-center gap-2">
                    <span className="text-pink-500">XPIG</span>
                    <span>MEDIA NETWORK INC.</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-1 uppercase tracking-wider">
                    Digital Content & Platform Operations Entity
                  </p>
                  <p className="text-[10px] text-zinc-500 mt-0.5">
                    Corporate Financial Settlement & Revenue Distribution Docket
                  </p>
                </div>

                <div className="text-left sm:text-right space-y-1">
                  <div className="inline-block px-3 py-1 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-black rounded-lg uppercase tracking-wide">
                    ✓ Verified & Cleared
                  </div>
                  <div className="text-xs text-zinc-400 font-mono">
                    রিসিপ্ট নং: <strong className="text-white">{currentReceiptData.receiptId}</strong>
                  </div>
                  <div className="text-xs text-zinc-400">
                    ইস্যু তারিখ: <strong className="text-zinc-200">{currentReceiptData.date}</strong>
                  </div>
                  <div className="text-xs text-zinc-400">
                    পিরিয়ড: <strong className="text-pink-400">{receiptPeriod}</strong>
                  </div>
                </div>
              </div>

              {/* Billed To & Recipient Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 text-xs">
                <div>
                  <div className="text-[10px] uppercase font-bold text-zinc-500 mb-1 tracking-wider">প্রাপক / কো-ফাউন্ডার প্রোফাইল</div>
                  <div className="font-bold text-sm text-white">{currentReceiptData.partner.username}</div>
                  <div className="text-zinc-400 font-mono mt-0.5">{currentReceiptData.partner.email}</div>
                  <div className="text-zinc-500 text-[11px] mt-1">
                    আইডি: #{currentReceiptData.partner.id} • ভূমিকা: <span className="text-purple-300 font-medium">Co-Founder & Equity Partner</span>
                  </div>
                </div>

                <div className="sm:text-right">
                  <div className="text-[10px] uppercase font-bold text-zinc-500 mb-1 tracking-wider">প্ল্যাটফর্ম কন্টেন্ট ও রিচ পারফরম্যান্স</div>
                  <div className="text-zinc-300">
                    আপলোডকৃত ভিডিও: <strong className="text-white">{currentReceiptData.partner.uploaded_videos_count} টি</strong>
                  </div>
                  <div className="text-zinc-300 mt-0.5">
                    মোট প্ল্যাটফর্ম ভিউজ: <strong className="text-white">{activeMetrics.views.toLocaleString()}</strong>
                  </div>
                  <div className="text-zinc-300 mt-0.5">
                    সেটেলমেন্ট মেথড: <strong className="text-emerald-400">{receiptPaymentMethod}</strong>
                  </div>
                </div>
              </div>

              {/* ITEMIZATION TABLE */}
              <div className="border border-zinc-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-900 border-b border-zinc-800 text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3 px-4">হিসাবের বিবরণ ও অপারেশনাল আইটেম</th>
                      <th className="py-3 px-3 text-center">হার (%)</th>
                      <th className="py-3 px-4 text-right">পরিমাণ ($)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/80">
                    
                    {/* Item 1: Gross Platform Revenue */}
                    <tr className="bg-zinc-900/20">
                      <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2">
                        <Building className="w-4 h-4 text-blue-400 shrink-0" />
                        <div>
                          <div>প্ল্যাটফর্ম মোট স্পন্সর ও অ্যাড ইনকাম (Gross Inflow)</div>
                          <div className="text-[10px] text-zinc-500 font-normal">প্ল্যাটফর্মে সংগৃহীত মোট স্পন্সরশিপ রাজস্ব</div>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-center font-bold text-zinc-400">১০০%</td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-white">
                        +${currentReceiptData.gross.toFixed(2)}
                      </td>
                    </tr>

                    {/* Operational Overhead (Explaining the 60% Haircut) */}
                    <tr className="text-zinc-300 bg-amber-950/10">
                      <td className="py-3 px-4 pl-8">
                        <div className="font-semibold text-amber-200">
                          মাইনাস: ক্লাউড ভিডিও স্টোরেজ ও CDN ব্যান্ডউইথ (Cloudflare R2)
                        </div>
                        <div className="text-[10px] text-zinc-500">হাই-পারফরম্যান্স গ্লোবাল ভিডিও ডেলিভারি ও স্টোরেজ নোড</div>
                      </td>
                      <td className="py-3 px-3 text-center font-mono text-zinc-400">
                        {(currentReceiptData.haircut * 0.50).toFixed(0)}%
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-amber-300">
                        -${currentReceiptData.cdnCost.toFixed(2)}
                      </td>
                    </tr>

                    <tr className="text-zinc-300 bg-amber-950/10">
                      <td className="py-3 px-4 pl-8">
                        <div className="font-semibold text-amber-200">
                          মাইনাস: কোর সার্ভার ইনফ্রাস্ট্রাকচার ও ডাটাবেজ কম্পিউট
                        </div>
                        <div className="text-[10px] text-zinc-500">সার্ভার প্রসেসিং, ব্যাকএন্ড আর্কিটেকচার ও API ব্যান্ডউইথ</div>
                      </td>
                      <td className="py-3 px-3 text-center font-mono text-zinc-400">
                        {(currentReceiptData.haircut * 0.3333).toFixed(0)}%
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-amber-300">
                        -${currentReceiptData.serverCost.toFixed(2)}
                      </td>
                    </tr>

                    <tr className="text-zinc-300 bg-amber-950/10 border-b border-zinc-800">
                      <td className="py-3 px-4 pl-8">
                        <div className="font-semibold text-amber-200">
                          মাইনাস: প্ল্যাটফর্ম পরিচালন ও রিজার্ভ ফান্ড
                        </div>
                        <div className="text-[10px] text-zinc-500">পেমেন্ট গেটওয়ে প্রসেসিং, সিকিউরিটি ও মেইনটেন্যান্স রিজার্ভ</div>
                      </td>
                      <td className="py-3 px-3 text-center font-mono text-zinc-400">
                        {Math.max(0, currentReceiptData.haircut - Math.round(currentReceiptData.haircut * 0.50) - Math.round(currentReceiptData.haircut * 0.3333))}%
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-amber-300">
                        -${currentReceiptData.reserveCost.toFixed(2)}
                      </td>
                    </tr>

                    {/* Net Distributable Profit Pool */}
                    <tr className="bg-purple-950/20 font-bold border-b border-zinc-800">
                      <td className="py-3.5 px-4 text-purple-200 flex items-center gap-2">
                        <PieChart className="w-4 h-4 text-purple-400 shrink-0" />
                        <div>
                          <div>নিট বণ্টনযোগ্য প্ল্যাটফর্ম প্রফিট পুল (Net Distributable Pool)</div>
                          <div className="text-[10px] text-zinc-400 font-normal">অপারেশনাল খরচ বাদে অবশিষ্ট প্রফিট পুল</div>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-center font-mono text-purple-300">
                        {100 - currentReceiptData.haircut}%
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-purple-200">
                        =${currentReceiptData.visiblePool.toFixed(2)}
                      </td>
                    </tr>

                    {/* Partner Equity Share Calculation */}
                    <tr className="bg-zinc-900/40">
                      <td className="py-3.5 px-4 text-white">
                        <div className="font-bold flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>আপনার চুক্তিভিত্তিক ইক্যুইটি শেয়ার বরাদ্দ</span>
                        </div>
                        <div className="text-[10px] text-zinc-400 mt-0.5">
                          বণ্টনযোগ্য পুলের {currentReceiptData.sharePct}% সরাসরি আপনার প্রাপ্য
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-center font-mono font-bold text-emerald-400">
                        {currentReceiptData.sharePct}%
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-400">
                        +${currentReceiptData.baseShareAmount.toFixed(2)}
                      </td>
                    </tr>

                    {/* Deductions if any */}
                    {currentReceiptData.deduction > 0 && (
                      <tr className="bg-rose-950/15">
                        <td className="py-3 px-4 text-rose-300 pl-8">
                          <div>মাইনাস: অপারেশনাল ডিডাকশন / অতিরিক্ত সমন্বয় ফি</div>
                          <div className="text-[10px] text-zinc-500">চুক্তিভিত্তিক সমন্বয় ও চার্জেস</div>
                        </td>
                        <td className="py-3 px-3 text-center text-zinc-500">—</td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-rose-400">
                          -${currentReceiptData.deduction.toFixed(2)}
                        </td>
                      </tr>
                    )}

                  </tbody>
                </table>
              </div>

              {/* FINAL NET PAYABLE PAYOUT BOX (HIGHLIGHT HERO) */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-zinc-900 to-teal-950/40 border-2 border-emerald-500/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
                <div>
                  <div className="text-xs uppercase font-bold text-emerald-400 tracking-wider flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    <span>চূড়ান্ত প্রদেয় নিট পেআউট (Final Net Payable Disbursement)</span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    সমস্ত ব্যয় ও শেয়ার সমন্বয় শেষে আপনার ওয়ালেট/অ্যাকাউন্টে প্রদেয় মোট অংক।
                  </p>
                </div>

                <div className="text-left sm:text-right">
                  <div className="text-3xl sm:text-4xl font-black text-emerald-400 font-mono tracking-tight">
                    ${currentReceiptData.finalNet.toFixed(2)}
                  </div>
                  <div className="text-[11px] text-zinc-400 mt-0.5">
                    Currency: <strong className="text-white">USD ($)</strong> • Status: <strong className="text-emerald-400">Approved</strong>
                  </div>
                </div>
              </div>

              {/* SUPER ADMIN CONFIDENTIAL AUDIT ACCORDION (Visible ONLY in Admin View Mode) */}
              {receiptViewMode === 'admin' && (
                <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/40 space-y-3 animate-in fade-in">
                  <div className="flex items-center gap-2 text-xs font-bold text-purple-300 uppercase tracking-wider">
                    <Lock className="w-3.5 h-3.5 text-purple-400" />
                    <span>গোপন সুপার অ্যাডমিন অভ্যন্তরীণ অডিট (Confidential Margin Audit)</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-2.5 bg-zinc-900 rounded-lg">
                      <div className="text-zinc-500 text-[10px]">১০০% আনকাট শেয়ার মান</div>
                      <div className="font-bold text-white font-mono">${currentReceiptData.real100.toFixed(2)}</div>
                    </div>
                    <div className="p-2.5 bg-zinc-900 rounded-lg">
                      <div className="text-zinc-500 text-[10px]">এই পার্টনার থেকে সেভিংস</div>
                      <div className="font-bold text-emerald-400 font-mono">+${currentReceiptData.adminRetained.toFixed(2)}</div>
                    </div>
                    <div className="p-2.5 bg-zinc-900 rounded-lg">
                      <div className="text-zinc-500 text-[10px]">অ্যাডমিনের সামগ্রিক নিট লাভ</div>
                      <div className="font-bold text-purple-300 font-mono">${currentReceiptData.overallAdminNet.toFixed(2)}</div>
                    </div>
                    <div className="p-2.5 bg-zinc-900 rounded-lg">
                      <div className="text-zinc-500 text-[10px]">প্ল্যাটফর্ম সামগ্রিক মার্জিন</div>
                      <div className="font-bold text-emerald-400 font-mono">{currentReceiptData.overallMargin}%</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Official Footer, Signatures & Digital Seal */}
              <div className="pt-4 border-t border-zinc-800/80 text-xs text-zinc-500 space-y-4">
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  <div className="space-y-1">
                    <div className="text-zinc-400 font-bold">অফিশিয়াল স্টেটমেন্ট নোট:</div>
                    <p className="text-[11px] text-zinc-400 italic max-w-md">
                      "{receiptCustomMemo}"
                    </p>
                  </div>
                  <div className="sm:text-right space-y-1 font-mono text-[10px]">
                    <div>Digital Verification Hash:</div>
                    <div className="text-zinc-400">XPG-{currentReceiptData.partner.id}-SHA256-V893K</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8 pt-4">
                  <div className="border-t border-zinc-700/60 pt-2 text-center sm:text-left">
                    <div className="font-bold text-zinc-300">কর্তৃপক্ষের স্বাক্ষর ও সিল</div>
                    <div className="text-[10px] text-zinc-500">XPIG Financial Controller</div>
                  </div>
                  <div className="border-t border-zinc-700/60 pt-2 text-center sm:text-right">
                    <div className="font-bold text-zinc-300">অংশীদারের সম্মতি</div>
                    <div className="text-[10px] text-zinc-500">Digital Acceptance ID</div>
                  </div>
                </div>
              </div>

            </div>

            {/* Modal Bottom Actions Bar */}
            <div className="p-4 sm:p-5 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-3 bg-zinc-900/90">
              <div className="text-xs text-zinc-400">
                {receiptViewMode === 'partner' ? (
                  <span className="text-emerald-400 font-medium">✓ পার্টনারকে পাঠানোর জন্য রেডি</span>
                ) : (
                  <span className="text-purple-400 font-medium">🔒 শুধুমাত্র অ্যাডমিন অডিট মোড</span>
                )}
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleCopyReceiptText}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                  title="Copy Telegram/WhatsApp text summary"
                >
                  {receiptCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">কপি হয়েছে!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-zinc-400" />
                      <span>মেসেজ কপি করুন</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handlePrintReceipt}
                  className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-black transition-all flex items-center gap-2 shadow-lg shadow-emerald-950/40 cursor-pointer"
                  title="Print or Save as crisp PDF"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>প্রিন্ট / PDF ডাউনলোড</span>
                </button>

                <button
                  type="button"
                  onClick={() => setReceiptPartner(null)}
                  className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  বন্ধ করুন
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 7. QUICK EDIT PARTNER SHARE & DEDUCTION MODAL */}
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
                className="p-1.5 text-zinc-400 hover:text-white rounded-lg cursor-pointer"
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
                  className="flex-1 px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 rounded-xl font-semibold text-xs transition-colors cursor-pointer"
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

      {/* Global CSS for Clean A4 Printing */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #xpig-printable-receipt, #xpig-printable-receipt * {
            visibility: visible;
          }
          #xpig-printable-receipt {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            max-width: 100% !important;
            max-height: none !important;
            overflow: visible !important;
            padding: 20mm !important;
            background: #ffffff !important;
            color: #000000 !important;
          }
          #xpig-printable-receipt .text-white {
            color: #000000 !important;
          }
          #xpig-printable-receipt .text-zinc-300,
          #xpig-printable-receipt .text-zinc-400,
          #xpig-printable-receipt .text-zinc-500 {
            color: #4b5563 !important;
          }
          #xpig-printable-receipt .bg-zinc-900,
          #xpig-printable-receipt .bg-zinc-900\/60,
          #xpig-printable-receipt .bg-zinc-900\/40,
          #xpig-printable-receipt .bg-zinc-900\/20,
          #xpig-printable-receipt .bg-amber-950\/10,
          #xpig-printable-receipt .bg-purple-950\/20,
          #xpig-printable-receipt .bg-emerald-950\/40 {
            background: #f8fafc !important;
            border-color: #cbd5e1 !important;
          }
          #xpig-printable-receipt .border-zinc-800,
          #xpig-printable-receipt .border-zinc-800\/80,
          #xpig-printable-receipt .border-zinc-700\/60 {
            border-color: #cbd5e1 !important;
          }
          #xpig-printable-receipt .text-emerald-400 {
            color: #047857 !important;
          }
          #xpig-printable-receipt .text-amber-400,
          #xpig-printable-receipt .text-amber-300,
          #xpig-printable-receipt .text-amber-200 {
            color: #b45309 !important;
          }
          #xpig-printable-receipt .text-purple-400,
          #xpig-printable-receipt .text-purple-300,
          #xpig-printable-receipt .text-purple-200 {
            color: #6b21a8 !important;
          }
          #xpig-printable-receipt .text-pink-500 {
            color: #db2777 !important;
          }
        }
      `}</style>

    </div>
  );
}
