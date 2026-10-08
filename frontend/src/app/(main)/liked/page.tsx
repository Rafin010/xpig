'use client';
import { ThumbsUp, Lock } from 'lucide-react';

import { useAuth } from '@/context/AuthContext';

export default function LikedVideosPage() {
  const { isAuthenticated, isInitializing } = useAuth();

  if (isInitializing) return null;

  if (!isAuthenticated) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4">
        <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mb-6">
          <ThumbsUp className="w-10 h-10 text-zinc-500" />
        </div>
        <h1 className="text-3xl font-black text-white mb-3">Liked Videos Locked</h1>
        <p className="text-zinc-400 max-w-md mb-8">
          You need an account to like videos and save them to your personal playlist. Sign in to keep track of your favorite content.
        </p>
        <button className="px-8 py-3.5 bg-pink-600 hover:bg-pink-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-pink-900/20">
          Create Free Account
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white p-8">
      <h1 className="text-2xl font-bold">Liked Videos</h1>
    </div>
  );
}
