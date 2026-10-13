'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Mail, 
  Plus, 
  UserPlus, 
  MapPin, 
  Clock, 
  Trash2, 
  ExternalLink, 
  RefreshCw,
  Scale,
  MoreVertical,
  CheckCircle2,
  AlertTriangle,
  X,
  Shield,
  UserCheck,
  Video
} from 'lucide-react';

interface Cofounder {
  id: number;
  email: string;
  username: string;
  avatar_url?: string;
  uploaded_videos_count?: number;
  last_active?: string;
  is_online?: boolean;
  invite_status?: 'PENDING' | 'ACCEPTED';
  role?: string;
  latitude?: number;
  longitude?: number;
  maps_url?: string;
  ip?: string;
  duration_mins?: number;
}

export default function TeamManagementPage() {
  const [email, setEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState('Co-Founder');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [cofounders, setCofounders] = useState<Cofounder[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(true);

  // Check if current logged-in user is Super Admin
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  // 3-dots Menu State
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);

  // Change Role Modal State
  const [roleModalMember, setRoleModalMember] = useState<Cofounder | null>(null);
  const [newRole, setNewRole] = useState('Co-Founder');
  const [updatingRole, setUpdatingRole] = useState(false);

  // Custom Revoke Confirmation Modal State
  const [revokingMember, setRevokingMember] = useState<Cofounder | null>(null);
  const [revoking, setRevoking] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const role = localStorage.getItem('xpig_admin_role');
      setIsSuperAdmin(role === 'superuser');
    }
  }, []);

  const fetchCofounders = async () => {
    setIsLoadingList(true);
    try {
      const res = await fetch('https://xpig.onrender.com/api/v1/admin/cofounders');
      if (res.ok) {
        const data = await res.json();
        setCofounders(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Error fetching cofounders:', err);
    } finally {
      setIsLoadingList(false);
    }
  };

  useEffect(() => {
    fetchCofounders();
    // Auto-refresh telemetry every 30s
    const interval = setInterval(fetchCofounders, 30000);
    return () => clearInterval(interval);
  }, []);

  // Handle Invite
  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await fetch('https://xpig.onrender.com/api/v1/admin/cofounders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: email.trim().toLowerCase(),
          role: selectedRole
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ 
          type: 'success', 
          text: `Invitation sent successfully to ${email}. Role: ${selectedRole}. Status: Pending Acceptance.` 
        });
        setEmail('');
        fetchCofounders();
      } else {
        setMessage({ type: 'error', text: data.detail || 'Failed to authorize co-founder access.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Network error connecting to auth server.' });
    } finally {
      setLoading(false);
    }
  };

  // Handle Role Change
  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleModalMember) return;
    setUpdatingRole(true);

    try {
      const res = await fetch(`https://xpig.onrender.com/api/v1/admin/cofounders/${roleModalMember.id}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.detail || 'Failed to update member role');
      }

      setCofounders(prev => prev.map(c => c.id === roleModalMember.id ? { ...c, role: newRole } : c));
      setRoleModalMember(null);
    } catch (err: any) {
      alert(err.message || 'Error updating role');
    } finally {
      setUpdatingRole(false);
    }
  };

  // Handle Confirm Revoke
  const handleConfirmRevoke = async () => {
    if (!revokingMember) return;
    setRevoking(true);

    try {
      const res = await fetch(`https://xpig.onrender.com/api/v1/admin/cofounders/${revokingMember.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setCofounders((prev) => prev.filter((c) => c.id !== revokingMember.id));
        setRevokingMember(null);
      } else {
        alert('Failed to revoke member access.');
      }
    } catch {
      alert('Network error while revoking access.');
    } finally {
      setRevoking(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto pb-24">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 sm:pb-6 border-b border-zinc-800/80">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-full text-xs font-semibold text-zinc-300 mb-2">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>Role-Based Access Control (RBAC) & Team Management</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5 sm:gap-3">
            <ShieldCheck className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-400" />
            <span>Team & Co-Founder Roles</span>
          </h1>
          <p className="text-zinc-400 text-xs sm:text-sm mt-1">
            Authorize Google Accounts for team members, track invitation acceptance, and manage role privileges.
          </p>
        </div>

        <button
          onClick={fetchCofounders}
          disabled={isLoadingList}
          className="self-start sm:self-auto px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoadingList ? 'animate-spin text-pink-500' : ''}`} />
          <span>Refresh Telemetry</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8">
        
        {/* Left Column: Invite Form & Security Overview */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#111113] border border-zinc-800/80 p-6 rounded-2xl shadow-xl space-y-5">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-zinc-800/80 pb-3">
              <UserPlus className="w-5 h-5 text-blue-400" />
              <span>Invite New Team Member</span>
            </h3>

            <p className="text-xs text-zinc-400 leading-relaxed">
              Only authorized Google Gmail addresses added here can access the portal via Google Sign-In. You can assign specific functional roles.
            </p>

            <form onSubmit={handleInvite} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider">
                  Authorized Google Gmail <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="partner@gmail.com"
                    className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider">
                  Assigned Team Role
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl py-2.5 px-3.5 text-sm text-white focus:outline-none focus:border-pink-500 transition-colors"
                >
                  <option value="Co-Founder">Co-Founder (Content & Community)</option>
                  <option value="Moderator">Content Moderator (Review & Flags)</option>
                  <option value="Analytics Viewer">Analytics Viewer (Read-Only Stats)</option>
                  <option value="Support Lead">Support Lead (User Management)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading || !email}
                className="w-full bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-pink-900/30 text-sm active:scale-[0.98]"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Authorizing...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Send Invite & Grant Access</span>
                  </>
                )}
              </button>

              {message.text && (
                <div className={`p-3.5 rounded-xl text-xs font-semibold border flex items-start gap-2 ${
                  message.type === 'success' 
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                    : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                }`}>
                  {message.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  )}
                  <span>{message.text}</span>
                </div>
              )}
            </form>
          </div>

          {/* Strict Role Policy Box */}
          <div className="bg-[#111113] border border-zinc-800/80 p-5 rounded-2xl space-y-2 text-xs text-zinc-400">
            <div className="flex items-center gap-2 text-zinc-200 font-bold">
              <Scale className="w-4 h-4 text-amber-400" />
              <span>Strict RBAC Security Rules:</span>
            </div>
            <ul className="list-disc pl-4 space-y-1.5 text-[11px] text-zinc-400">
              <li>Co-Founders cannot access Cloudflare R2 storage credentials or secrets.</li>
              <li>Only Super Admin can invite, modify, or revoke team member privileges.</li>
              <li>Financial balances, payouts, and revenue streams are hidden from standard roles.</li>
              <li><strong className="text-zinc-200">User IP addresses & GPS coordinates are strictly restricted to the Super Admin.</strong></li>
            </ul>
          </div>
        </div>

        {/* Right Column: Active Team Members Table */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-[#111113] border border-zinc-800/80 rounded-2xl shadow-xl overflow-hidden flex flex-col">
            <div className="p-5 border-b border-zinc-800/80 flex items-center justify-between bg-zinc-900/40">
              <div>
                <h3 className="text-base font-bold text-white">Active Team Members & Telemetry</h3>
                <p className="text-xs text-zinc-400 mt-0.5">Real-time invitation status, roles, and session audit</p>
              </div>
              <span className="px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-full text-xs font-bold text-zinc-300">
                {cofounders.length} Member{cofounders.length !== 1 ? 's' : ''}
              </span>
            </div>

            <div className="divide-y divide-zinc-800/80">
              {isLoadingList && cofounders.length === 0 ? (
                <div className="p-12 text-center text-zinc-500 text-xs flex flex-col items-center gap-2">
                  <RefreshCw className="w-6 h-6 animate-spin text-pink-500" />
                  <span>Loading team roster...</span>
                </div>
              ) : cofounders.length === 0 ? (
                <div className="p-12 text-center text-zinc-500 flex flex-col items-center justify-center space-y-2">
                  <UserPlus className="w-10 h-10 text-zinc-700" />
                  <p className="text-sm font-semibold text-zinc-300">No Co-Founders or Team Members Added</p>
                  <p className="text-xs text-zinc-500 max-w-sm">
                    Use the form on the left to authorize your partner or moderator&apos;s Google Account.
                  </p>
                </div>
              ) : (
                cofounders.map((cf) => {
                  const isAccepted = cf.invite_status === 'ACCEPTED' || cf.last_active;
                  const mapsUrl = isSuperAdmin ? (cf.maps_url || (cf.latitude && cf.longitude ? `https://www.google.com/maps?q=${cf.latitude},${cf.longitude}` : null)) : null;

                  return (
                    <div key={cf.id} className="p-5 hover:bg-zinc-900/40 transition-colors space-y-3 relative">
                      
                      {/* Top Row: User Avatar, Email, Status, & 3-Dots */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-700 flex items-center justify-center font-bold text-sm text-zinc-200 shrink-0 overflow-hidden shadow-sm">
                            {cf.avatar_url ? (
                              <img 
                                src={cf.avatar_url} 
                                alt={cf.username || cf.email} 
                                className="w-full h-full object-cover" 
                                referrerPolicy="no-referrer" 
                              />
                            ) : (
                              cf.email[0]?.toUpperCase() || 'U'
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-sm text-white flex items-center gap-2 flex-wrap">
                              <span className="truncate max-w-[200px]" title={cf.email}>{cf.email}</span>
                              <span className="px-2.5 py-0.5 bg-gradient-to-r from-amber-400 to-orange-500 text-black rounded-md text-[10px] font-black uppercase tracking-wider shadow-sm">
                                {cf.role || 'Co-Founder'}
                              </span>
                            </div>
                            <div className="text-xs text-zinc-500 flex items-center gap-2 mt-0.5">
                              <span>@{cf.username}</span>
                              <span>•</span>
                              <span>ID: #{cf.id}</span>
                            </div>
                          </div>
                        </div>

                        {/* Status Badges & 3-Dots Menu */}
                        <div className="flex items-center gap-3">
                          {/* Invite Acceptance Status */}
                          <div className="hidden sm:flex items-center">
                            {isAccepted ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 rounded-full text-[11px] font-bold">
                                <CheckCircle2 className="w-3 h-3" />
                                Active & Accepted
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-400/15 border border-amber-400/30 text-amber-400 rounded-full text-[11px] font-bold">
                                <Clock className="w-3 h-3" />
                                Pending Invite
                              </span>
                            )}
                          </div>

                          {/* 3-Dots Action Button */}
                          <div className="relative">
                            <button
                              onClick={() => setActiveMenuId(activeMenuId === cf.id ? null : cf.id)}
                              className="p-1.5 text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg border border-zinc-800 transition-colors"
                              title="Member Options"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>

                            {/* Dropdown Menu */}
                            {activeMenuId === cf.id && (
                              <div className="absolute right-0 top-8 z-30 w-44 bg-[#141416] border border-zinc-700/80 rounded-xl shadow-2xl py-1 text-xs">
                                <button
                                  onClick={() => {
                                    setRoleModalMember(cf);
                                    setNewRole(cf.role || 'Co-Founder');
                                    setActiveMenuId(null);
                                  }}
                                  className="w-full text-left px-3.5 py-2 hover:bg-zinc-800/80 text-zinc-200 flex items-center gap-2"
                                >
                                  <UserCheck className="w-3.5 h-3.5 text-pink-400" />
                                  <span>Change Role</span>
                                </button>

                                <button
                                  onClick={() => {
                                    setRevokingMember(cf);
                                    setActiveMenuId(null);
                                  }}
                                  className="w-full text-left px-3.5 py-2 hover:bg-rose-950/40 text-rose-400 flex items-center gap-2 border-t border-zinc-800/80"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Revoke Access</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Middle Row: Duration & Last Active */}
                      <div className="grid grid-cols-2 gap-2 text-xs bg-zinc-900/60 p-3 rounded-xl border border-zinc-800/80">
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
                          <span className="text-zinc-300 font-medium">
                            {cf.last_active ? new Date(cf.last_active).toLocaleString() : 'Awaiting first login'}
                          </span>
                        </div>
                      </div>

                      {/* Super Admin Only: Co-Founder Video Upload Count Tracker */}
                      {isSuperAdmin && (
                        <div className="flex items-center justify-between px-3.5 py-2.5 bg-gradient-to-r from-blue-950/20 via-zinc-900/90 to-pink-950/20 border border-blue-500/20 rounded-xl text-xs">
                          <div className="flex items-center gap-2">
                            <Video className="w-4 h-4 text-pink-400 shrink-0" />
                            <span className="text-zinc-300 font-medium">আপলোডকৃত ভিডিও:</span>
                            <span className="px-2.5 py-0.5 bg-pink-500/15 border border-pink-500/30 text-pink-400 font-bold rounded-lg text-xs">
                              {cf.uploaded_videos_count || 0} টি
                            </span>
                          </div>
                          <span className="text-[10px] text-zinc-400 font-mono tracking-wide px-2 py-0.5 bg-zinc-900/90 rounded border border-zinc-800">
                            Super Admin Only
                          </span>
                        </div>
                      )}

                      {/* Bottom Row: GPS Location (Super Admin Only) & Action */}
                      <div className="flex items-center justify-between pt-1">
                        {isSuperAdmin ? (
                          mapsUrl ? (
                            <a
                              href={mapsUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 rounded-lg text-xs font-bold text-blue-400 transition-colors"
                            >
                              <MapPin className="w-3.5 h-3.5 text-blue-400" />
                              <span>View GPS Map ({cf.latitude?.toFixed(4)}, {cf.longitude?.toFixed(4)})</span>
                              <ExternalLink className="w-3 h-3 ml-0.5" />
                            </a>
                          ) : (
                            <span className="text-[11px] text-zinc-500 italic flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-zinc-600" />
                              <span>GPS not recorded yet (Waiting for Google sign-in)</span>
                            </span>
                          )
                        ) : (
                          <span className="text-[11px] text-zinc-600 italic">
                            Location audit restricted to Super Admin
                          </span>
                        )}

                        <button
                          onClick={() => setRevokingMember(cf)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-zinc-400 hover:text-rose-400 hover:bg-rose-950/20 rounded-lg text-xs font-semibold transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Revoke</span>
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

      {/* CHANGE ROLE MODAL */}
      {roleModalMember && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#141417] border border-zinc-800 text-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/60">
              <div>
                <h3 className="text-base font-bold text-white">Change Member Role</h3>
                <p className="text-xs text-zinc-400 mt-0.5 font-mono">{roleModalMember.email}</p>
              </div>
              <button
                onClick={() => setRoleModalMember(null)}
                className="p-1.5 text-zinc-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRole} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">
                  Select New Role
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl py-2.5 px-3.5 text-sm text-white focus:outline-none focus:border-pink-500 transition-colors"
                >
                  <option value="Co-Founder">Co-Founder (Content & Community)</option>
                  <option value="Moderator">Content Moderator (Review & Flags)</option>
                  <option value="Analytics Viewer">Analytics Viewer (Read-Only Stats)</option>
                  <option value="Support Lead">Support Lead (User Management)</option>
                </select>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setRoleModalMember(null)}
                  className="flex-1 px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 rounded-xl font-semibold text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingRole}
                  className="flex-1 px-4 py-2.5 bg-pink-600 hover:bg-pink-500 text-white rounded-xl font-bold text-xs transition-all shadow-lg shadow-pink-900/30 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {updatingRole ? 'Updating...' : 'Save Role'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CUSTOM REVOKE CONFIRMATION MODAL */}
      {revokingMember && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#141417] border border-rose-900/70 text-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="w-14 h-14 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4 text-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.2)]">
                <AlertTriangle className="w-7 h-7" />
              </div>

              <h3 className="text-xl font-black text-white">Revoke Team Access?</h3>
              <p className="text-xs text-zinc-400 mt-1.5 mb-5 leading-relaxed">
                Are you sure you want to remove <strong className="text-white">{revokingMember.email}</strong>? Their Google account will immediately lose all management access to this platform.
              </p>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setRevokingMember(null)}
                  disabled={revoking}
                  className="flex-1 px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 rounded-xl font-semibold text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmRevoke}
                  disabled={revoking}
                  className="flex-1 px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold text-xs transition-all shadow-lg shadow-rose-900/40 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {revoking ? 'Revoking...' : 'Yes, Revoke Access'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
