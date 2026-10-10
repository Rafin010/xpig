'use client';
import { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, CheckCircle2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useGoogleLogin } from '@react-oauth/google';

export default function UploadPage() {
  const { user, isAuthenticated, isInitializing, login } = useAuth();
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  
  const videoInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        const userInfo = await res.json();
        
        const backendRes = await fetch('https://xpig.onrender.com/api/v1/auth/google', {
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

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoFile || !title) return;
    
    setIsUploading(true);
    setUploadStatus('idle');

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("file", videoFile);

      const res = await fetch("http://localhost:8000/api/v1/videos/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        setUploadStatus('success');
      } else {
        setUploadStatus('error');
      }
    } catch (err) {
      console.error(err);
      setUploadStatus('error');
    } finally {
      setIsUploading(false);
    }
  };

  if (isInitializing) return null;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black pt-20 flex flex-col items-center justify-center text-center px-4">
        <div className="bg-zinc-950 border border-zinc-800 p-8 md:p-12 rounded-3xl shadow-2xl max-w-lg w-full">
          <div className="w-20 h-20 bg-rose-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <UploadCloud className="w-10 h-10 text-rose-500" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">Upload Videos</h1>
          <p className="text-zinc-400 mb-8">
            You need to be logged in to upload videos. Sign up to start sharing your content with the world.
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

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-4 md:p-8 flex justify-center">
      <div className="max-w-3xl w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Upload Video</h1>
          <p className="text-zinc-400">Share your premium content with the world.</p>
        </div>

        {uploadStatus === 'success' ? (
          <div className="bg-[#111] border border-green-500/30 rounded-2xl p-10 flex flex-col items-center text-center shadow-xl shadow-green-900/10">
            <CheckCircle2 className="w-20 h-20 text-green-500 mb-6" />
            <h2 className="text-2xl font-bold text-white mb-3">Upload Successful!</h2>
            <p className="text-zinc-400 mb-8 max-w-md">Your video has been uploaded and is currently processing. It will appear on your profile once it's ready.</p>
            <div className="flex gap-4">
              <Link href="/profile" className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-full font-medium transition-colors">
                Go to Profile
              </Link>
              <button 
                onClick={() => {
                  setUploadStatus('idle');
                  setVideoFile(null);
                  setThumbnailFile(null);
                  setTitle('');
                  setDescription('');
                }}
                className="px-6 py-3 bg-pink-500 hover:bg-pink-400 text-white rounded-full font-bold transition-colors"
              >
                Upload Another
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleUpload} className="bg-[#111] border border-zinc-800 rounded-2xl p-6 md:p-10 shadow-xl">
            {uploadStatus === 'error' && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3 text-red-500">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p className="text-sm">Something went wrong while uploading. Please try again.</p>
              </div>
            )}

            <div 
              className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-colors mb-8 ${
                videoFile ? 'border-pink-500 bg-pink-500/5' : 'border-zinc-700 hover:border-zinc-500 bg-zinc-900/50'
              }`}
              onClick={() => videoInputRef.current?.click()}
            >
              <input 
                type="file" 
                ref={videoInputRef}
                accept="video/*" 
                className="hidden" 
                onChange={(e) => e.target.files && setVideoFile(e.target.files[0])}
              />
              <UploadCloud className={`w-16 h-16 mb-4 ${videoFile ? 'text-pink-500' : 'text-zinc-600'}`} />
              <h3 className="text-lg font-bold text-white mb-1">
                {videoFile ? videoFile.name : 'Select Video File'}
              </h3>
              <p className="text-sm text-zinc-500">
                {videoFile ? `${(videoFile.size / (1024 * 1024)).toFixed(2)} MB` : 'MP4, MKV, or WebM up to 2GB'}
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Video Title <span className="text-pink-500">*</span></label>
                <input 
                  type="text" 
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter an exciting title..."
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-pink-500 rounded-lg px-4 py-3 text-white outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Description</label>
                <textarea 
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell your audience about this video..."
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-pink-500 rounded-lg px-4 py-3 text-white outline-none transition-colors resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Custom Thumbnail (Optional)</label>
                <div className="flex items-center gap-4">
                  <div 
                    onClick={() => thumbnailInputRef.current?.click()}
                    className="w-40 h-24 bg-zinc-900 border border-zinc-800 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-zinc-600 transition-colors shrink-0 overflow-hidden relative"
                  >
                    <input 
                      type="file" 
                      ref={thumbnailInputRef}
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => e.target.files && setThumbnailFile(e.target.files[0])}
                    />
                    {thumbnailFile ? (
                      <img src={URL.createObjectURL(thumbnailFile)} alt="Thumb" className="w-full h-full object-cover" />
                    ) : (
                      <>
                        <ImageIcon className="w-6 h-6 text-zinc-600 mb-1" />
                        <span className="text-xs text-zinc-500">Upload Image</span>
                      </>
                    )}
                  </div>
                  <div className="text-xs text-zinc-500">
                    <p>A good thumbnail stands out and draws viewers' attention.</p>
                    <p className="mt-1">Recommended size: 1280x720 (16:9)</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-10 flex justify-end gap-4 border-t border-zinc-800 pt-6">
              <button 
                type="button" 
                className="px-6 py-3 text-zinc-400 hover:text-white font-medium transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={!videoFile || !title || isUploading}
                className="px-8 py-3 bg-pink-500 hover:bg-pink-400 disabled:bg-zinc-800 disabled:text-zinc-500 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors flex items-center gap-2"
              >
                {isUploading ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                    Uploading...
                  </>
                ) : (
                  'Publish Video'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
