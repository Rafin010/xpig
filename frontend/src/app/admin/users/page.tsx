'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
  ShieldAlert,
  Globe,
  Wifi,
  Monitor,
  Clock,
  X,
  RefreshCw,
  Shield
} from 'lucide-react';

interface UserData {
  id: number | string;
  username: string;
  email: string;
  is_active: boolean;
  role?: string;
  created_at?: string;
  last_active?: string;
  ip_address?: string;
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

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://xpig.onrender.com';

export default function UserManagementPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Super Admin Check (Only Super Admin can view Location)
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

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const role = localStorage.getItem('xpig_admin_role');
      setIsSuperAdmin(role === 'superuser');
    }
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
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
      console.error('Failed to fetch users:', err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filtered Users
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;
    const q = searchQuery.toLowerCase().trim();
    return users.filter(u => 
      (u.username || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q) ||
      String(u.id).includes(q) ||
      (u.role || '').toLowerCase().includes(q)
    );
  }, [users, searchQuery]);

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

  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.is_active).length;
  const bannedUsers = totalUsers - activeUsers;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-24">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-full text-xs font-semibold text-zinc-300 mb-2">
            <Shield className="w-3.5 h-3.5 text-blue-400" />
            <span>Account Security & User Management</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <Users className="w-8 h-8 text-pink-500" />
            User Directory & Access Control
          </h1>
          <p className="text-zinc-400 mt-1">
            Manage user accounts, assign roles, enforce suspensions, and inspect geo-location audit logs.
          </p>
        </div>

        <button
          onClick={fetchUsers}
          disabled={loading}
          className="self-start sm:self-auto px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-pink-500' : ''}`} />
          <span>Refresh Directory</span>
        </button>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-[#111113] border border-zinc-800/80 p-5 rounded-2xl shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="font-semibold text-xs tracking-wider uppercase text-zinc-400">Total Registered</span>
            <Users className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-3xl font-black text-white">{totalUsers}</div>
          <div className="text-xs text-emerald-400 mt-2 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> Live Database Records
          </div>
        </div>

        <div className="bg-[#111113] border border-zinc-800/80 p-5 rounded-2xl shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="font-semibold text-xs tracking-wider uppercase text-zinc-400">Active Accounts</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-white">{activeUsers}</div>
          <div className="text-xs text-zinc-500 mt-2">Unrestricted Login Status</div>
        </div>

        <div className="bg-[#111113] border border-zinc-800/80 p-5 rounded-2xl shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="font-semibold text-xs tracking-wider uppercase text-zinc-400">Banned / Suspended</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-3xl font-black text-white">{bannedUsers}</div>
          <div className="text-xs text-zinc-500 mt-2">Access Revoked</div>
        </div>
      </div>

      {/* Main Users Table Card */}
      <div className="bg-[#111113] border border-zinc-800/80 rounded-2xl shadow-xl overflow-hidden flex flex-col">
        
        {/* Table Filter & Search Bar */}
        <div className="p-5 border-b border-zinc-800/80 flex flex-col sm:flex-row justify-between items-center gap-4 bg-zinc-900/40">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span>All Accounts</span>
              <span className="px-2.5 py-0.5 rounded-full bg-pink-500/15 border border-pink-500/30 text-pink-400 text-xs font-mono font-bold">
                {filteredUsers.length}
              </span>
            </h3>
            {searchQuery && (
              <span className="text-xs text-zinc-400">
                Filtered from {totalUsers} total
              </span>
            )}
          </div>

          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by username, email, ID..." 
              className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl pl-9 pr-9 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all" 
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
        </div>
        
        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[#141416] text-zinc-400 border-b border-zinc-800/80">
              <tr>
                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">User Details</th>
                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Assigned Role</th>
                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Registered</th>
                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50 text-zinc-300">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="w-6 h-6 animate-spin text-pink-500" />
                      <span>Loading user directory...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                    No users found matching your search.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-zinc-900/40 transition-colors group">
                    
                    {/* User Details */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center font-bold text-sm text-zinc-200">
                          {user.username[0]?.toUpperCase() || 'U'}
                        </div>
                        <div>
                          <div className="font-bold text-white flex items-center gap-2">
                            <span>{user.username}</span>
                            {user.is_superuser && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                                Owner
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-zinc-500 font-mono mt-0.5">
                            {user.email} &bull; ID: #{user.id}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${
                        user.is_superuser 
                          ? 'bg-amber-500/15 text-amber-400 border-amber-500/30' 
                          : user.is_cofounder 
                          ? 'bg-purple-500/15 text-purple-400 border-purple-500/30'
                          : 'bg-zinc-800 text-zinc-300 border-zinc-700'
                      }`}>
                        {user.role || 'User'}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-bold border flex items-center gap-1.5 w-fit ${
                        user.is_active 
                          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' 
                          : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                      }`}>
                        {user.is_active ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" /> Active
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="w-3.5 h-3.5" /> Banned
                          </>
                        )}
                      </span>
                    </td>

                    {/* Joined Date */}
                    <td className="px-6 py-4 text-xs text-zinc-400">
                      {user.created_at ? (
                        new Date(user.created_at).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })
                      ) : (
                        'Legacy Member'
                      )}
                    </td>

                    {/* Actions Menu */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 relative">
                        
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
                            <div className="absolute right-0 top-10 z-30 w-48 bg-[#141416] border border-zinc-700/80 rounded-xl shadow-2xl py-1 text-xs">
                              
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
                                <UserCheck className="w-3.5 h-3.5 text-pink-400" />
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
