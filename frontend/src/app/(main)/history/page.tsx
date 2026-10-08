'use client';
import { History, Lock } from 'lucide-react';

import { useAuth } from '@/context/AuthContext';

export default function HistoryPage() {
  const { isAuthenticated, isInitializing } = useAuth();

  if (isInitializing) return null;

  if (!isAuthenticated) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4">
        <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mb-6">
          <History className="w-10 h-10 text-zinc-500" />
        </div>
        <h1 className="text-3xl font-black text-white mb-3">Watch History Locked</h1>
        <p className="text-zinc-400 max-w-md mb-8">
          Guests cannot save their watch history. Please log in to securely save and manage your watch history across all your devices.
        </p>
        <button className="px-8 py-3.5 bg-pink-600 hover:bg-pink-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-pink-900/20">
          Sign In to Access
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white p-8">
      <h1 className="text-2xl font-bold">History</h1>
    </div>
  );
}
