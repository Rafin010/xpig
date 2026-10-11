'use client';

import { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Mail, 
  Plus, 
  UserPlus, 
  MapPin, 
  Clock, 
  Trash2, 
  ExternalLink, 
  Sparkles, 
  RefreshCw,
  Scale
} from 'lucide-react';

export default function TeamManagementPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [cofounders, setCofounders] = useState<any[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(true);

  const fetchCofounders = async () => {
    setIsLoadingList(true);
    try {
      const res = await fetch('https://xpig.onrender.com/api/v1/admin/cofounders');
      if (res.ok) {
        setCofounders(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingList(false);
    }
  };

  useEffect(() => {
    fetchCofounders();
    // Refresh telemetry every 30 seconds
    const interval = setInterval(fetchCofounders, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await fetch('https://xpig.onrender.com/api/v1/admin/cofounders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: 'success', text: `সফল: ${email} অ্যাকাউন্টকে কো-ফাউন্ডার হিসেবে যুক্ত করা হয়েছে!` });
        setEmail('');
        fetchCofounders();
      } else {
        setMessage({ type: 'error', text: data.detail || 'কো-ফাউন্ডার যুক্ত করতে সমস্যা হয়েছে।' });
      }
    } catch {
      setMessage({ type: 'error', text: 'সার্ভার যোগাযোগে সমস্যা হয়েছে।' });
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async (id: number, cfEmail: string) => {
    if (!confirm(`আপনি কি নিশ্চিত যে ${cfEmail} অ্যাকাউন্টের কো-ফাউন্ডার অধিকার বাতিল করতে চান?`)) return;

    try {
      const res = await fetch(`https://xpig.onrender.com/api/v1/admin/cofounders/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setCofounders((prev) => prev.filter((c) => c.id !== id));
      } else {
        alert('কো-ফাউন্ডার অ্যাক্সেস বাতিল ব্যর্থ হয়েছে।');
      }
    } catch {
      alert('সার্ভার এরর');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800/80">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-zinc-800/80 border border-zinc-700/60 rounded-full text-xs font-semibold text-zinc-300 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Co-Founder Management & GPS Auditing</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-emerald-400" />
            Team & Co-Founder Roles
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            মাস্টার প্যানেল থেকে অনুমোদিত কো-ফাউন্ডার যুক্ত করুন, লাইভ ম্যাপ লোকেশন ট্র্যাক করুন এবং সেশন সক্রিয়তা নিরীক্ষা করুন।
          </p>
        </div>

        <button
          onClick={fetchCofounders}
          disabled={isLoadingList}
          className="self-start sm:self-auto px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoadingList ? 'animate-spin' : ''}`} />
          <span>Refresh Telemetry</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Col: Invite Form */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#111] border border-zinc-800/80 p-6 rounded-2xl shadow-xl space-y-5">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-zinc-800/80 pb-3">
              <UserPlus className="w-5 h-5 text-blue-400" />
              <span>Invite New Co-Founder</span>
            </h3>

            <p className="text-xs text-zinc-400 leading-relaxed">
              শুধুমাত্র এখানে যোগ করা অনুমোদিত গুগল জিমেইল দিয়ে কো-ফাউন্ডার লগইন করতে পারবে। প্রবেশের সময় তার জিপিএস লোকেশন নেওয়া হবে এবং সে শুধুমাত্র সীমিত (Limited) অ্যাক্সেস পাবে।
            </p>

            <form onSubmit={handleInvite} className="space-y-4">
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-zinc-300">
                  Authorized Google Gmail <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="partner@gmail.com"
                    className="w-full bg-[#18181b] border border-zinc-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !email}
                className="w-full bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all border border-zinc-700 shadow-lg text-sm"
              >
                {loading ? 'Authorizing...' : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Authorize Co-Founder Access</span>
                  </>
                )}
              </button>

              {message.text && (
                <div className={`p-3.5 rounded-xl text-xs font-semibold border ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                  {message.text}
                </div>
              )}
            </form>
          </div>

          {/* Security policy card */}
          <div className="bg-[#111] border border-zinc-800/80 p-5 rounded-2xl space-y-2 text-xs text-zinc-400">
            <div className="flex items-center gap-2 text-zinc-200 font-bold">
              <Scale className="w-4 h-4 text-amber-400" />
              <span>Strict RBAC Security Rules:</span>
            </div>
            <ul className="list-disc pl-4 space-y-1 text-[11px] text-zinc-400">
              <li>কো-ফাউন্ডার ক্লাউডফ্লেয়ার R2 স্টোরেজ নোড ও ক্রেডেনশিয়ালস দেখতে পারবে না।</li>
              <li>অন্য কোনো টিম মেম্বার যোগ বা অপসারণ করার অধিকার থাকবে না।</li>
              <li>সিস্টেম সেটিংস ও ডাটাবেজ ডিলিট অ্যাকশন নিষিদ্ধ।</li>
              <li>প্রতিটি লগইনে গুগল ম্যাপ জিপিএস স্থানাঙ্ক সংরক্ষিত হবে।</li>
            </ul>
          </div>
        </div>

        {/* Right Col: Active Co-Founders Table & Telemetry */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-[#111] border border-zinc-800/80 rounded-2xl shadow-xl overflow-hidden flex flex-col">
            <div className="p-5 border-b border-zinc-800/80 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Active Co-Founders & Location Audit</h3>
                <p className="text-xs text-zinc-500 mt-0.5">রিয়েল-টাইম গুগল ম্যাপ ট্র্যাকিং ও অনলাইন ডিউরেশন</p>
              </div>
              <span className="px-2.5 py-1 bg-zinc-800 rounded-full text-xs font-bold text-zinc-300">
                {cofounders.length} Registered
              </span>
            </div>

            <div className="divide-y divide-zinc-800/80">
              {isLoadingList && cofounders.length === 0 ? (
                <div className="p-12 text-center text-zinc-500 text-xs">
                  Loading co-founder telemetry...
                </div>
              ) : cofounders.length === 0 ? (
                <div className="p-12 text-center text-zinc-500 flex flex-col items-center justify-center space-y-2">
                  <UserPlus className="w-10 h-10 text-zinc-700" />
                  <p className="text-sm font-semibold text-zinc-300">কোনো কো-ফাউন্ডার যুক্ত করা নেই</p>
                  <p className="text-xs text-zinc-500 max-w-sm">
                    বামদিকের ফর্মটি ব্যবহার করে আপনার কো-ফাউন্ডারের গুগল জিমেইল অ্যাড করুন।
                  </p>
                </div>
              ) : (
                cofounders.map((cf) => {
                  const mapsUrl = cf.maps_url || (cf.latitude && cf.longitude ? `https://www.google.com/maps?q=${cf.latitude},${cf.longitude}` : null);

                  return (
                    <div key={cf.id} className="p-5 hover:bg-[#161618] transition-colors space-y-3">
                      {/* Top Row: User info & Status */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-sm text-zinc-200">
                            {cf.email[0]?.toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-sm text-white flex items-center gap-2">
                              <span>{cf.email}</span>
                              <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded text-[10px] font-bold">
                                Co-Founder
                              </span>
                            </div>
                            <div className="text-xs text-zinc-500">
                              @{cf.username} &bull; ID: {cf.id}
                            </div>
                          </div>
                        </div>

                        {/* Online / Offline status */}
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2.5 h-2.5 rounded-full ${cf.is_online ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-600'}`} />
                          <span className={`text-xs font-bold ${cf.is_online ? 'text-emerald-400' : 'text-zinc-500'}`}>
                            {cf.is_online ? 'Online Now' : 'Offline'}
                          </span>
                        </div>
                      </div>

                      {/* Middle Row: Duration & Last Active */}
                      <div className="grid grid-cols-2 gap-2 text-xs bg-[#18181b] p-3 rounded-xl border border-zinc-800">
                        <div className="flex items-center gap-2 text-zinc-400">
                          <Clock className="w-4 h-4 text-zinc-500 shrink-0" />
                          <span>
                            Active Duration:{' '}
                            <strong className="text-white">
                              {cf.duration_mins ? `${cf.duration_mins} mins` : '0 mins'}
                            </strong>
                          </span>
                        </div>

                        <div className="text-right text-zinc-400 text-[11px]">
                          Last seen:{' '}
                          <span className="text-zinc-300">
                            {cf.last_active ? new Date(cf.last_active).toLocaleString() : 'Never logged in'}
                          </span>
                        </div>
                      </div>

                      {/* Bottom Row: Location Pin & Actions */}
                      <div className="flex items-center justify-between pt-1">
                        {mapsUrl ? (
                          <a
                            href={mapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 rounded-lg text-xs font-bold text-blue-400 transition-colors"
                          >
                            <MapPin className="w-3.5 h-3.5 text-blue-400" />
                            <span>View GPS on Google Maps ({cf.latitude?.toFixed(4)}, {cf.longitude?.toFixed(4)})</span>
                            <ExternalLink className="w-3 h-3 text-blue-400 ml-0.5" />
                          </a>
                        ) : (
                          <span className="text-[11px] text-zinc-600 italic flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-zinc-600" />
                            <span>Location not captured yet (Login pending)</span>
                          </span>
                        )}

                        <button
                          onClick={() => handleRevoke(cf.id, cf.email)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-950/20 rounded-lg text-xs font-semibold transition-colors"
                          title="Revoke access"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Revoke Access</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
