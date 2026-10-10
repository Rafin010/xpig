'use client';
import { useState, useEffect } from 'react';
import { ShieldCheck, Mail, Plus, UserPlus, ShieldAlert, Activity, Clock } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function TeamManagementPage() {
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  if (!user?.is_superuser) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-zinc-400">Only the platform owner can manage the team.</p>
        </div>
      </div>
    );
  }

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await fetch('https://xpig.onrender.com/api/v1/admin/cofounders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await res.json();
      
      if (res.ok) {
        setMessage({ type: 'success', text: 'Co-founder invited successfully!' });
        setEmail('');
        fetchCofounders(); // Refresh list
      } else {
        setMessage({ type: 'error', text: data.detail || 'Failed to invite user.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'An unexpected error occurred.' });
    } finally {
      setLoading(false);
    }
  };

  const [cofounders, setCofounders] = useState<any[]>([]);
  
  const fetchCofounders = async () => {
    try {
      const res = await fetch('https://xpig.onrender.com/api/v1/admin/cofounders');
      if (res.ok) {
        const data = await res.json();
        setCofounders(data);
      }
    } catch (err) {}
  };

  useEffect(() => {
    if (user?.is_superuser) fetchCofounders();
  }, [user]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto">
      {/* Header */}
      <div className="border-b border-zinc-800/50 pb-6">
        <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
          <ShieldCheck className="w-8 h-8 text-pink-500" />
          Team & Role Management
        </h1>
        <p className="text-zinc-400 mt-2">Add Co-Founders or partners to help manage the platform.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Invite Form */}
        <div className="bg-[#111] border border-zinc-800/50 p-6 rounded-2xl shadow-xl">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-blue-500" />
            Invite Co-Founder
          </h3>
          <p className="text-sm text-zinc-400 mb-6">
            They will be able to access the admin panel, upload videos, and view stats. They cannot view or manage ads, or delete videos.
          </p>

          <form onSubmit={handleInvite} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Google Account Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="partner@example.com"
                  className="w-full bg-[#1a1a1a] border border-zinc-800 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-pink-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !email}
              className="w-full bg-pink-600 hover:bg-pink-500 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-pink-900/20"
            >
              {loading ? 'Inviting...' : (
                <>
                  <Plus className="w-5 h-5" />
                  Grant Co-Founder Access
                </>
              )}
            </button>

            {message.text && (
              <div className={`p-4 rounded-xl text-sm font-semibold border ${message.type === 'success' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                {message.text}
              </div>
            )}
          </form>
        </div>

        {/* Roles Info Box */}
        <div className="bg-[#111] border border-zinc-800/50 p-6 rounded-2xl shadow-xl flex flex-col">
          <h3 className="text-lg font-bold text-white mb-4 border-b border-zinc-800 pb-2">Active Co-Founders</h3>
          
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {cofounders.length === 0 ? (
              <p className="text-sm text-zinc-500 italic">No co-founders have been invited yet.</p>
            ) : (
              <div className="space-y-4">
                {cofounders.map(cf => {
                  let statusColor = "bg-zinc-500";
                  let statusText = "Never logged in";
                  
                  if (cf.last_active) {
                    const diff = (new Date().getTime() - new Date(cf.last_active).getTime()) / 1000 / 60; // in minutes
                    if (diff < 15) {
                      statusColor = "bg-green-500 animate-pulse";
                      statusText = "Online now";
                    } else if (diff < 60) {
                      statusColor = "bg-green-500";
                      statusText = `Active ${Math.floor(diff)} mins ago`;
                    } else if (diff < 1440) {
                      statusColor = "bg-amber-500";
                      statusText = `Active ${Math.floor(diff / 60)} hrs ago`;
                    } else {
                      statusColor = "bg-zinc-500";
                      statusText = `Active ${Math.floor(diff / 1440)} days ago`;
                    }
                  }

                  return (
                    <div key={cf.id} className="flex items-center justify-between p-3 rounded-xl bg-[#1a1a1a] border border-zinc-800">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center">
                          <UserPlus className="w-5 h-5 text-zinc-400" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">{cf.email}</p>
                          <p className="text-xs text-zinc-500">@{cf.username}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <div className="flex items-center gap-1.5">
                          <div className={`w-2 h-2 rounded-full ${statusColor}`}></div>
                          <span className="text-xs font-semibold text-zinc-400">{statusText}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
