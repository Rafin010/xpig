'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function VideoUploadRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/videos');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[50vh] text-zinc-400">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-sm">Redirecting to Video Moderation & Upload Queue...</p>
      </div>
    </div>
  );
}
