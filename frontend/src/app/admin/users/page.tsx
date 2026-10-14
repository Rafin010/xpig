'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Search, 
  MoreVertical, 
  CheckCircle2, 
  AlertTriangle, 
  UserX, 
  Users, 
  User, 
  TrendingUp,
  MapPin, 
  Trash2, 
  UserCheck, 
  ExternalLink, 
  Globe, 
  Wifi, 
  Monitor, 
  Clock, 
  X, 
  RefreshCw, 
  Shield, 
  Filter, 
  ChevronDown, 
  Check,
  Smartphone,
  MousePointer,
  FileText,
  Activity,
  Copy,
  Play,
  Calendar
} from 'lucide-react';

interface UserData {
  id: number | string;
  username: string;
  email: string;
  avatar_url?: string;
  uploaded_videos_count?: number;
  is_active: boolean;
  role?: string;
  created_at?: string;
  last_active?: string;
  is_online?: boolean;
  online_duration_seconds?: number;
  formatted_online_duration?: string;
  session_started_at?: string;
  device_name?: string;
  browser_name?: string;
  os_name?: string;
  cookie_tracker_id?: string;
  total_clicks?: number;
  total_watched_videos?: number;
  total_watch_seconds?: number;
  formatted_watch_time?: string;
  last_ip?: string;
  country?: string;
  city?: string;
  is_superuser?: boolean;
  is_cofounder?: boolean;
}

interface UserLocationData {
  user_id: number | string;
  username: string;
  email: string;
  role: string;
  is_active: boolean;
  last_active: string;
  ip: string;
  country: string;
  city: string;
  region: string;
  isp: string;
  device: string;
  latitude: number;
  longitude: number;
  maps_url: string;
}

interface UserDossierData {
  user_id: number | string;
  username: string;
  email: string;
  avatar_url?: string;
  role: string;
  is_active: boolean;
  is_superuser?: boolean;
  is_cofounder?: boolean;
  created_at?: string;
  account_age_days: number;
  last_active?: string;
  is_online: boolean;
  online_duration_seconds?: number;
  formatted_online_duration?: string;
  session_started_at?: string;
  device_name: string;
  browser_name: string;
  os_name: string;
  cookie_tracker_id: string;
  total_clicks: number;
  total_watched_videos: number;
  total_watch_seconds: number;
  formatted_watch_time: string;
  avg_watch_per_video: string;
  ip: string;
  country: string;
  city: string;
  isp: string;
  latitude: number;
  longitude: number;
  maps_url: string;
  uploaded_videos_count: number;
}

interface GuestData {
  id: number;
  cookie_tracker_id: string;
  ip_address: string;
  country: string;
  city: string;
  isp: string;
  device_name: string;
  browser_name: string;
  os_name: string;
  total_clicks: number;
  total_watched_videos: number;
  total_watch_seconds: number;
  formatted_watch_time: string;
  first_seen?: string;
  last_active?: string;
  is_online: boolean;
  online_duration_seconds: number;
  formatted_online_duration: string;
  session_started_at?: string;
  is_converted: boolean;
  converted_to_user_id?: number | null;
  converted_username?: string | null;
}

interface GuestDossierData {
  guest_id: number;
  cookie_tracker_id: string;
  is_converted: boolean;
  converted_to_user_id?: number | null;
  converted_username?: string | null;
  first_seen?: string;
  first_seen_days: number;
  last_active?: string;
  is_online: boolean;
  online_duration_seconds: number;
  formatted_online_duration: string;
  session_started_at?: string;
  device_name: string;
  browser_name: string;
  os_name: string;
  total_clicks: number;
  total_watched_videos: number;
  total_watch_seconds: number;
  formatted_watch_time: string;
  avg_watch_per_video: string;
  ip: string;
  country: string;
  city: string;
  region: string;
  isp: string;
  latitude: number;
  longitude: number;
  maps_url: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://xpig.onrender.com';

function formatTimeAgo(dateStr?: string | null): string {
  if (!dateStr) return 'Inactive';
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - d.getTime()) / 1000);
    if (diffSec < 60) return 'Just now';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    return `${Math.floor(diffSec / 86400)}d ago`;
  } catch {
    return 'Recently';
  }
}

function formatFullDateTime(dateStr?: string | null): string {
  if (!dateStr) return 'N/A';
  try {
    const d = new Date(dateStr);
    return d.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  } catch {
    return dateStr;
  }
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Status Filter State
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'banned'>('all');
  const [isStatusFilterOpen, setIsStatusFilterOpen] = useState(false);
  const statusFilterRef = useRef<HTMLDivElement>(null);

  // Role Filter State
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [isRoleFilterOpen, setIsRoleFilterOpen] = useState(false);
  const roleFilterRef = useRef<HTMLDivElement>(null);

  // Super Admin Check
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  // Active 3-dots Menu State
  const [activeMenuId, setActiveMenuId] = useState<number | string | null>(null);

  // Custom Delete Modal State
  const [deletingUser, setDeletingUser] = useState<UserData | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Change Role Modal State
  const [roleModalUser, setRoleModalUser] = useState<UserData | null>(null);
  const [selectedRole, setSelectedRole] = useState('User');
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);

  // View Location Modal State (Super Admin Only)
  const [locationUser, setLocationUser] = useState<UserData | null>(null);
  const [locationData, setLocationData] = useState<UserLocationData | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // A-to-Z User Bio Data Dossier Modal State
  const [dossierUserId, setDossierUserId] = useState<number | string | null>(null);
  const [dossierData, setDossierData] = useState<UserDossierData | null>(null);
  const [loadingDossier, setLoadingDossier] = useState(false);
  const [dossierError, setDossierError] = useState<string | null>(null);
  const [copiedCookie, setCopiedCookie] = useState(false);

  // Tab Switcher State: Registered vs Guests
  const [activeTab, setActiveTab] = useState<'registered' | 'guests'>('registered');

  // Guest Visitors States
  const [guests, setGuests] = useState<GuestData[]>([]);
  const [loadingGuests, setLoadingGuests] = useState(false);
  const [guestSearchQuery, setGuestSearchQuery] = useState('');
  const [guestConversionFilter, setGuestConversionFilter] = useState<'all' | 'unregistered' | 'converted'>('all');
  const [dossierGuestId, setDossierGuestId] = useState<number | null>(null);
  const [guestDossierData, setGuestDossierData] = useState<GuestDossierData | null>(null);
  const [loadingGuestDossier, setLoadingGuestDossier] = useState(false);
  const [guestDossierError, setGuestDossierError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const role = localStorage.getItem('xpig_admin_role');
      setIsSuperAdmin(role === 'superuser');
    }
  }, []);

  const fetchUsers = async (silent: boolean = false) => {
    try {
      if (!silent) setLoading(true);
      const res = await fetch(`${API_BASE}/api/v1/users/`);
      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json();
      if (Array.isArray(data)) {
        setUsers(data);
      } else if (data && Array.isArray(data.items)) {
        setUsers(data.items);
      } else {
        setUsers([]);
      }
    } catch (err) {
      if (!silent) console.error('Failed to fetch users:', err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const fetchGuests = async (silent: boolean = false) => {
    try {
      if (!silent) setLoadingGuests(true);
      const res = await fetch(`${API_BASE}/api/v1/users/guests`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setGuests(data);
        } else if (data && Array.isArray(data.items)) {
          setGuests(data.items);
        } else {
          setGuests([]);
        }
      } else {
        if (!silent) console.warn('Guest telemetry endpoint returned status:', res.status);
      }
    } catch (err) {
      if (!silent) console.warn('Failed to fetch guests:', err);
    } finally {
      if (!silent) setLoadingGuests(false);
    }
  };

  useEffect(() => {
    fetchUsers(false);
    fetchGuests(false);
    // Real-time auto-refresh polling every 6 seconds for live presence & clicks
    const pollInterval = setInterval(() => {
      fetchUsers(true);
      fetchGuests(true);
    }, 6000);
    return () => clearInterval(pollInterval);
  }, []);

  // Click-outside listener to close dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (statusFilterRef.current && !statusFilterRef.current.contains(e.target as Node)) {
        setIsStatusFilterOpen(false);
      }
      if (roleFilterRef.current && !roleFilterRef.current.contains(e.target as Node)) {
        setIsRoleFilterOpen(false);
      }
      // Close active 3-dot menu if clicked outside
      const target = e.target as HTMLElement;
      if (!target.closest('[data-menu-container]')) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside, { passive: true });
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  // Avatar background gradient generator
  const getAvatarBg = (name: string) => {
    const gradients = [
      'from-pink-500/20 to-rose-600/20 text-pink-400 border-pink-500/30',
      'from-purple-500/20 to-indigo-600/20 text-purple-400 border-purple-500/30',
      'from-blue-500/20 to-cyan-600/20 text-blue-400 border-blue-500/30',
      'from-emerald-500/20 to-teal-600/20 text-emerald-400 border-emerald-500/30',
      'from-amber-500/20 to-orange-600/20 text-amber-400 border-amber-500/30',
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return gradients[Math.abs(hash) % gradients.length];
  };

  // Filtered Users
  const filteredUsers = useMemo(() => {
    let result = users;

    // Status filter
    if (statusFilter === 'active') result = result.filter(u => u.is_active);
    if (statusFilter === 'banned') result = result.filter(u => !u.is_active);

    // Role filter
    if (roleFilter !== 'all') {
      result = result.filter(u => {
        const r = (u.role || 'user').toLowerCase();
        if (roleFilter === 'cofounder') return Boolean(u.is_cofounder || r.includes('co-founder') || r.includes('cofounder'));
        if (roleFilter === 'creator') return r.includes('creator');
        if (roleFilter === 'moderator') return r.includes('moderator');
        return (r === 'user' || r === '') && !u.is_cofounder && !r.includes('creator') && !r.includes('moderator');
      });
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(u => 
        (u.username || '').toLowerCase().includes(q) ||
        (u.email || '').toLowerCase().includes(q) ||
        (u.device_name || '').toLowerCase().includes(q) ||
        String(u.id).includes(q)
      );
    }

    return result;
  }, [users, searchQuery, statusFilter, roleFilter]);

  // Handle Delete User
  const handleConfirmDelete = async () => {
    if (!deletingUser) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`${API_BASE}/api/v1/users/${deletingUser.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.detail || 'Failed to delete user.');
      }

      setUsers(prev => prev.filter(u => u.id !== deletingUser.id));
      setDeletingUser(null);
    } catch (err: any) {
      alert(err.message || 'Error deleting user');
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle Toggle Active/Ban Status
  const handleToggleStatus = async (user: UserData) => {
    try {
      const newStatus = !user.is_active;
      const res = await fetch(`${API_BASE}/api/v1/users/${user.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: newStatus }),
      });

      if (!res.ok) throw new Error('Failed to update status');

      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, is_active: newStatus } : u));
    } catch (err: any) {
      alert(err.message || 'Error updating status');
    }
  };

  // Handle Role Change
  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleModalUser) return;
    setIsUpdatingRole(true);

    try {
      const res = await fetch(`${API_BASE}/api/v1/users/${roleModalUser.id}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: selectedRole }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.detail || 'Failed to update role');
      }

      const resData = await res.json();
      setUsers(prev => prev.map(u => u.id === roleModalUser.id ? { ...u, role: resData.role } : u));
      setRoleModalUser(null);
    } catch (err: any) {
      alert(err.message || 'Error updating role');
    } finally {
      setIsUpdatingRole(false);
    }
  };

  // Handle Fetch Location (Super Admin Only)
  const handleOpenLocation = async (user: UserData) => {
    if (!isSuperAdmin) {
      alert('Security Protocol: User location and IP inspection is strictly restricted to the Super Admin.');
      return;
    }

    setLocationUser(user);
    setLocationData(null);
    setLoadingLocation(true);
    setLocationError(null);

    try {
      const res = await fetch(`${API_BASE}/api/v1/users/${user.id}/location`);
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.detail || 'Failed to retrieve location telemetry');
      }
      const data = await res.json();
      setLocationData(data);
    } catch (err: any) {
      setLocationError(err.message || 'Error fetching telemetry');
    } finally {
      setLoadingLocation(false);
    }
  };

  // Handle Open User Bio Data Dossier
  const handleOpenDossier = async (user: UserData) => {
    setDossierUserId(user.id);
    setDossierData(null);
    setLoadingDossier(true);
    setDossierError(null);

    try {
      const res = await fetch(`${API_BASE}/api/v1/users/${user.id}/dossier`);
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.detail || 'Failed to retrieve user bio data dossier');
      }
      const data = await res.json();
      setDossierData(data);
    } catch (err: any) {
      setDossierError(err.message || 'Error loading user bio data');
    } finally {
      setLoadingDossier(false);
    }
  };

  const copyToClipboard = (text: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedCookie(true);
      setTimeout(() => setCopiedCookie(false), 2000);
    }
  };

  // Handle Open Guest Bio Data Dossier
  const handleOpenGuestDossier = async (guestId: number) => {
    setDossierGuestId(guestId);
    setGuestDossierData(null);
    setLoadingGuestDossier(true);
    setGuestDossierError(null);

    try {
      const res = await fetch(`${API_BASE}/api/v1/users/guests/${guestId}/dossier`);
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.detail || 'Failed to retrieve guest bio data dossier');
      }
      const data = await res.json();
      setGuestDossierData(data);
    } catch (err: any) {
      setGuestDossierError(err.message || 'Error loading guest bio data');
    } finally {
      setLoadingGuestDossier(false);
    }
  };

  const filteredGuests = useMemo(() => {
    let result = guests;
    if (guestConversionFilter === 'unregistered') result = result.filter(g => !g.is_converted);
    if (guestConversionFilter === 'converted') result = result.filter(g => g.is_converted);
    if (guestSearchQuery.trim()) {
      const q = guestSearchQuery.toLowerCase().trim();
      result = result.filter(g => 
        (g.cookie_tracker_id || '').toLowerCase().includes(q) ||
        (g.device_name || '').toLowerCase().includes(q) ||
        (g.browser_name || '').toLowerCase().includes(q) ||
        (g.os_name || '').toLowerCase().includes(q) ||
        (g.ip_address || '').toLowerCase().includes(q) ||
        (g.country || '').toLowerCase().includes(q) ||
        (g.city || '').toLowerCase().includes(q) ||
        (g.converted_username || '').toLowerCase().includes(q) ||
        String(g.id).includes(q)
      );
    }
    return result;
  }, [guests, guestSearchQuery, guestConversionFilter]);

  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.is_active).length;
  const bannedUsers = users.filter(u => !u.is_active).length;

  const totalGuests = guests.length;
  const liveGuests = guests.filter(g => g.is_online).length;
  const convertedGuests = guests.filter(g => g.is_converted).length;

  return (
    <div className="space-y-5 animate-in fade-in duration-500 pb-24">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-full text-xs font-semibold text-zinc-300 mb-1.5">
            <Shield className="w-3.5 h-3.5 text-blue-400" />
            <span>Account Security & Bio Data Intelligence</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Users className="w-7 h-7 text-pink-500" />
            User Directory & Access Control
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
            Real-time device tracking, persistent cookie telemetry, watch time consumption & A-to-Z user profiles.
          </p>
        </div>

        <button
          onClick={() => {
            if (activeTab === 'registered') fetchUsers(false);
            else fetchGuests(false);
          }}
          disabled={loading || loadingGuests}
          className="self-start sm:self-auto px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${(loading || loadingGuests) ? 'animate-spin text-pink-500' : ''}`} />
          <span>Refresh Directory</span>
        </button>
      </div>

      {/* Tab Switcher: Registered Users vs Guest Visitors (Sleek Gray/Black Dark Theme) */}
      <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-[#0e0e11] border border-zinc-800/90 rounded-2xl shadow-inner w-fit">
        <button
          onClick={() => setActiveTab('registered')}
          className={`group flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 ${
            activeTab === 'registered'
              ? 'bg-zinc-800/90 text-white border border-zinc-700/80 shadow-md shadow-black/40'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60 border border-transparent'
          }`}
        >
          <Users className={`w-4 h-4 transition-colors ${activeTab === 'registered' ? 'text-zinc-200' : 'text-zinc-500 group-hover:text-zinc-300'}`} />
          <span>Registered Users</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold transition-colors ${
            activeTab === 'registered'
              ? 'bg-zinc-900 border border-zinc-700/80 text-zinc-200 shadow-sm'
              : 'bg-zinc-900/60 border border-zinc-800/80 text-zinc-500 group-hover:text-zinc-400'
          }`}>
            {users.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('guests')}
          className={`group flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 ${
            activeTab === 'guests'
              ? 'bg-zinc-800/90 text-white border border-zinc-700/80 shadow-md shadow-black/40'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60 border border-transparent'
          }`}
        >
          <Smartphone className={`w-4 h-4 transition-colors ${activeTab === 'guests' ? 'text-zinc-200' : 'text-zinc-500 group-hover:text-zinc-300'}`} />
          <span>Guest Visitors (Unregistered)</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold transition-colors ${
            activeTab === 'guests'
              ? 'bg-zinc-900 border border-zinc-700/80 text-zinc-200 shadow-sm'
              : 'bg-zinc-900/60 border border-zinc-800/80 text-zinc-500 group-hover:text-zinc-400'
          }`}>
            {guests.length}
          </span>
        </button>
      </div>

      {/* COMPACT KPI STATS ROW (Dynamic based on Tab with Smooth Animation) */}
      <div key={activeTab + '-kpis'} className="animate-tab-switch">
        {activeTab === 'registered' ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-[#111114] border border-zinc-800/80 px-4 py-3 rounded-xl shadow-md flex items-center justify-between">
              <div>
                <span className="font-semibold text-[11px] tracking-wider uppercase text-zinc-400">Total Registered</span>
                <div className="text-2xl font-black font-mono text-white mt-0.5">{totalUsers}</div>
                <div className="text-[10px] text-zinc-400 flex items-center gap-1 mt-0.5 font-medium">
                  <TrendingUp className="w-3 h-3 text-emerald-400" /> Live Database Records
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-zinc-800/80 border border-zinc-700/60 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5 text-zinc-200" />
              </div>
            </div>

            <div className="bg-[#111114] border border-zinc-800/80 px-4 py-3 rounded-xl shadow-md flex items-center justify-between">
              <div>
                <span className="font-semibold text-[11px] tracking-wider uppercase text-zinc-400">Active Accounts</span>
                <div className="text-2xl font-black font-mono text-white mt-0.5">{activeUsers}</div>
                <div className="text-[10px] text-zinc-500 mt-0.5">Unrestricted Login Status</div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-zinc-800/80 border border-zinc-700/60 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              </div>
            </div>

            <div className="bg-[#111114] border border-zinc-800/80 px-4 py-3 rounded-xl shadow-md flex items-center justify-between">
              <div>
                <span className="font-semibold text-[11px] tracking-wider uppercase text-zinc-400">Banned / Suspended</span>
                <div className="text-2xl font-black font-mono text-white mt-0.5">{bannedUsers}</div>
                <div className="text-[10px] text-zinc-500 mt-0.5">Access Revoked</div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-zinc-800/80 border border-zinc-700/60 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-[#111114] border border-zinc-800/80 px-4 py-3 rounded-xl shadow-md flex items-center justify-between">
              <div>
                <span className="font-semibold text-[11px] tracking-wider uppercase text-zinc-400">Total Guest Visitors</span>
                <div className="text-2xl font-black font-mono text-white mt-0.5">{totalGuests}</div>
                <div className="text-[10px] text-zinc-400 flex items-center gap-1 mt-0.5 font-medium">
                  <Smartphone className="w-3 h-3 text-zinc-400" /> Anonymous Cookie Sessions
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-zinc-800/80 border border-zinc-700/60 flex items-center justify-center shrink-0">
                <Smartphone className="w-5 h-5 text-zinc-200" />
              </div>
            </div>

            <div className="bg-[#111114] border border-zinc-800/80 px-4 py-3 rounded-xl shadow-md flex items-center justify-between">
              <div>
                <span className="font-semibold text-[11px] tracking-wider uppercase text-zinc-400">Live Guests Now</span>
                <div className="text-2xl font-black font-mono text-emerald-400 mt-0.5">{liveGuests}</div>
                <div className="text-[10px] text-emerald-400 flex items-center gap-1 mt-0.5 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Active Heartbeat (&lt; 5m)
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-zinc-800/80 border border-zinc-700/60 flex items-center justify-center shrink-0">
                <Activity className="w-5 h-5 text-emerald-400" />
              </div>
            </div>

            <div className="bg-[#111114] border border-zinc-800/80 px-4 py-3 rounded-xl shadow-md flex items-center justify-between">
              <div>
                <span className="font-semibold text-[11px] tracking-wider uppercase text-zinc-400">Merged to Accounts</span>
                <div className="text-2xl font-black font-mono text-white mt-0.5">{convertedGuests}</div>
                <div className="text-[10px] text-zinc-400 mt-0.5">Lifecycle Continuity Merged</div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-zinc-800/80 border border-zinc-700/60 flex items-center justify-center shrink-0">
                <TrendingUp className="w-5 h-5 text-zinc-300" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Users Table Card */}
      {activeTab === 'registered' && (
        <div key="registered-table" className="animate-tab-switch bg-[#111114] border border-zinc-800/80 rounded-2xl shadow-xl overflow-hidden flex flex-col">

        
        {/* Table Filter & Search Bar */}
        <div className="p-3.5 sm:p-4 border-b border-zinc-800/80 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-3 bg-zinc-900/40">
          
          {/* Title and Results Count Badge */}
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <span>All Accounts</span>
            </h3>
            <span className="text-xs text-zinc-400 bg-zinc-900 px-3 py-1 rounded-full border border-zinc-800 font-medium">
              Showing <span className="text-white font-mono font-bold">{filteredUsers.length}</span> of <span className="text-white font-mono font-bold">{users.length}</span> users
            </span>
          </div>

          {/* Filter Controls: Search, Status, Role, Reset */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full xl:w-auto">
            
            {/* Search Input */}
            <div className="relative flex-1 sm:w-64 md:w-72">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search username, email, device, ID..." 
                className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl pl-9 pr-9 py-2 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all" 
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Status Filter Button + Popup */}
            <div className="relative" ref={statusFilterRef}>
              <button
                type="button"
                onClick={() => {
                  setIsStatusFilterOpen(!isStatusFilterOpen);
                  setIsRoleFilterOpen(false);
                }}
                className="flex items-center justify-between sm:justify-start gap-2 px-3 py-2 rounded-xl bg-[#141417] border border-zinc-800 text-xs font-semibold text-zinc-300 hover:text-white hover:border-zinc-700 transition-colors w-full sm:w-auto"
              >
                <div className="flex items-center gap-2">
                  <Filter className="w-3.5 h-3.5 text-zinc-400" />
                  <span>
                    Status: <span className="text-white font-bold">{statusFilter === 'all' ? 'All' : statusFilter === 'active' ? 'Active' : 'Banned'}</span>
                  </span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 transition-transform duration-200 ${isStatusFilterOpen ? 'rotate-180' : ''}`} />
              </button>

              {isStatusFilterOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-[#121216]/95 backdrop-blur-xl border border-zinc-700/80 rounded-xl p-1 shadow-2xl z-50">
                  {[
                    { value: 'all', label: 'All Statuses' },
                    { value: 'active', label: 'Active Only' },
                    { value: 'banned', label: 'Banned / Suspended' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        setStatusFilter(option.value as 'all' | 'active' | 'banned');
                        setIsStatusFilterOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
                        statusFilter === option.value
                           ? 'bg-blue-600/20 text-blue-400 font-semibold'
                          : 'text-zinc-300 hover:bg-zinc-800/80 hover:text-white'
                      }`}
                    >
                      <span>{option.label}</span>
                      {statusFilter === option.value && <Check className="w-3.5 h-3.5 text-blue-400" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Role Filter Button + Popup */}
            <div className="relative" ref={roleFilterRef}>
              <button
                type="button"
                onClick={() => {
                  setIsRoleFilterOpen(!isRoleFilterOpen);
                  setIsStatusFilterOpen(false);
                }}
                className="flex items-center justify-between sm:justify-start gap-2 px-3 py-2 rounded-xl bg-[#141417] border border-zinc-800 text-xs font-semibold text-zinc-300 hover:text-white hover:border-zinc-700 transition-colors w-full sm:w-auto"
              >
                <div className="flex items-center gap-2">
                  <Shield className="w-3.5 h-3.5 text-zinc-400" />
                  <span>
                    Role: <span className="text-white font-bold">{
                      roleFilter === 'all' ? 'All' :
                      roleFilter === 'user' ? 'User' :
                      roleFilter === 'creator' ? 'Creator' :
                      roleFilter === 'cofounder' ? 'Co-Founder' :
                      'Moderator'
                    }</span>
                  </span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 transition-transform duration-200 ${isRoleFilterOpen ? 'rotate-180' : ''}`} />
              </button>

              {isRoleFilterOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-[#121216]/95 backdrop-blur-xl border border-zinc-700/80 rounded-xl p-1 shadow-2xl z-50">
                  {[
                    { value: 'all', label: 'All Roles' },
                    { value: 'user', label: 'Regular User' },
                    { value: 'creator', label: 'Creator' },
                    { value: 'cofounder', label: 'Co-Founder' },
                    { value: 'moderator', label: 'Moderator' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        setRoleFilter(option.value);
                        setIsRoleFilterOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
                        roleFilter === option.value
                          ? 'bg-blue-600/20 text-blue-400 font-semibold'
                          : 'text-zinc-300 hover:bg-zinc-800/80 hover:text-white'
                      }`}
                    >
                      <span>{option.label}</span>
                      {roleFilter === option.value && <Check className="w-3.5 h-3.5 text-blue-400" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Reset Filters Button */}
            {(statusFilter !== 'all' || roleFilter !== 'all' || searchQuery.trim()) && (
              <button
                type="button"
                onClick={() => {
                  setStatusFilter('all');
                  setRoleFilter('all');
                  setSearchQuery('');
                }}
                className="px-2.5 py-2 text-xs font-semibold text-zinc-400 hover:text-pink-400 transition-colors flex items-center justify-center gap-1 self-center"
                title="Reset all filters"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}

          </div>
        </div>
        
        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[#141416] text-zinc-400 border-b border-zinc-800/80 text-[11px] uppercase tracking-wider font-bold">
              <tr>
                <th className="px-5 py-3.5">User Identity</th>
                <th className="px-4 py-3.5">Role</th>
                <th className="px-4 py-3.5">Hardware / Device</th>
                <th className="px-4 py-3.5">Watch Analytics</th>
                <th className="px-4 py-3.5">Activity & Presence</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50 text-zinc-300">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-zinc-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="w-6 h-6 animate-spin text-pink-500" />
                      <span>Loading user directory & telemetry...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12">
                    <div className="text-center py-16">
                      <Users className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
                      <p className="text-zinc-400 font-medium">No users found</p>
                      <p className="text-xs text-zinc-500 mt-1">Try adjusting your search or filters</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-zinc-900/40 transition-colors group">
                    
                    {/* 1. User Identity */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div 
                          onClick={() => handleOpenDossier(user)}
                          className="w-10 h-10 rounded-full border border-zinc-800/80 flex items-center justify-center font-bold text-sm text-zinc-200 shrink-0 overflow-hidden shadow-sm cursor-pointer hover:border-pink-500/50 transition-colors"
                        >
                          {user.avatar_url ? (
                            <img 
                              src={user.avatar_url} 
                              alt={user.username} 
                              className="w-full h-full object-cover" 
                              referrerPolicy="no-referrer" 
                            />
                          ) : (
                            <div className={`w-full h-full flex items-center justify-center font-black text-sm bg-gradient-to-br ${getAvatarBg(user.username || 'User')}`}>
                              {user.username ? user.username[0]?.toUpperCase() : 'U'}
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-white flex items-center gap-2">
                            <span 
                              onClick={() => handleOpenDossier(user)}
                              className="hover:text-pink-400 cursor-pointer transition-colors"
                            >
                              {user.username}
                            </span>
                            {user.is_superuser && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                                Owner
                              </span>
                            )}
                            {/* Total Clicks Badge beside Name */}
                            <span className="inline-flex items-center gap-1 text-[11px] font-mono text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-1.5 py-0.5 rounded" title="Total clicks performed by this user">
                              <MousePointer className="w-2.5 h-2.5" />
                              <span>{user.total_clicks || 0}</span>
                            </span>
                          </div>
                          <div className="text-xs text-zinc-500 font-mono mt-0.5 flex items-center gap-2 flex-wrap">
                            <span>{user.email} &bull; #{user.id}</span>
                            {isSuperAdmin && typeof user.uploaded_videos_count === 'number' && user.uploaded_videos_count > 0 && (
                              <span className="text-[10px] text-pink-400 bg-pink-500/10 border border-pink-500/20 px-1.5 py-0.5 rounded font-sans font-bold">
                                {user.uploaded_videos_count} uploads
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* 2. Role */}
                    <td className="px-4 py-3.5">
                      {(() => {
                        if (user.is_superuser) {
                          return (
                            <span className="px-2.5 py-1 rounded-lg text-xs font-bold border bg-amber-500/15 text-amber-400 border-amber-500/30">
                              Super Admin
                            </span>
                          );
                        }
                        const r = (user.role || 'user').toLowerCase();
                        if (user.is_cofounder || r.includes('co-founder') || r.includes('cofounder')) {
                          return (
                            <span className="px-2.5 py-1 rounded-lg text-xs font-bold border bg-purple-500/15 text-purple-400 border-purple-500/30">
                              Co-Founder
                            </span>
                          );
                        }
                        if (r.includes('creator')) {
                          return (
                            <span className="px-2.5 py-1 rounded-lg text-xs font-bold border bg-blue-500/15 text-blue-400 border-blue-500/30">
                              Creator
                            </span>
                          );
                        }
                        if (r.includes('moderator')) {
                          return (
                            <span className="px-2.5 py-1 rounded-lg text-xs font-bold border bg-amber-500/15 text-amber-400 border-amber-500/30">
                              Moderator
                            </span>
                          );
                        }
                        return (
                          <span className="px-2.5 py-1 rounded-lg text-xs font-bold border bg-zinc-800 text-zinc-300 border-zinc-700/80">
                            {user.role || 'User'}
                          </span>
                        );
                      })()}
                    </td>

                    {/* 3. Hardware / Device Name */}
                    <td className="px-4 py-3.5">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-200">
                          {user.device_name?.toLowerCase().includes('phone') || user.device_name?.toLowerCase().includes('android') || user.device_name?.toLowerCase().includes('ios') || user.device_name?.toLowerCase().includes('samsung') ? (
                            <Smartphone className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                          ) : (
                            <Monitor className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          )}
                          {user.device_name ? (
                            <span className="truncate max-w-[200px]" title={user.device_name}>
                              {user.device_name}
                            </span>
                          ) : (
                            <span className="text-zinc-500 italic text-[11px]" title="Awaiting user active session">
                              {user.browser_name || user.os_name ? `${user.browser_name || 'Browser'} (${user.os_name || 'OS'})` : 'Awaiting session'}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-zinc-500 flex items-center gap-1 mt-0.5">
                          <span>{user.browser_name || 'Browser'}</span>
                          <span>&bull;</span>
                          <span>{user.os_name || 'OS'}</span>
                        </div>
                      </div>
                    </td>

                    {/* 4. Watch Analytics */}
                    <td className="px-4 py-3.5">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-white font-mono">
                          <Play className="w-3 h-3 text-pink-500 fill-pink-500 shrink-0" />
                          <span>{user.total_watched_videos || 0} vids</span>
                        </div>
                        <div className="text-[11px] text-zinc-400 flex items-center gap-1 mt-0.5 font-mono">
                          <Clock className="w-3 h-3 text-zinc-500" />
                          <span>{user.formatted_watch_time || '0s'} watch time</span>
                        </div>
                      </div>
                    </td>

                    {/* 5. Activity & Presence */}
                    <td className="px-4 py-3.5">
                      <div className="flex flex-col items-start gap-1">
                        {user.is_online ? (
                          <span 
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.25)]"
                            title={user.session_started_at ? `Session active since: ${formatFullDateTime(user.session_started_at)}` : 'Active online now'}
                          >
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            <span>Online ({user.formatted_online_duration || 'Active now'})</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-zinc-800/80 text-zinc-400 border border-zinc-700/60">
                            <span className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
                            <span>Offline (seen {formatTimeAgo(user.last_active)})</span>
                          </span>
                        )}
                        <span className="text-[10px] text-zinc-500 font-mono">
                          {user.created_at ? new Date(user.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Legacy Member'}
                        </span>
                      </div>
                    </td>

                    {/* 6. Status */}
                    <td className="px-4 py-3.5">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 w-fit ${
                        user.is_active 
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' 
                          : 'bg-red-500/15 text-red-400 border border-red-500/30'
                      }`}>
                        {user.is_active ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Active</span>
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>Banned</span>
                          </>
                        )}
                      </span>
                    </td>

                    {/* 7. Actions Menu */}
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2 relative" data-menu-container>
                        
                        {/* Quick View Bio Data Dossier Button */}
                        <button
                          onClick={() => handleOpenDossier(user)}
                          className="px-2.5 py-1.5 bg-pink-500/10 hover:bg-pink-500/20 text-pink-400 border border-pink-500/20 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5"
                          title="View Full User Bio Data Dossier"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Bio Data</span>
                        </button>

                        {/* 3-Dots Action Button */}
                        <div className="relative">
                          <button 
                            onClick={() => setActiveMenuId(activeMenuId === user.id ? null : user.id)}
                            className="p-2 text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg border border-zinc-800 transition-colors" 
                            title="Manage Options"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {/* Action Dropdown Menu */}
                          {activeMenuId === user.id && (
                            <div className="absolute right-0 top-10 z-30 w-52 bg-[#141416] border border-zinc-700/80 rounded-xl shadow-2xl py-1 text-xs text-left">
                              
                              {/* View Full Bio Data Dossier */}
                              <button
                                onClick={() => {
                                  setActiveMenuId(null);
                                  handleOpenDossier(user);
                                }}
                                className="w-full text-left px-3.5 py-2 hover:bg-pink-950/30 text-pink-400 flex items-center gap-2 font-bold"
                              >
                                <FileText className="w-3.5 h-3.5 text-pink-400" />
                                <span>View Full Bio Data</span>
                              </button>

                              {/* View Location: STRICTLY Super Admin Only */}
                              {isSuperAdmin && (
                                <button
                                  onClick={() => {
                                    setActiveMenuId(null);
                                    handleOpenLocation(user);
                                  }}
                                  className="w-full text-left px-3.5 py-2 hover:bg-zinc-800/80 text-blue-400 flex items-center gap-2 font-semibold"
                                >
                                  <MapPin className="w-3.5 h-3.5" />
                                  <span>View Location (Owner)</span>
                                </button>
                              )}

                              {/* Change Role Option */}
                              <button
                                onClick={() => {
                                  setActiveMenuId(null);
                                  setRoleModalUser(user);
                                  setSelectedRole(user.role || 'User');
                                }}
                                className="w-full text-left px-3.5 py-2 hover:bg-zinc-800/80 text-zinc-200 flex items-center gap-2"
                              >
                                <UserCheck className="w-3.5 h-3.5 text-purple-400" />
                                <span>Change Role</span>
                              </button>

                              {/* Ban / Unban Option */}
                              <button
                                onClick={() => {
                                  setActiveMenuId(null);
                                  handleToggleStatus(user);
                                }}
                                className="w-full text-left px-3.5 py-2 hover:bg-zinc-800/80 text-zinc-300 flex items-center gap-2"
                              >
                                {user.is_active ? (
                                  <>
                                    <UserX className="w-3.5 h-3.5 text-amber-400" />
                                    <span>Suspend / Ban User</span>
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                    <span>Unban User</span>
                                  </>
                                )}
                              </button>

                              {/* Delete User Option */}
                              {!user.is_superuser && (
                                <button
                                  onClick={() => {
                                    setActiveMenuId(null);
                                    setDeletingUser(user);
                                  }}
                                  className="w-full text-left px-3.5 py-2 hover:bg-rose-950/40 text-rose-400 flex items-center gap-2 border-t border-zinc-800/80"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Delete User</span>
                                </button>
                              )}

                            </div>
                          )}
                        </div>

                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>
      )}

      {/* GUEST VISITORS TABLE CARD */}
      {activeTab === 'guests' && (
        <div key="guests-table" className="animate-tab-switch bg-[#111114] border border-zinc-800/80 rounded-2xl shadow-xl overflow-hidden flex flex-col">
          
          {/* Table Filter & Search Bar */}
          <div className="p-3.5 sm:p-4 border-b border-zinc-800/80 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-3 bg-zinc-900/40">
            
            {/* Title and Results Count Badge */}
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>Unregistered Guest Sessions</span>
              </h3>
              <span className="text-xs text-zinc-400 bg-zinc-900 px-3 py-1 rounded-full border border-zinc-800 font-medium">
                Showing <span className="text-white font-mono font-bold">{filteredGuests.length}</span> of <span className="text-white font-mono font-bold">{guests.length}</span> guests
              </span>
            </div>

            {/* Filter Controls: Search, Conversion Status */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full xl:w-auto">
              
              {/* Search Input */}
              <div className="relative flex-1 sm:w-64 md:w-72">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input 
                  type="text" 
                  value={guestSearchQuery}
                  onChange={(e) => setGuestSearchQuery(e.target.value)}
                  placeholder="Search device, IP, cookie ID, city..." 
                  className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl pl-9 pr-9 py-2 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all" 
                />
                {guestSearchQuery && (
                  <button 
                    onClick={() => setGuestSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Conversion Filter Buttons */}
              <div className="flex items-center gap-1 bg-[#141417] p-1 border border-zinc-800 rounded-xl">
                <button
                  onClick={() => setGuestConversionFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    guestConversionFilter === 'all'
                      ? 'bg-zinc-800 text-white'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setGuestConversionFilter('unregistered')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    guestConversionFilter === 'unregistered'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Unregistered
                </button>
                <button
                  onClick={() => setGuestConversionFilter('converted')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    guestConversionFilter === 'converted'
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Converted
                </button>
              </div>

            </div>

          </div>

          {/* Table Container */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-zinc-800/80 bg-zinc-900/60 text-zinc-400 uppercase font-mono tracking-wider text-[10px]">
                  <th className="py-3 px-4 font-bold">Guest / Device Hardware</th>
                  <th className="py-3 px-4 font-bold">Cookie Tracker ID</th>
                  <th className="py-3 px-4 font-bold">Presence & Duration</th>
                  <th className="py-3 px-4 font-bold">Clicks</th>
                  <th className="py-3 px-4 font-bold">Watch Consumption</th>
                  <th className="py-3 px-4 font-bold">IP & Location</th>
                  <th className="py-3 px-4 font-bold">Conversion Lifecycle</th>
                  <th className="py-3 px-5 text-right font-bold">Dossier</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/40 text-zinc-300">
                {loadingGuests ? (
                  <tr>
                    <td colSpan={8} className="py-16 text-center text-zinc-500">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-purple-500" />
                      <span>Loading guest telemetry data...</span>
                    </td>
                  </tr>
                ) : filteredGuests.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-16 text-center text-zinc-500">
                      <Smartphone className="w-10 h-10 mx-auto mb-2 text-zinc-600 opacity-60" />
                      <p className="font-semibold text-zinc-400 text-sm">No guest records found</p>
                      <p className="text-xs text-zinc-600 mt-1">Try clearing your search query or switching filters.</p>
                    </td>
                  </tr>
                ) : (
                  filteredGuests.map((guest) => (
                    <tr 
                      key={guest.id}
                      className="hover:bg-zinc-800/30 transition-colors group"
                    >
                      {/* 1. Device Hardware & Model */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
                            <Smartphone className="w-4 h-4" />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="font-bold text-white text-xs truncate max-w-[190px]">
                              {guest.device_name}
                            </span>
                            <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 mt-0.5">
                              <span>{guest.os_name}</span>
                              <span className="text-zinc-600">•</span>
                              <span>{guest.browser_name}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* 2. Cookie Tracker ID */}
                      <td className="px-4 py-3.5">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-zinc-900 border border-zinc-800 rounded-lg font-mono text-[11px] text-zinc-300">
                          <span className="truncate max-w-[120px]">{guest.cookie_tracker_id}</span>
                          <button
                            onClick={() => copyToClipboard(guest.cookie_tracker_id)}
                            className="text-zinc-500 hover:text-pink-400 transition-colors"
                            title="Copy Cookie Tracker Token"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                      </td>

                      {/* 3. Live Presence & Duration */}
                      <td className="px-4 py-3.5">
                        {guest.is_online ? (
                          <div className="flex flex-col">
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 w-fit">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              <span>Live Now</span>
                            </div>
                            <span className="text-[10px] font-mono text-zinc-400 mt-1">
                              Duration: <span className="text-white font-bold">{guest.formatted_online_duration || '1m'}</span>
                            </span>
                          </div>
                        ) : (
                          <div className="flex flex-col text-[11px]">
                            <span className="text-zinc-400 flex items-center gap-1">
                              <Clock className="w-3 h-3 text-zinc-500" />
                              <span>Seen {formatTimeAgo(guest.last_active)}</span>
                            </span>
                            <span className="text-[10px] text-zinc-500 mt-0.5">
                              {guest.last_active ? new Date(guest.last_active).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Recently'}
                            </span>
                          </div>
                        )}
                      </td>

                      {/* 4. Clicks */}
                      <td className="px-4 py-3.5">
                        <div className="inline-flex items-center gap-1 text-white font-mono font-bold text-xs">
                          <MousePointer className="w-3 h-3 text-pink-500" />
                          <span>{guest.total_clicks || 0}</span>
                        </div>
                      </td>

                      {/* 5. Watch Consumption */}
                      <td className="px-4 py-3.5">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1 font-bold text-white text-xs">
                            <Play className="w-3 h-3 text-rose-500" />
                            <span>{guest.formatted_watch_time || '0s'}</span>
                          </div>
                          <span className="text-[10px] text-zinc-400 mt-0.5">
                            {guest.total_watched_videos || 0} videos watched
                          </span>
                        </div>
                      </td>

                      {/* 6. IP & Location */}
                      <td className="px-4 py-3.5">
                        <div className="flex flex-col text-[11px]">
                          <span className="font-mono text-zinc-200 font-semibold">{guest.ip_address}</span>
                          <span className="text-[10px] text-zinc-400 mt-0.5 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-blue-400" />
                            <span>{guest.city}, {guest.country}</span>
                          </span>
                        </div>
                      </td>

                      {/* 7. Conversion Lifecycle */}
                      <td className="px-4 py-3.5">
                        {guest.is_converted ? (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-purple-500/15 border border-purple-500/30 rounded-lg text-purple-300 text-xs font-bold">
                            <Check className="w-3.5 h-3.5 text-purple-400" />
                            <span>Merged: @{guest.converted_username || `User #${guest.converted_to_user_id}`}</span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-400 text-xs font-semibold">
                            <Shield className="w-3.5 h-3.5" />
                            <span>Unregistered Guest</span>
                          </div>
                        )}
                      </td>

                      {/* 8. Action Dossier Button */}
                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={() => handleOpenGuestDossier(guest.id)}
                          className="px-2.5 py-1.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1.5"
                          title="View Complete Guest Bio Data Dossier"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Guest Dossier</span>
                        </button>
                      </td>

                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          A-TO-Z USER BIO DATA DOSSIER MODAL (Full Security & Activity Audit)
         ───────────────────────────────────────────────────────────── */}
      {dossierUserId && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-[#121216] border border-pink-500/30 text-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-6">
            
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/70">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-pink-500 to-rose-600 flex items-center justify-center text-white shadow-md shadow-pink-900/30">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                    <span>A-to-Z User Bio Data Dossier</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-pink-500/15 text-pink-400 border border-pink-500/30">
                      Security & Activity
                    </span>
                  </h3>
                  <p className="text-xs text-zinc-400">Complete hardware, cookie, watch time and geo-telemetry profile</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setDossierUserId(null);
                  setDossierData(null);
                }}
                className="p-1.5 text-zinc-400 hover:text-white rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {loadingDossier ? (
                <div className="py-16 flex flex-col items-center justify-center gap-3">
                  <RefreshCw className="w-8 h-8 text-pink-500 animate-spin" />
                  <p className="text-xs text-zinc-400 font-medium">Assembling full biometric and activity dossier from database...</p>
                </div>
              ) : dossierError ? (
                <div className="p-4 bg-rose-950/40 border border-rose-800/80 rounded-xl text-xs text-rose-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{dossierError}</span>
                </div>
              ) : dossierData ? (
                <>
                  {/* User Profile Banner Card */}
                  <div className="bg-[#18181d] border border-zinc-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-14 h-14 rounded-2xl border border-zinc-700/80 overflow-hidden shrink-0 shadow-md">
                        {dossierData.avatar_url ? (
                          <img src={dossierData.avatar_url} alt={dossierData.username} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <div className={`w-full h-full flex items-center justify-center font-black text-lg bg-gradient-to-br ${getAvatarBg(dossierData.username)}`}>
                            {dossierData.username[0]?.toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-lg font-black text-white">{dossierData.username}</h4>
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                            {dossierData.role}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-400 font-mono mt-0.5">{dossierData.email}</p>
                        <div className="text-[11px] text-zinc-500 mt-1 flex items-center gap-2">
                          <span>User ID: #{dossierData.user_id}</span>
                          <span>&bull;</span>
                          <span>Account Age: <strong className="text-white font-mono">{dossierData.account_age_days} days</strong></span>
                        </div>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-3 sm:pt-0 border-zinc-800">
                      {dossierData.is_online ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.25)]">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                          <span>Online ({dossierData.formatted_online_duration ? `${dossierData.formatted_online_duration} active` : 'Active now'})</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-zinc-800 text-zinc-400 border border-zinc-700">
                          <span className="w-2 h-2 rounded-full bg-zinc-500" />
                          <span>Last seen: {formatTimeAgo(dossierData.last_active)}</span>
                        </span>
                      )}
                      <span className={`text-[11px] font-bold mt-1.5 ${dossierData.is_active ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {dossierData.is_active ? 'Account Status: Unrestricted' : 'Account Status: Suspended / Banned'}
                      </span>
                    </div>
                  </div>

                  {/* Section 1: Device Hardware & Security Cookie System */}
                  <div className="bg-[#18181d] border border-zinc-800/80 rounded-2xl p-4 space-y-3">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-pink-400 flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5" />
                      <span>Device Fingerprint & Persistent Cookie Security</span>
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      
                      <div className="bg-zinc-900/70 border border-zinc-800 p-3 rounded-xl">
                        <div className="text-zinc-500 font-medium flex items-center gap-1.5 mb-1">
                          <Smartphone className="w-3.5 h-3.5 text-blue-400" />
                          <span>Detected Device Hardware</span>
                        </div>
                        <div className="font-bold text-white text-sm">{dossierData.device_name || 'Awaiting active session'}</div>
                      </div>

                      <div className="bg-zinc-900/70 border border-zinc-800 p-3 rounded-xl">
                        <div className="text-zinc-500 font-medium flex items-center gap-1.5 mb-1">
                          <Monitor className="w-3.5 h-3.5 text-purple-400" />
                          <span>Operating System & Browser</span>
                        </div>
                        <div className="font-bold text-white text-sm">{dossierData.os_name} &bull; {dossierData.browser_name}</div>
                      </div>

                      <div className="bg-zinc-900/70 border border-zinc-800 p-3 rounded-xl sm:col-span-2 flex items-center justify-between">
                        <div>
                          <div className="text-zinc-500 font-medium flex items-center gap-1.5 mb-0.5">
                            <Clock className="w-3.5 h-3.5 text-amber-400" />
                            <span>Persistent 1-Year Tracker Cookie Token</span>
                          </div>
                          <div className="font-mono text-zinc-200 text-xs truncate max-w-sm sm:max-w-md" title={dossierData.cookie_tracker_id}>
                            {dossierData.cookie_tracker_id}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(dossierData.cookie_tracker_id)}
                          className="px-2.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-colors shrink-0"
                        >
                          {copiedCookie ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedCookie ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>

                    </div>
                  </div>

                  {/* Section 2: Video Consumption Analytics & Clicks */}
                  <div className="bg-[#18181d] border border-zinc-800/80 rounded-2xl p-4 space-y-3">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                      <Play className="w-3.5 h-3.5" />
                      <span>Video Consumption & Interaction Metrics</span>
                    </h5>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      
                      <div className="bg-zinc-900/70 border border-zinc-800 p-3 rounded-xl">
                        <div className="text-zinc-500 text-[11px]">Videos Watched</div>
                        <div className="font-mono font-black text-xl text-white mt-0.5">
                          {dossierData.total_watched_videos}
                        </div>
                        <div className="text-[10px] text-zinc-500 mt-0.5">Completed or Viewed</div>
                      </div>

                      <div className="bg-zinc-900/70 border border-zinc-800 p-3 rounded-xl">
                        <div className="text-zinc-500 text-[11px]">Total Watch Time</div>
                        <div className="font-mono font-black text-xl text-pink-400 mt-0.5">
                          {dossierData.formatted_watch_time}
                        </div>
                        <div className="text-[10px] text-zinc-500 mt-0.5">{dossierData.total_watch_seconds} seconds</div>
                      </div>

                      <div className="bg-zinc-900/70 border border-zinc-800 p-3 rounded-xl">
                        <div className="text-zinc-500 text-[11px]">Avg / Video</div>
                        <div className="font-mono font-black text-xl text-emerald-400 mt-0.5">
                          {dossierData.avg_watch_per_video}
                        </div>
                        <div className="text-[10px] text-zinc-500 mt-0.5">Retention rate</div>
                      </div>

                      <div className="bg-zinc-900/70 border border-zinc-800 p-3 rounded-xl">
                        <div className="text-zinc-500 text-[11px]">Total Clicks</div>
                        <div className="font-mono font-black text-xl text-cyan-400 mt-0.5 flex items-center gap-1">
                          <MousePointer className="w-4 h-4 text-cyan-400" />
                          <span>{dossierData.total_clicks}</span>
                        </div>
                        <div className="text-[10px] text-zinc-500 mt-0.5">Interactions log</div>
                      </div>

                    </div>
                  </div>

                  {/* Section 3: Exact Location & Network Telemetry */}
                  <div className="bg-[#18181d] border border-zinc-800/80 rounded-2xl p-4 space-y-3">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>Geo-Location & Network Infrastructure</span>
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      
                      <div className="bg-zinc-900/70 border border-zinc-800 p-3 rounded-xl">
                        <div className="text-zinc-500 font-medium flex items-center gap-1.5 mb-1">
                          <Globe className="w-3.5 h-3.5 text-blue-400" />
                          <span>Public IP Address</span>
                        </div>
                        <div className="font-mono font-bold text-white text-sm">{dossierData.ip}</div>
                      </div>

                      <div className="bg-zinc-900/70 border border-zinc-800 p-3 rounded-xl">
                        <div className="text-zinc-500 font-medium flex items-center gap-1.5 mb-1">
                          <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                          <span>City & Country</span>
                        </div>
                        <div className="font-bold text-white text-sm">{dossierData.city}, {dossierData.country}</div>
                      </div>

                      <div className="bg-zinc-900/70 border border-zinc-800 p-3 rounded-xl">
                        <div className="text-zinc-500 font-medium flex items-center gap-1.5 mb-1">
                          <Wifi className="w-3.5 h-3.5 text-purple-400" />
                          <span>Internet Service Provider (ISP)</span>
                        </div>
                        <div className="font-bold text-white text-xs truncate" title={dossierData.isp}>{dossierData.isp}</div>
                      </div>

                      <div className="bg-zinc-900/70 border border-zinc-800 p-3 rounded-xl">
                        <div className="text-zinc-500 font-medium flex items-center gap-1.5 mb-1">
                          <Calendar className="w-3.5 h-3.5 text-amber-400" />
                          <span>Registration Date</span>
                        </div>
                        <div className="font-bold text-white text-xs">{formatFullDateTime(dossierData.created_at)}</div>
                      </div>

                    </div>

                    {/* Google Maps Link */}
                    {dossierData.maps_url && (
                      <div className="pt-1">
                        <a
                          href={dossierData.maps_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-2.5 px-4 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all"
                        >
                          <MapPin className="w-4 h-4" />
                          <span>Open Coordinates on Google Maps ({dossierData.latitude}, {dossierData.longitude})</span>
                          <ExternalLink className="w-3.5 h-3.5 ml-1" />
                        </a>
                      </div>
                    )}
                  </div>

                </>
              ) : null}

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setDossierUserId(null);
                    setDossierData(null);
                  }}
                  className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 rounded-xl font-semibold text-xs transition-colors"
                >
                  Close Dossier
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          A-TO-Z GUEST VISITOR BIO DATA DOSSIER MODAL
         ───────────────────────────────────────────────────────────── */}
      {dossierGuestId && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-[#121216] border border-purple-500/30 text-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-6">
            
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/70">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-900/30">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                    <span>A-to-Z Guest Bio Data Dossier</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/15 text-purple-400 border border-purple-500/30">
                      Unregistered Visitor Telemetry
                    </span>
                  </h3>
                  <p className="text-xs text-zinc-400">Complete hardware, persistent cookie token, watch seconds & geo-location</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setDossierGuestId(null);
                  setGuestDossierData(null);
                }}
                className="p-1.5 text-zinc-400 hover:text-white rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {loadingGuestDossier ? (
                <div className="py-16 flex flex-col items-center justify-center gap-3">
                  <RefreshCw className="w-8 h-8 text-purple-500 animate-spin" />
                  <p className="text-xs text-zinc-400 font-medium">Retrieving guest telemetry profile from database...</p>
                </div>
              ) : guestDossierError ? (
                <div className="p-4 bg-rose-950/40 border border-rose-800/80 rounded-xl text-xs text-rose-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{guestDossierError}</span>
                </div>
              ) : guestDossierData ? (
                <>
                  {/* Banner Card */}
                  <div className="bg-[#18181d] border border-zinc-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-md">
                        <Smartphone className="w-7 h-7" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-lg font-black text-white">{guestDossierData.device_name}</h4>
                          {guestDossierData.is_online ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              <span>Live ({guestDossierData.formatted_online_duration})</span>
                            </span>
                          ) : (
                            <span className="text-zinc-500 text-[10px] bg-zinc-800 px-2 py-0.5 rounded-md">
                              Seen {formatTimeAgo(guestDossierData.last_active)}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-zinc-400 mt-0.5 font-mono">
                          Guest #{guestDossierData.guest_id} • First Seen {guestDossierData.first_seen_days} days ago
                        </p>
                      </div>
                    </div>

                    {/* Conversion Status Badge */}
                    <div className="self-start sm:self-auto">
                      {guestDossierData.is_converted ? (
                        <div className="px-3 py-1.5 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs font-bold flex items-center gap-1.5">
                          <Check className="w-4 h-4 text-purple-400" />
                          <span>Merged: @{guestDossierData.converted_username || `User #${guestDossierData.converted_to_user_id}`}</span>
                        </div>
                      ) : (
                        <div className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-1.5">
                          <Shield className="w-4 h-4 text-amber-400" />
                          <span>Anonymous Session (Pending Registration)</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Cookie Token Banner */}
                  <div className="bg-[#141418] border border-zinc-800/80 rounded-xl p-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-[11px] font-semibold text-zinc-400 shrink-0">Cookie Token:</span>
                      <code className="text-xs font-mono text-pink-400 truncate bg-pink-950/20 px-2 py-0.5 rounded border border-pink-500/20">
                        {guestDossierData.cookie_tracker_id}
                      </code>
                    </div>
                    <button
                      onClick={() => copyToClipboard(guestDossierData.cookie_tracker_id)}
                      className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 shrink-0"
                    >
                      <Copy className="w-3 h-3" />
                      <span>{copiedCookie ? 'Copied!' : 'Copy'}</span>
                    </button>
                  </div>

                  {/* 4 Telemetry Metrics Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    
                    {/* Device & Hardware */}
                    <div className="bg-[#141418] border border-zinc-800 rounded-xl p-3.5 space-y-2">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                        <Smartphone className="w-3.5 h-3.5 text-purple-400" />
                        <span>Hardware & Environment</span>
                      </div>
                      <div className="text-xs space-y-1.5">
                        <div className="flex justify-between">
                          <span className="text-zinc-400">Device Model:</span>
                          <span className="text-white font-bold">{guestDossierData.device_name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-400">Operating System:</span>
                          <span className="text-white font-mono">{guestDossierData.os_name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-400">Browser Engine:</span>
                          <span className="text-white font-mono">{guestDossierData.browser_name}</span>
                        </div>
                      </div>
                    </div>

                    {/* Engagement & Watch Analytics */}
                    <div className="bg-[#141418] border border-zinc-800 rounded-xl p-3.5 space-y-2">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                        <Play className="w-3.5 h-3.5 text-rose-400" />
                        <span>Video & Click Engagement</span>
                      </div>
                      <div className="text-xs space-y-1.5">
                        <div className="flex justify-between">
                          <span className="text-zinc-400">Total Clicks:</span>
                          <span className="text-white font-mono font-bold">{guestDossierData.total_clicks} clicks</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-400">Total Watch Time:</span>
                          <span className="text-white font-bold text-pink-400">{guestDossierData.formatted_watch_time}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-400">Videos Consumed:</span>
                          <span className="text-white font-mono">{guestDossierData.total_watched_videos} videos</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-400">Avg / Video:</span>
                          <span className="text-zinc-300 font-mono">{guestDossierData.avg_watch_per_video}</span>
                        </div>
                      </div>
                    </div>

                    {/* Network & ISP */}
                    <div className="bg-[#141418] border border-zinc-800 rounded-xl p-3.5 space-y-2">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                        <Wifi className="w-3.5 h-3.5 text-blue-400" />
                        <span>Network & ISP</span>
                      </div>
                      <div className="text-xs space-y-1.5">
                        <div className="flex justify-between">
                          <span className="text-zinc-400">IP Address:</span>
                          <span className="text-white font-mono font-bold">{guestDossierData.ip}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-400">ISP Provider:</span>
                          <span className="text-white truncate max-w-[150px]">{guestDossierData.isp}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-400">Location:</span>
                          <span className="text-white">{guestDossierData.city}, {guestDossierData.country}</span>
                        </div>
                      </div>
                    </div>

                    {/* Session Timeline */}
                    <div className="bg-[#141418] border border-zinc-800 rounded-xl p-3.5 space-y-2">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Session Timeline</span>
                      </div>
                      <div className="text-xs space-y-1.5">
                        <div className="flex justify-between">
                          <span className="text-zinc-400">First Seen:</span>
                          <span className="text-zinc-300">{formatFullDateTime(guestDossierData.first_seen)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-400">Last Active:</span>
                          <span className="text-zinc-300">{formatFullDateTime(guestDossierData.last_active)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-400">Session Started:</span>
                          <span className="text-zinc-300">{formatFullDateTime(guestDossierData.session_started_at)}</span>
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Google Maps External Link */}
                  {guestDossierData.maps_url && (
                    <div className="pt-2">
                      <a
                        href={guestDossierData.maps_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-2.5 px-4 rounded-xl bg-blue-600/15 hover:bg-blue-600/25 border border-blue-500/30 text-blue-400 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                      >
                        <MapPin className="w-4 h-4" />
                        <span>Open Estimated Location on Google Maps</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  )}

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setDossierGuestId(null);
                        setGuestDossierData(null);
                      }}
                      className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 rounded-xl font-semibold text-xs transition-colors"
                    >
                      Close Dossier
                    </button>
                  </div>

                </>
              ) : null}
            </div>

          </div>
        </div>
      )}

      {/* VIEW LOCATION MODAL (SUPER ADMIN / OWNER ONLY) */}
      {locationUser && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#141417] border border-blue-900/50 text-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">User Location & Network Audit</h3>
                  <p className="text-xs text-blue-400 font-medium">Owner Only &bull; Strict Confidentiality</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setLocationUser(null);
                  setLocationData(null);
                }}
                className="p-1.5 text-zinc-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {loadingLocation ? (
                <div className="py-12 flex flex-col items-center justify-center gap-3">
                  <RefreshCw className="w-7 h-7 text-blue-400 animate-spin" />
                  <p className="text-xs text-zinc-400 font-medium">Querying IP geolocation & network telemetry...</p>
                </div>
              ) : locationError ? (
                <div className="p-4 bg-rose-950/40 border border-rose-800/80 rounded-xl text-xs text-rose-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{locationError}</span>
                </div>
              ) : locationData ? (
                <>
                  {/* User Profile Snippet */}
                  <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-3.5 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-white text-sm">{locationData.username}</div>
                      <div className="text-xs text-zinc-400 font-mono mt-0.5">{locationData.email}</div>
                    </div>
                    <span className="px-2.5 py-1 rounded bg-zinc-800 text-zinc-300 text-xs font-semibold">
                      ID: #{locationData.user_id}
                    </span>
                  </div>

                  {/* Geolocation Details Grid */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    
                    <div className="bg-zinc-900/60 border border-zinc-800/80 p-3.5 rounded-xl space-y-1">
                      <div className="text-zinc-500 flex items-center gap-1.5 font-medium">
                        <Globe className="w-3.5 h-3.5 text-blue-400" />
                        <span>IP Address</span>
                      </div>
                      <div className="font-mono font-bold text-white text-sm">{locationData.ip}</div>
                    </div>

                    <div className="bg-zinc-900/60 border border-zinc-800/80 p-3.5 rounded-xl space-y-1">
                      <div className="text-zinc-500 flex items-center gap-1.5 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Location</span>
                      </div>
                      <div className="font-bold text-white text-sm truncate">
                        {locationData.city}, {locationData.country}
                      </div>
                    </div>

                    <div className="bg-zinc-900/60 border border-zinc-800/80 p-3.5 rounded-xl space-y-1">
                      <div className="text-zinc-500 flex items-center gap-1.5 font-medium">
                        <Wifi className="w-3.5 h-3.5 text-purple-400" />
                        <span>ISP / Network</span>
                      </div>
                      <div className="font-bold text-white text-xs truncate" title={locationData.isp}>
                        {locationData.isp}
                      </div>
                    </div>

                    <div className="bg-zinc-900/60 border border-zinc-800/80 p-3.5 rounded-xl space-y-1">
                      <div className="text-zinc-500 flex items-center gap-1.5 font-medium">
                        <Monitor className="w-3.5 h-3.5 text-amber-400" />
                        <span>Client Device</span>
                      </div>
                      <div className="font-bold text-white text-xs truncate" title={locationData.device}>
                        {locationData.device}
                      </div>
                    </div>

                  </div>

                  {/* Map Coordinate Link */}
                  {locationData.maps_url && (
                    <div className="pt-2">
                      <a
                        href={locationData.maps_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-900/30"
                      >
                        <MapPin className="w-4 h-4" />
                        <span>Open Coordinates on Google Maps ({locationData.latitude}, {locationData.longitude})</span>
                        <ExternalLink className="w-3.5 h-3.5 ml-1" />
                      </a>
                    </div>
                  )}
                </>
              ) : null}

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setLocationUser(null);
                    setLocationData(null);
                  }}
                  className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 rounded-xl font-semibold text-xs transition-colors"
                >
                  Close Audit Window
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* CHANGE ROLE MODAL */}
      {roleModalUser && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#141417] border border-zinc-800 text-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/60">
              <div>
                <h3 className="text-base font-bold text-white">Change User Role</h3>
                <p className="text-xs text-zinc-400 mt-0.5 font-mono">{roleModalUser.username} (#{roleModalUser.id})</p>
              </div>
              <button
                onClick={() => setRoleModalUser(null)}
                className="p-1.5 text-zinc-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRole} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">
                  Select Role
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl py-2.5 px-3.5 text-sm text-white focus:outline-none focus:border-pink-500 transition-colors"
                >
                  <option value="USER">User (Standard Platform Member)</option>
                  <option value="CREATOR">Creator (Video Uploader & Channel Owner)</option>
                  <option value="CO_FOUNDER">Co-Founder (Admin Portal Access)</option>
                  <option value="MODERATOR">Content Moderator</option>
                </select>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setRoleModalUser(null)}
                  className="flex-1 px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 rounded-xl font-semibold text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingRole}
                  className="flex-1 px-4 py-2.5 bg-pink-600 hover:bg-pink-500 text-white rounded-xl font-bold text-xs transition-all shadow-lg shadow-pink-900/30 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isUpdatingRole ? 'Updating...' : 'Save Role'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CUSTOM DELETE USER CONFIRMATION MODAL */}
      {deletingUser && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#141417] border border-rose-900/70 text-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="w-14 h-14 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4 text-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.2)]">
                <AlertTriangle className="w-7 h-7" />
              </div>

              <h3 className="text-xl font-black text-white">Permanently Delete User?</h3>
              <p className="text-xs text-zinc-400 mt-1.5 mb-5 leading-relaxed">
                Are you sure you want to delete <strong className="text-white">{deletingUser.username}</strong> ({deletingUser.email})? This action cannot be undone. All user history and records will be deleted from the database.
              </p>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setDeletingUser(null)}
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
                  {isDeleting ? 'Deleting...' : 'Yes, Delete User'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
