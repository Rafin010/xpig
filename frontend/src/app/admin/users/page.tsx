'use client';
import { useState, useEffect } from 'react';
import { Search, Filter, MoreVertical, ShieldAlert, CheckCircle2, AlertTriangle, UserX, Users, User, Ghost, TrendingUp } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const COLORS = ['#3b82f6', '#ec4899'];

interface UserData {
  id: number | string;
  username: string;
  email: string;
  is_active: boolean;
  role?: string;
  created_at?: string;
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('https://xpig.onrender.com/api/v1/users/')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setUsers(data);
        } else if (data && Array.isArray(data.items)) {
          setUsers(data.items);
        } else {
          setUsers([]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch users", err);
        setLoading(false);
      });
  }, []);

  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.is_active).length;
  const bannedUsers = totalUsers - activeUsers;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-zinc-800/50 pb-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">User Analytics & Tracking</h1>
          <p className="text-zinc-400 mt-1">Track traffic distribution between Registered Users and Random (Guest) Users.</p>
        </div>
      </div>

      {/* Analytics Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* KPI Cards */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-[#111] border border-zinc-800/50 p-6 rounded-2xl flex flex-col justify-center shadow-xl">
            <div className="flex items-center gap-2 text-zinc-400 mb-2">
              <Users className="w-5 h-5 text-purple-500" /> <span className="font-semibold text-sm">Total Traffic (30d)</span>
            </div>
            <div className="text-4xl font-black text-white">{totalUsers}</div>
            <div className="text-xs text-green-400 mt-2 flex items-center gap-1"><TrendingUp className="w-3 h-3"/> Live Data</div>
          </div>
          
          <div className="bg-[#111] border border-zinc-800/50 p-6 rounded-2xl flex flex-col justify-center shadow-xl relative overflow-hidden">
            <div className="absolute right-0 bottom-0 opacity-5 scale-150 -mr-4 -mb-4 pointer-events-none">
              <Ghost className="w-32 h-32 text-blue-500" />
            </div>
            <div className="flex items-center gap-2 text-zinc-400 mb-2 z-10">
              <Ghost className="w-5 h-5 text-blue-500" /> <span className="font-semibold text-sm">Random Users</span>
            </div>
            <div className="text-4xl font-black text-white z-10">0</div>
            <div className="text-xs text-zinc-500 mt-2 z-10">Unregistered Guest Traffic</div>
          </div>

          <div className="bg-[#111] border border-zinc-800/50 p-6 rounded-2xl flex flex-col justify-center shadow-xl relative overflow-hidden">
            <div className="absolute right-0 bottom-0 opacity-5 scale-150 -mr-4 -mb-4 pointer-events-none">
              <User className="w-32 h-32 text-pink-500" />
            </div>
            <div className="flex items-center gap-2 text-zinc-400 mb-2 z-10">
              <User className="w-5 h-5 text-pink-500" /> <span className="font-semibold text-sm">Registered Users</span>
            </div>
            <div className="text-4xl font-black text-white z-10">{totalUsers}</div>
            <div className="text-xs text-zinc-500 mt-2 z-10">Logged-in Accounts</div>
          </div>
        </div>

        {/* Traffic Distribution Chart */}
        <div className="bg-[#111] border border-zinc-800/50 p-6 rounded-2xl shadow-xl flex flex-col">
          <h3 className="text-lg font-bold text-white mb-2">Traffic Distribution</h3>
          <div className="h-[200px] w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[]}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  <Cell fill={COLORS[0]} />
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}
                  itemStyle={{ fontWeight: 'bold', color: 'white' }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-[#111] border border-zinc-800/50 rounded-2xl shadow-xl overflow-hidden">
        <div className="p-6 border-b border-zinc-800/50 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex gap-4 items-center w-full sm:w-auto">
            <h3 className="text-xl font-bold text-white mr-4">Registered Accounts</h3>
            <div className="flex items-center gap-2 text-sm text-zinc-400 bg-[#1a1a1a] px-3 py-1.5 rounded-lg border border-zinc-800">
              <span className="w-2 h-2 rounded-full bg-green-500"></span> {activeUsers} Active
            </div>
            <div className="flex items-center gap-2 text-sm text-zinc-400 bg-[#1a1a1a] px-3 py-1.5 rounded-lg border border-zinc-800">
              <span className="w-2 h-2 rounded-full bg-red-500"></span> {bannedUsers} Banned
            </div>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input type="text" placeholder="Search accounts..." className="w-full bg-[#1a1a1a] border border-zinc-800 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-pink-500" />
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[#161616] text-zinc-400">
              <tr>
                <th className="px-6 py-4 font-semibold">User Details</th>
                <th className="px-6 py-4 font-semibold">Role</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Joined</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50 text-zinc-300">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-4 text-center">Loading users...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-4 text-center">No users found.</td></tr>
              ) : users.map(user => (
                <tr key={user.id} className="hover:bg-[#1a1a1a] transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-white">{user.username}</div>
                    <div className="text-xs text-zinc-500 mt-0.5">{user.email} (ID: {user.id})</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded text-xs font-bold bg-zinc-800 text-zinc-400">
                      {user.role || 'User'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold flex items-center gap-1 w-fit ${
                      user.is_active ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-500'
                    }`}>
                      {user.is_active ? <CheckCircle2 className="w-3 h-3"/> : <AlertTriangle className="w-3 h-3" />}
                      {user.is_active ? 'Active' : 'Banned'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-zinc-500">{user.created_at || 'Unknown'}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 text-zinc-500 hover:text-white transition-colors bg-[#222] rounded-lg border border-zinc-700" title="Manage User">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      {user.is_active ? (
                        <button className="p-2 text-zinc-500 hover:text-red-500 transition-colors bg-[#222] rounded-lg border border-zinc-700" title="Ban User">
                          <UserX className="w-4 h-4" />
                        </button>
                      ) : (
                        <button className="p-2 text-zinc-500 hover:text-green-500 transition-colors bg-[#222] rounded-lg border border-zinc-700" title="Unban User">
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
