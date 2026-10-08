'use client';
import { BarChart3, Users, Play, DollarSign, ArrowUpRight, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useGoogleLogin } from '@react-oauth/google';
import { useState, useEffect } from 'react';

export default function CreatorDashboard() {
  const { user, isAuthenticated, isInitializing, login } = useAuth();
  const [videos, setVideos] = useState<any[]>([]);

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        const userInfo = await res.json();
        
        const backendRes = await fetch('http://127.0.0.1:8000/api/v1/auth/google', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: userInfo.email, name: userInfo.name, google_id: userInfo.sub, picture: userInfo.picture })
        });
        const backendUser = await backendRes.json();

        login({
          id: backendUser.id,
          name: userInfo.name,
          email: userInfo.email,
          picture: userInfo.picture,
          sub: userInfo.sub,
          is_superuser: backendUser.is_superuser
        });
      } catch (err) {
        console.error("Login failed", err);
      }
    },
  });

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      // Fetch creator's real videos
      fetch('http://127.0.0.1:8000/api/v1/videos/')
        .then(res => res.json())
        .then(data => {
          const myVideos = (data.items || data).filter((v: any) => v.creator_id === user.id);
          setVideos(myVideos);
        })
        .catch(console.error);
    }
  }, [isAuthenticated, user?.id]);

  if (isInitializing) return null;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black pt-20 flex flex-col items-center justify-center text-center px-4">
        <div className="bg-zinc-950 border border-zinc-800 p-8 md:p-12 rounded-3xl shadow-2xl max-w-lg w-full">
          <div className="w-20 h-20 bg-rose-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <BarChart3 className="w-10 h-10 text-rose-500" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">Start Your Creator Journey</h1>
          <p className="text-zinc-400 mb-8">
            Upload your videos, track your analytics, and start building your audience. Sign up to access your creator dashboard.
          </p>
          <button 
            onClick={() => googleLogin()}
            className="w-full bg-white text-black font-bold py-3 px-6 rounded-full hover:bg-zinc-200 transition-colors flex items-center justify-center gap-3"
          >
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
            Continue with Google
          </button>
        </div>
      </div>
    );
  }

  const totalViews = videos.reduce((sum, v) => sum + (v.views || 0), 0);
  const stats = [
    { label: "Total Views", value: totalViews.toString(), icon: Play, change: "0%" },
    { label: "Followers", value: "0", icon: Users, change: "0%" },
    { label: "Engagement", value: "0%", icon: TrendingUp, change: "0%" },
    { label: "Est. Revenue", value: "$0", icon: DollarSign, change: "0%" },
  ];

  return (
    <div className="min-h-screen bg-black pt-20 px-4 md:px-12 text-white pb-20">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-wrap items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold">Creator Dashboard</h1>
            <p className="text-zinc-400 mt-1">Welcome back, {user?.name}. Here's how your content is performing.</p>
          </div>
          <Link 
            href="/upload"
            className="px-6 py-2.5 bg-rose-600 hover:bg-rose-500 rounded-full font-medium transition-colors"
          >
            Upload New Video
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 hover:border-zinc-700 transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-zinc-900 rounded-lg">
                    <Icon className="w-5 h-5 text-rose-500" />
                  </div>
                  <span className="flex items-center text-xs font-medium text-zinc-500 bg-zinc-900 px-2 py-1 rounded-full">
                    <ArrowUpRight className="w-3 h-3 mr-1" /> {stat.change}
                  </span>
                </div>
                <h3 className="text-zinc-400 text-sm font-medium mb-1">{stat.label}</h3>
                <p className="text-3xl font-bold">{stat.value}</p>
              </div>
            );
          })}
        </div>

        {/* Content Management Section */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-rose-500" />
              Recent Content
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            {videos.length === 0 ? (
              <div className="p-12 text-center text-zinc-500">
                <p>You haven't uploaded any videos yet.</p>
                <Link href="/upload" className="text-rose-500 mt-2 inline-block font-medium">Upload your first video</Link>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-900/50 text-zinc-400 text-sm">
                    <th className="p-4 font-medium">Video</th>
                    <th className="p-4 font-medium">Date</th>
                    <th className="p-4 font-medium">Status</th>
                    <th className="p-4 font-medium">Views</th>
                    <th className="p-4 font-medium">Earnings</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {videos.map(video => (
                    <tr key={video.id} className="hover:bg-zinc-900/30 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {video.thumbnail_url ? (
                            <img src={video.thumbnail_url} alt="" className="w-12 h-8 object-cover rounded" />
                          ) : (
                            <div className="w-12 h-8 bg-zinc-800 rounded flex-shrink-0"></div>
                          )}
                          <span className="font-medium truncate max-w-[200px]">{video.title}</span>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-zinc-400">
                        {video.created_at ? new Date(video.created_at).toLocaleDateString() : 'Just now'}
                      </td>
                      <td className="p-4">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                          video.status === 'PUBLISHED' 
                            ? 'bg-green-500/10 text-green-500' 
                            : 'bg-yellow-500/10 text-yellow-500'
                        }`}>
                          {video.status || 'PENDING'}
                        </span>
                      </td>
                      <td className="p-4 text-sm">{video.views || 0}</td>
                      <td className="p-4 text-sm font-medium">$0</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
