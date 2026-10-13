'use client';
import { useState, useRef } from 'react';
import { 
  UploadCloud, 
  Image as ImageIcon, 
  CheckCircle2, 
  AlertCircle, 
  Video as VideoIcon, 
  Sparkles, 
  X, 
  Film,
  Camera,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { useGoogleLogin } from '@react-oauth/google';

const POPULAR_TAGS = ['#deshi', '#viral', '#exclusive', '#trending', '#bengali', '#hd'];
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://xpig.onrender.com';

export default function UploadPage() {
  const { user, isAuthenticated, isInitializing, login } = useAuth();
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreviewUrl, setThumbnailPreviewUrl] = useState<string | null>(null);
  const [autoThumbnailFile, setAutoThumbnailFile] = useState<File | null>(null);
  const [autoThumbnailPreviewUrl, setAutoThumbnailPreviewUrl] = useState<string | null>(null);
  const [isExtractingAutoThumbnail, setIsExtractingAutoThumbnail] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  
  const videoInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  // Client-Side Canvas 5-Second Frame Auto Extractor
  const extractAutoThumbnail = (videoFile: File): Promise<{ file: File; previewUrl: string } | null> => {
    return new Promise((resolve) => {
      try {
        const video = document.createElement('video');
        video.preload = 'auto';
        video.muted = true;
        video.playsInline = true;
        const objectUrl = URL.createObjectURL(videoFile);
        video.src = objectUrl;

        let resolved = false;
        const cleanup = () => {
          try {
            video.pause();
            video.src = '';
            video.load();
          } catch {}
          URL.revokeObjectURL(objectUrl);
          video.remove();
        };

        const doResolve = (res: { file: File; previewUrl: string } | null) => {
          if (resolved) return;
          resolved = true;
          cleanup();
          resolve(res);
        };

        const timer = setTimeout(() => doResolve(null), 8500);

        let seekTriggered = false;
        const triggerSeek = () => {
          if (seekTriggered) return;
          seekTriggered = true;
          const duration = video.duration || 0;
          const targetSec = duration > 5 ? 5 : Math.max(0.5, duration * 0.3);
          video.currentTime = targetSec;
        };

        video.onloadedmetadata = triggerSeek;
        video.onloadeddata = triggerSeek;
        video.oncanplay = triggerSeek;

        video.onseeked = () => {
          clearTimeout(timer);
          try {
            const canvas = document.createElement('canvas');
            const w = video.videoWidth || 1280;
            const h = video.videoHeight || 720;
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
              doResolve(null);
              return;
            }
            ctx.drawImage(video, 0, 0, w, h);
            canvas.toBlob((blob) => {
              if (!blob) {
                doResolve(null);
                return;
              }
              const thumbFile = new File([blob], `thumb_5s_${Date.now()}.jpg`, { type: 'image/jpeg' });
              const preview = URL.createObjectURL(blob);
              doResolve({ file: thumbFile, previewUrl: preview });
            }, 'image/jpeg', 0.88);
          } catch {
            doResolve(null);
          }
        };

        video.onerror = () => {
          clearTimeout(timer);
          doResolve(null);
        };
      } catch {
        resolve(null);
      }
    });
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        const userInfo = await res.json();
        
        const backendRes = await fetch(`${API_BASE}/api/v1/auth/google`, {
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
          is_superuser: backendUser.is_superuser,
          is_cofounder: backendUser.is_cofounder
        });
      } catch (err) {
        console.error("Login failed", err);
      }
    },
  });

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setVideoFile(file);
      setVideoPreviewUrl(URL.createObjectURL(file));
      if (!title) {
        // Auto-fill title from clean filename
        const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
        setTitle(cleanName);
      }

      // Auto-extract 5-second video frame as default thumbnail
      setIsExtractingAutoThumbnail(true);
      if (autoThumbnailPreviewUrl) URL.revokeObjectURL(autoThumbnailPreviewUrl);
      setAutoThumbnailPreviewUrl(null);
      setAutoThumbnailFile(null);

      extractAutoThumbnail(file).then((result) => {
        setIsExtractingAutoThumbnail(false);
        if (result) {
          setAutoThumbnailFile(result.file);
          setAutoThumbnailPreviewUrl(result.previewUrl);
        }
      });
    }
  };

  const handleThumbnailSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setThumbnailFile(file);
      setThumbnailPreviewUrl(URL.createObjectURL(file));
    }
  };

  const addTag = (tag: string) => {
    if (!description.includes(tag)) {
      setDescription(prev => (prev ? `${prev} ${tag}` : tag));
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoFile || !title.trim()) return;
    
    setIsUploading(true);
    setUploadProgress(10);
    setUploadStatus('idle');
    setErrorMessage('');

    try {
      // Guaranteed thumbnail resolution: Custom Thumbnail > Auto 5s Frame Capture
      let effectiveThumb = thumbnailFile;
      if (!effectiveThumb) {
        if (autoThumbnailFile) {
          effectiveThumb = autoThumbnailFile;
        } else if (videoFile) {
          setIsExtractingAutoThumbnail(true);
          const result = await extractAutoThumbnail(videoFile);
          setIsExtractingAutoThumbnail(false);
          if (result) {
            effectiveThumb = result.file;
            setAutoThumbnailFile(result.file);
            setAutoThumbnailPreviewUrl(result.previewUrl);
          }
        }
      }

      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("description", description.trim());
      formData.append("file", videoFile);
      if (effectiveThumb) {
        formData.append("thumbnail_file", effectiveThumb);
      }
      if (user?.id) {
        formData.append("creator_id", String(user.id));
      }

      // Progress animation
      const interval = setInterval(() => {
        setUploadProgress(prev => (prev < 90 ? prev + 15 : prev));
      }, 500);

      const res = await fetch(`${API_BASE}/api/v1/videos/admin-upload`, {
        method: "POST",
        body: formData,
      });

      clearInterval(interval);
      setUploadProgress(100);

      if (res.ok) {
        setUploadStatus('success');
      } else {
        const errData = await res.json().catch(() => null);
        setErrorMessage(errData?.detail || 'Server rejected upload request.');
        setUploadStatus('error');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Network error occurred. Please check connection.');
      setUploadStatus('error');
    } finally {
      setIsUploading(false);
    }
  };

  if (isInitializing) return null;

  if (!isAuthenticated) {
    return (
      <div className="min-h-[85vh] bg-[#0a0a0a] flex flex-col items-center justify-center text-center px-4 py-8">
        <div className="bg-[#111] border border-zinc-800 p-6 sm:p-10 rounded-3xl shadow-2xl max-w-md w-full">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-rose-500/15 border border-rose-500/20 rounded-full flex items-center justify-center mx-auto mb-5 text-rose-500">
            <UploadCloud className="w-8 h-8 sm:w-10 sm:h-10" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-2 tracking-tight">Creator Video Upload</h1>
          <p className="text-zinc-400 mb-6 text-sm leading-relaxed">
            Sign in with your verified XPIG account to publish high-bitrate videos directly to our global streaming network.
          </p>
          <button 
            onClick={() => googleLogin()}
            className="w-full bg-white text-black font-bold py-3.5 px-6 rounded-2xl hover:bg-zinc-200 transition-all flex items-center justify-center gap-3 shadow-lg active:scale-95"
          >
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
            Continue with Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white px-3 sm:px-6 py-4 sm:py-8 flex justify-center pb-28 md:pb-16">
      <div className="max-w-2xl w-full">
        
        {/* Mobile Header */}
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
              <span>Publish Video</span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400">
                Mobile Studio
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">Share content with XPIG audience</p>
          </div>

          <Link href="/creator" className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 font-semibold">
            Dashboard <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {uploadStatus === 'success' ? (
          <div className="bg-[#111] border border-emerald-500/30 rounded-3xl p-6 sm:p-10 flex flex-col items-center text-center shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4 animate-bounce">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Upload Completed!</h2>
            <p className="text-zinc-400 mb-6 max-w-sm text-sm">
              Your video has been securely uploaded to our Cloudflare storage node. It is processing and will appear in your profile shortly.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
              <Link 
                href="/profile" 
                className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-bold text-sm text-center transition-colors"
              >
                Go to Profile
              </Link>
              <button 
                onClick={() => {
                  setUploadStatus('idle');
                  setVideoFile(null);
                  setVideoPreviewUrl(null);
                  setThumbnailFile(null);
                  setThumbnailPreviewUrl(null);
                  setTitle('');
                  setDescription('');
                }}
                className="w-full py-3 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white rounded-xl font-bold text-sm transition-all"
              >
                Upload Another
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleUpload} className="space-y-5">
            {uploadStatus === 'error' && (
              <div className="p-4 bg-red-950/30 border border-red-500/30 rounded-2xl flex items-center gap-3 text-red-400">
                <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />
                <p className="text-xs sm:text-sm font-medium">{errorMessage || 'Upload failed. Please verify storage nodes and retry.'}</p>
              </div>
            )}

            {/* 1. Mobile-Optimized Video Picker Zone */}
            <div className="bg-[#111] border border-zinc-800 rounded-2xl p-4 sm:p-6 shadow-xl">
              <input 
                type="file" 
                ref={videoInputRef}
                accept="video/*" 
                className="hidden" 
                onChange={handleVideoSelect}
              />

              {!videoFile ? (
                <div 
                  onClick={() => videoInputRef.current?.click()}
                  className="border-2 border-dashed border-zinc-700 hover:border-pink-500 bg-zinc-900/40 rounded-xl p-6 sm:p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all active:scale-[0.99] group"
                >
                  <div className="w-14 h-14 rounded-full bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400 mb-3 group-hover:scale-110 transition-transform">
                    <UploadCloud className="w-7 h-7" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white mb-1">
                    Tap to Choose Video File
                  </h3>
                  <p className="text-xs text-zinc-400 max-w-xs mb-3">
                    Select from phone Gallery, Files or Camera. MP4, MKV, MOV up to 2GB.
                  </p>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-800 text-[11px] font-semibold text-zinc-300">
                    <Camera className="w-3.5 h-3.5 text-pink-400" />
                    <span>Camera / Gallery Picker</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <div className="p-2 bg-pink-500/10 rounded-xl text-pink-400 shrink-0">
                        <Film className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-white truncate max-w-[200px] sm:max-w-xs">{videoFile.name}</h4>
                        <p className="text-[11px] text-zinc-400">{(videoFile.size / (1024 * 1024)).toFixed(2)} MB • Ready to stream</p>
                      </div>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => {
                        setVideoFile(null);
                        setVideoPreviewUrl(null);
                      }}
                      className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white"
                      title="Remove video"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Video Instant Preview on Mobile */}
                  {videoPreviewUrl && (
                    <div className="relative rounded-xl overflow-hidden bg-black aspect-video max-h-56 w-full border border-zinc-800">
                      <video 
                        src={videoPreviewUrl} 
                        controls 
                        className="w-full h-full object-contain"
                        preload="metadata"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 2. Metadata Inputs */}
            <div className="bg-[#111] border border-zinc-800 rounded-2xl p-4 sm:p-6 space-y-4 shadow-xl">
              <div>
                <label className="block text-xs sm:text-sm font-bold text-zinc-200 mb-1.5">
                  Video Title <span className="text-pink-500">*</span>
                </label>
                <input 
                  type="text" 
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Deshi Viral Video Episode 1"
                  className="w-full bg-[#18181b] border border-zinc-700/80 focus:border-pink-500 rounded-xl px-3.5 py-3 text-sm text-white outline-none transition-colors placeholder:text-zinc-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs sm:text-sm font-bold text-zinc-200">
                    Description & Tags
                  </label>
                  <span className="text-[11px] text-zinc-500">Tap tag to insert</span>
                </div>
                <textarea 
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Write a description or add trending tags..."
                  className="w-full bg-[#18181b] border border-zinc-700/80 focus:border-pink-500 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none transition-colors resize-none placeholder:text-zinc-500"
                />

                {/* Quick 1-Tap Tag Pills */}
                <div className="flex items-center gap-1.5 flex-wrap mt-2">
                  <Sparkles className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                  {POPULAR_TAGS.map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => addTag(tag)}
                      className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-zinc-800/80 hover:bg-pink-600 hover:text-white text-zinc-300 border border-zinc-700/60 transition-all active:scale-95"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Mobile Thumbnail Picker */}
              <div className="pt-2 border-t border-zinc-800/80">
                <label className="block text-xs sm:text-sm font-bold text-zinc-200 mb-2">
                  Thumbnail (Recommended)
                </label>
                <input 
                  type="file" 
                  ref={thumbnailInputRef}
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleThumbnailSelect}
                />
                
                <div className="flex items-center gap-3">
                  <div 
                    onClick={() => thumbnailInputRef.current?.click()}
                    className="w-28 h-18 sm:w-36 sm:h-22 bg-zinc-900 border border-zinc-700 hover:border-pink-500 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all shrink-0 overflow-hidden relative active:scale-95 group"
                  >
                    {thumbnailPreviewUrl ? (
                      <img src={thumbnailPreviewUrl} alt="Thumbnail Preview" className="w-full h-full object-cover" />
                    ) : autoThumbnailPreviewUrl ? (
                      <div className="relative w-full h-full">
                        <img src={autoThumbnailPreviewUrl} alt="Auto 5s Frame" className="w-full h-full object-cover" />
                        <div className="absolute bottom-1 right-1 bg-black/80 border border-pink-500/40 text-[9px] font-mono text-pink-400 px-1 py-0.2 rounded">
                          5s Auto
                        </div>
                      </div>
                    ) : isExtractingAutoThumbnail ? (
                      <div className="flex flex-col items-center justify-center text-center p-2">
                        <span className="w-4 h-4 border-2 border-pink-500 border-t-transparent rounded-full animate-spin mb-1" />
                        <span className="text-[9px] font-semibold text-zinc-400">Capturing 5s...</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-center p-2">
                        <ImageIcon className="w-5 h-5 text-zinc-500 mb-1 group-hover:text-pink-400" />
                        <span className="text-[10px] font-semibold text-zinc-400">Pick Photo</span>
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-zinc-400 leading-snug">
                    <p className="font-medium text-zinc-300">
                      {thumbnailFile ? 'Custom Cover Image' : autoThumbnailPreviewUrl ? '5-Second Frame (Auto Selected)' : 'Custom 16:9 Cover'}
                    </p>
                    <p className="text-[11px] text-zinc-500 mt-0.5">
                      {autoThumbnailPreviewUrl && !thumbnailFile 
                        ? 'System auto-captured a frame at 5 seconds. Tap here to choose a custom cover if desired.'
                        : 'High-res thumbnails improve click-through rate by over 60%.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 4. Upload Progress Bar (When Active) */}
            {isUploading && (
              <div className="bg-[#111] border border-pink-500/30 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-zinc-300 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-pink-500 animate-ping" />
                    Uploading to XPIG Storage Node...
                  </span>
                  <span className="text-pink-400 font-mono">{uploadProgress}%</span>
                </div>
                <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-rose-500 to-pink-500 transition-all duration-300 rounded-full"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* 5. Desktop Publish Button */}
            <div className="hidden md:flex justify-end gap-3 pt-2">
              <button 
                type="submit" 
                disabled={!videoFile || !title.trim() || isUploading}
                className="px-8 py-3.5 bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 hover:from-rose-500 hover:to-pink-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-extrabold rounded-xl transition-all shadow-lg shadow-pink-900/30 flex items-center gap-2"
              >
                {isUploading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    <span>Publishing ({uploadProgress}%)...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-5 h-5" />
                    <span>Publish Video Now</span>
                  </>
                )}
              </button>
            </div>

            {/* 6. Mobile Sticky Bottom Action Bar (Thumb-friendly) */}
            <div className="md:hidden fixed bottom-16 left-0 right-0 p-3 bg-black/90 backdrop-blur-xl border-t border-zinc-800/80 z-40 flex items-center gap-3">
              <button 
                type="submit" 
                disabled={!videoFile || !title.trim() || isUploading}
                className="w-full py-3.5 bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 hover:from-rose-500 hover:to-pink-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-sm rounded-xl transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2"
              >
                {isUploading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    <span>Publishing ({uploadProgress}%)...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-5 h-5" />
                    <span>Publish Video</span>
                  </>
                )}
              </button>
            </div>

          </form>
        )}
      </div>
    </div>
  );
}
