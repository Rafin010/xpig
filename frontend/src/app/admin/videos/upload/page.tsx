'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  UploadCloud, 
  Film, 
  CheckCircle2, 
  AlertCircle, 
  FileVideo, 
  X, 
  HardDrive,
  RefreshCw,
  Check,
  Globe,
  Lock,
  EyeOff,
  Image as ImageIcon,
  Link as LinkIcon,
  Trash2,
  FolderOpen,
  Sparkles
} from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://xpig.onrender.com';

// 'All' is placed first and mandatory per platform architecture
const AVAILABLE_CATEGORIES = [
  'All',
  'Hot',
  'Deshi',
  'Bangla',
  'Viral',
  'Trending',
  'Couples',
  'HD',
  'Premium',
  'Exclusive'
];

export default function MobileVideoUploadPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  // Video File Form State
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  // 'All' is automatically selected and mandatory by default
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['All']);
  const [visibility, setVisibility] = useState('PUBLIC');
  const [status, setStatus] = useState('PUBLISHED');

  // Auto 5-Second Thumbnail State
  const [autoThumbnailFile, setAutoThumbnailFile] = useState<File | null>(null);
  const [autoThumbnailPreviewUrl, setAutoThumbnailPreviewUrl] = useState<string | null>(null);
  const [isExtractingAutoThumbnail, setIsExtractingAutoThumbnail] = useState(false);

  // Custom Thumbnail Form State (Dual-Mode: Device File vs Direct URL)
  const [thumbnailMode, setThumbnailMode] = useState<'file' | 'url'>('file');
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreviewUrl, setThumbnailPreviewUrl] = useState<string | null>(null);
  const [thumbnailUrlInput, setThumbnailUrlInput] = useState('');
  const [thumbnailUrlError, setThumbnailUrlError] = useState(false);

  // Upload Progress & Status State
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      if (thumbnailPreviewUrl) URL.revokeObjectURL(thumbnailPreviewUrl);
      if (autoThumbnailPreviewUrl) URL.revokeObjectURL(autoThumbnailPreviewUrl);
    };
  }, [previewUrl, thumbnailPreviewUrl, autoThumbnailPreviewUrl]);

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
          // Capture at 5.0 seconds (or 30% duration if video is under 5 seconds)
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

  // Handle Multi-Select Category Toggle ('All' is mandatory and permanently selected)
  const toggleCategory = (cat: string) => {
    if (uploading || cat === 'All') return;

    if (selectedCategories.includes(cat)) {
      setSelectedCategories(selectedCategories.filter(c => c !== cat));
    } else {
      setSelectedCategories([...selectedCategories, cat]);
    }
  };

  // Handle Video file selection
  const handleFileSelect = (selectedFile: File) => {
    if (!selectedFile) return;

    if (!selectedFile.type.startsWith('video/') && !selectedFile.name.match(/\.(mp4|mov|webm|mkv)$/i)) {
      setErrorMessage('Please select a valid video file (.mp4, .mov, .webm, .mkv)');
      return;
    }

    setFile(selectedFile);
    setErrorMessage(null);

    // Auto set clean title from filename if title is empty
    const cleanName = selectedFile.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
    if (!title) {
      setTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
    }

    // Create instant local video preview
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);

    // Automatically trigger 5-second frame thumbnail extraction
    setIsExtractingAutoThumbnail(true);
    if (autoThumbnailPreviewUrl) URL.revokeObjectURL(autoThumbnailPreviewUrl);
    setAutoThumbnailPreviewUrl(null);
    setAutoThumbnailFile(null);

    extractAutoThumbnail(selectedFile).then((result) => {
      setIsExtractingAutoThumbnail(false);
      if (result) {
        setAutoThumbnailFile(result.file);
        setAutoThumbnailPreviewUrl(result.previewUrl);
      }
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    if (autoThumbnailPreviewUrl) URL.revokeObjectURL(autoThumbnailPreviewUrl);
    setAutoThumbnailPreviewUrl(null);
    setAutoThumbnailFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Handle Custom Thumbnail File Selection
  const handleThumbnailSelect = (selectedThumb: File) => {
    if (!selectedThumb) return;

    if (!selectedThumb.type.startsWith('image/') && !selectedThumb.name.match(/\.(jpg|jpeg|png|webp|gif)$/i)) {
      setErrorMessage('Please select a valid image file (.jpg, .jpeg, .png, .webp) for thumbnail');
      return;
    }

    setThumbnailFile(selectedThumb);
    setErrorMessage(null);

    if (thumbnailPreviewUrl) URL.revokeObjectURL(thumbnailPreviewUrl);
    const url = URL.createObjectURL(selectedThumb);
    setThumbnailPreviewUrl(url);
  };

  const handleThumbnailInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleThumbnailSelect(files[0]);
    }
  };

  const handleRemoveThumbnail = () => {
    setThumbnailFile(null);
    if (thumbnailPreviewUrl) URL.revokeObjectURL(thumbnailPreviewUrl);
    setThumbnailPreviewUrl(null);
    if (thumbnailInputRef.current) thumbnailInputRef.current.value = '';
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes >= 1024 * 1024 * 1024) {
      return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
    }
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // Submit Upload with Real Progress Tracking
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      setErrorMessage('Please select a video file from your device first');
      return;
    }

    if (!title.trim()) {
      setErrorMessage('Video title is required');
      return;
    }

    setUploading(true);
    setProgress(0);
    setErrorMessage(null);
    setUploadSuccess(false);

    // Guaranteed Thumbnail Resolution: Custom File > Custom URL > Auto 5s Frame Capture
    let effectiveThumbFile = thumbnailMode === 'file' ? thumbnailFile : null;
    const effectiveThumbUrl = thumbnailMode === 'url' ? thumbnailUrlInput.trim() : '';

    if (!effectiveThumbFile && !effectiveThumbUrl) {
      if (autoThumbnailFile) {
        effectiveThumbFile = autoThumbnailFile;
      } else {
        // Await 5-second thumbnail extraction if still in progress or not yet captured
        setIsExtractingAutoThumbnail(true);
        const result = await extractAutoThumbnail(file);
        setIsExtractingAutoThumbnail(false);
        if (result) {
          setAutoThumbnailFile(result.file);
          setAutoThumbnailPreviewUrl(result.previewUrl);
          effectiveThumbFile = result.file;
        }
      }
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title.trim());
    formData.append('description', description.trim());
    const finalCategories = Array.from(new Set(['All', ...selectedCategories])).filter(Boolean);
    formData.append('categories', finalCategories.join(','));
    formData.append('visibility', visibility);
    formData.append('status', status);

    if (effectiveThumbFile) {
      formData.append('thumbnail_file', effectiveThumbFile);
    } else if (effectiveThumbUrl) {
      formData.append('thumbnail_url', effectiveThumbUrl);
    }

    try {
      const storedUser = JSON.parse(localStorage.getItem('xpig_admin_user') || '{}');
      if (storedUser?.id) {
        formData.append('creator_id', String(storedUser.id));
      }
    } catch {}

    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${API_BASE}/api/v1/videos/admin-upload`, true);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 98);
        setProgress(percent);
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        setProgress(100);
        setUploadSuccess(true);
        setUploading(false);

        // Redirect back to videos list after brief confirmation
        setTimeout(() => {
          router.push('/admin/videos');
        }, 1200);
      } else {
        setUploading(false);
        try {
          const errRes = JSON.parse(xhr.responseText);
          setErrorMessage(errRes.detail || `Upload failed (Status: ${xhr.status})`);
        } catch {
          setErrorMessage(`Upload failed (Status: ${xhr.status}). Please check backend response.`);
        }
      }
    };

    xhr.onerror = () => {
      setUploading(false);
      setErrorMessage('Failed to connect to the server. Please check your network connection and backend status.');
    };

    xhr.send(formData);
  };

  return (
    <div className="min-h-full bg-[#09090b] text-white pb-36 md:pb-12 max-w-2xl mx-auto">
      
      {/* 1. Header (Natural Page Flow - Scrolls with the page) */}
      <header className="w-full bg-[#111114] border-b border-zinc-800 px-4 py-3.5 flex items-center justify-between select-none shadow-sm">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/videos"
            className="p-2 -ml-1 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors active:scale-95"
            aria-label="Back to videos"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-base font-bold text-white flex items-center gap-2">
              <Film className="w-4 h-4 text-blue-500" />
              <span>Upload Video</span>
            </h1>
            <p className="text-[11px] text-zinc-400">Direct Device Video & Auto 5s Thumbnail Publisher</p>
          </div>
        </div>

        {/* Storage Node Pill (Solid Emerald Green Badge) */}
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-semibold text-emerald-400">
          <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
          <span>Cloudflare R2</span>
        </div>
      </header>

      {/* Main Upload Content Form */}
      <form onSubmit={handleUpload} className="p-4 sm:p-6 space-y-5">
        
        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs font-semibold flex items-start gap-2.5 shadow-lg">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
            <span className="flex-1 leading-relaxed">{errorMessage}</span>
          </div>
        )}

        {/* Success Alert */}
        {uploadSuccess && (
          <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-3 shadow-lg">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
            <div>
              <p className="text-sm font-bold text-white">Video & Thumbnail Upload Completed!</p>
              <p className="text-[11px] text-emerald-300 font-medium mt-0.5">Saved to Cloudflare R2 storage. Redirecting to catalog...</p>
            </div>
          </div>
        )}

        {/* 2. Video File Picker / Live Preview Box */}
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          className="hidden"
          onChange={handleInputChange}
          disabled={uploading}
        />

        {!file ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-zinc-800 hover:border-blue-500/80 bg-[#121215] hover:bg-zinc-900/60 rounded-2xl p-7 sm:p-9 text-center cursor-pointer transition-all group flex flex-col items-center justify-center space-y-3 shadow-md active:scale-[0.99]"
          >
            <div className="w-14 h-14 rounded-2xl bg-blue-600/15 border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover:scale-105 transition-transform">
              <UploadCloud className="w-7 h-7" />
            </div>
            <div>
              <p className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
                Select Video File from Device
              </p>
              <p className="text-xs text-zinc-400 mt-1">
                Tap here to choose a video from your phone storage or gallery
              </p>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-[11px] font-medium text-zinc-400">
              <span>MP4, MOV, WEBM</span>
              <span>•</span>
              <span className="text-blue-400 font-semibold">Original Quality</span>
            </div>
          </div>
        ) : (
          <div className="bg-[#121215] border border-zinc-800/80 rounded-2xl p-4 shadow-lg space-y-3.5">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                  <FileVideo className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate max-w-[200px] sm:max-w-xs">{file.name}</p>
                  <p className="text-[11px] text-zinc-400 font-mono">{formatFileSize(file.size)}</p>
                </div>
              </div>

              {!uploading && (
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                  title="Remove video"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Live Video Preview Player */}
            {previewUrl && (
              <div className="relative aspect-video rounded-xl overflow-hidden bg-black border border-zinc-800/90 flex items-center justify-center shadow-inner group">
                <video
                  src={previewUrl}
                  controls
                  playsInline
                  className="w-full h-full object-contain"
                />
              </div>
            )}

            {!uploading && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Select Another Video</span>
              </button>
            )}
          </div>
        )}

        {/* 3. Real-Time Upload Progress Bar (Clean Monospace Indicator - No Parentheses) */}
        {uploading && (
          <div className="bg-[#121215] border border-blue-500/40 rounded-xl p-4 shadow-lg space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-blue-400 flex items-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-400" />
                <span>Uploading to Cloudflare R2 • {progress}%</span>
              </span>
              <span className="font-mono text-white text-sm font-black">{progress}%</span>
            </div>

            <div className="h-2.5 w-full bg-zinc-900 rounded-full overflow-hidden p-0.5 border border-zinc-800">
              <div
                className="h-full rounded-full bg-blue-600 transition-all duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-[10px] text-zinc-400 text-center font-mono">
              Do not navigate away or close browser while upload is in progress
            </p>
          </div>
        )}

        {/* 4. COMPACT PROFESSIONAL THUMBNAIL SELECTOR (Auto 5s Capture + Custom Overrides) */}
        <div className="bg-[#121215] border border-zinc-800/80 rounded-2xl p-3.5 sm:p-4 shadow-lg space-y-3">
          {/* Header Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">Thumbnail</span>
              <span className="text-[10px] text-zinc-400 font-normal">(Auto 5s or Custom)</span>
            </div>

            {/* Segmented Pill Tabs */}
            <div className="flex items-center bg-zinc-900 border border-zinc-800 p-0.5 rounded-lg text-[11px] font-semibold">
              <button
                type="button"
                onClick={() => setThumbnailMode('file')}
                disabled={uploading}
                className={`px-2.5 py-1 rounded-md flex items-center gap-1 transition-all ${
                  thumbnailMode === 'file'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <FolderOpen className="w-3 h-3" />
                <span>Device File</span>
              </button>
              <button
                type="button"
                onClick={() => setThumbnailMode('url')}
                disabled={uploading}
                className={`px-2.5 py-1 rounded-md flex items-center gap-1 transition-all ${
                  thumbnailMode === 'url'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <LinkIcon className="w-3 h-3" />
                <span>Direct URL</span>
              </button>
            </div>
          </div>

          {/* Mode 1: Device Image Upload */}
          {thumbnailMode === 'file' && (
            <div>
              <input
                ref={thumbnailInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleThumbnailInputChange}
                disabled={uploading}
              />

              {!thumbnailFile ? (
                <div
                  onClick={() => thumbnailInputRef.current?.click()}
                  className="flex items-center justify-between p-2.5 bg-zinc-900/50 hover:bg-zinc-900 border border-dashed border-zinc-700/80 hover:border-emerald-500/60 rounded-xl cursor-pointer transition-all active:scale-[0.99] group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 group-hover:scale-105 transition-transform">
                      <ImageIcon className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-zinc-200 group-hover:text-emerald-400 transition-colors truncate">
                        Select Custom Image from Device
                      </p>
                      <p className="text-[10px] text-zinc-400">JPG, PNG, WEBP (Overrides auto thumbnail)</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 text-[11px] font-semibold rounded-lg shrink-0 transition-colors">
                    Choose File
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2.5 p-2 bg-zinc-900 border border-zinc-700/80 rounded-xl">
                  {thumbnailPreviewUrl && (
                    <img
                      src={thumbnailPreviewUrl}
                      alt="Thumbnail preview"
                      className="w-14 h-9 rounded-lg object-cover bg-black border border-zinc-700 shrink-0 shadow-sm"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-white truncate">{thumbnailFile.name}</p>
                    <p className="text-[10px] text-emerald-400 font-mono flex items-center gap-1.5 mt-0.5">
                      <span>{formatFileSize(thumbnailFile.size)}</span>
                      <span>•</span>
                      <span>Custom Thumbnail</span>
                    </p>
                  </div>
                  {!uploading && (
                    <button
                      type="button"
                      onClick={handleRemoveThumbnail}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-zinc-800 transition-colors shrink-0"
                      title="Remove custom thumbnail"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Mode 2: Direct Image URL */}
          {thumbnailMode === 'url' && (
            <div className="space-y-2">
              <div className="relative">
                <input
                  type="url"
                  value={thumbnailUrlInput}
                  onChange={(e) => {
                    setThumbnailUrlInput(e.target.value);
                    setThumbnailUrlError(false);
                  }}
                  placeholder="https://... Direct image link (JPG, PNG, WEBP)"
                  disabled={uploading}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl pl-3 pr-8 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors font-mono"
                />
                {thumbnailUrlInput && !uploading && (
                  <button
                    type="button"
                    onClick={() => setThumbnailUrlInput('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {thumbnailUrlInput.trim() && (
                <div className="flex items-center gap-2.5 p-1.5 bg-zinc-900 border border-zinc-800 rounded-xl">
                  <div className="w-12 h-8 rounded-lg overflow-hidden bg-black border border-zinc-700 shrink-0 flex items-center justify-center">
                    {!thumbnailUrlError ? (
                      <img
                        src={thumbnailUrlInput.trim()}
                        alt="URL Thumbnail"
                        onError={() => setThumbnailUrlError(true)}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-[9px] text-rose-400 text-center">Error</span>
                    )}
                  </div>
                  <p className="text-[11px] truncate flex-1 font-medium">
                    {thumbnailUrlError ? (
                      <span className="text-rose-400">Invalid image URL</span>
                    ) : (
                      <span className="text-emerald-400">✓ Thumbnail link verified</span>
                    )}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Auto 5-Second Thumbnail Preview Box (Active when no custom thumb chosen) */}
          {!thumbnailFile && !thumbnailUrlInput.trim() && (
            <div className="pt-1">
              {autoThumbnailPreviewUrl ? (
                <div className="flex items-center gap-3 p-2.5 bg-zinc-900/70 border border-blue-500/20 rounded-xl">
                  <img
                    src={autoThumbnailPreviewUrl}
                    alt="Auto-captured 5s frame"
                    className="w-16 h-10 rounded-lg object-cover bg-black border border-blue-500/30 shrink-0 shadow-sm"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue-500/15 border border-blue-500/30 text-[10px] font-bold text-blue-400 font-mono">
                        <Sparkles className="w-2.5 h-2.5" />
                        Auto 00:05
                      </span>
                      <span className="text-xs font-bold text-zinc-200">Default Video Frame</span>
                    </div>
                    <p className="text-[10px] text-zinc-400 mt-0.5">
                      Auto-captured at 5 seconds. Will upload automatically if no custom thumbnail is provided.
                    </p>
                  </div>
                </div>
              ) : isExtractingAutoThumbnail ? (
                <div className="flex items-center gap-2.5 p-2.5 bg-zinc-900/50 border border-zinc-800 rounded-xl">
                  <RefreshCw className="w-3.5 h-3.5 text-blue-400 animate-spin" />
                  <span className="text-[11px] text-zinc-400">Extracting 5-second video frame thumbnail...</span>
                </div>
              ) : (
                <p className="text-[10px] text-zinc-500 italic pl-1">
                  * If no custom thumbnail is uploaded, the system automatically captures and uses the 5-second video frame.
                </p>
              )}
            </div>
          )}
        </div>

        {/* 5. Metadata Inputs Card */}
        <div className="space-y-4 bg-[#121215] border border-zinc-800/80 p-4 sm:p-5 rounded-2xl shadow-lg">
          
          {/* Video Title */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider">
              Video Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Deshi Hot Viral Dance Clip"
              disabled={uploading}
              className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            />
          </div>

          {/* Video Description */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider">
              Description <span className="text-zinc-500 text-[10px] lowercase font-normal">(optional)</span>
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description or searchable keywords for this video..."
              disabled={uploading}
              className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors resize-none"
            />
          </div>

          {/* Category Multi-Selector (All placed first) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider">
                Categories (Multi-Select)
              </label>
              <span className="text-[10px] text-blue-400 font-medium">
                {selectedCategories.length} selected
              </span>
            </div>
            
            <p className="text-[11px] text-zinc-400">
              Select multiple categories. Users filtering by these categories in the home feed will discover this video.
            </p>

            <div className="flex flex-wrap gap-2 pt-1">
              {AVAILABLE_CATEGORIES.map((cat) => {
                const isAll = cat === 'All';
                const isSelected = isAll || selectedCategories.includes(cat);
                return (
                  <button
                    type="button"
                    key={cat}
                    onClick={() => toggleCategory(cat)}
                    disabled={uploading || isAll}
                    title={isAll ? "'All' category is mandatory and default for main feed" : undefined}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? isAll
                          ? 'bg-blue-600/90 text-white border border-blue-500/80 shadow-sm cursor-default'
                          : 'bg-blue-600 text-white border border-blue-500 shadow-sm active:scale-95'
                        : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800 hover:border-zinc-700 active:scale-95'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    <span>{cat}</span>
                    {isAll && <span className="text-[10px] text-blue-200 font-normal ml-0.5">(Default)</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Visibility Options */}
          <div className="space-y-1.5 pt-1">
            <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider">
              Visibility
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'PUBLIC', label: 'Public', icon: Globe },
                { id: 'UNLISTED', label: 'Unlisted', icon: EyeOff },
                { id: 'PRIVATE', label: 'Private', icon: Lock }
              ].map(({ id, label, icon: Icon }) => (
                <button
                  type="button"
                  key={id}
                  onClick={() => setVisibility(id)}
                  disabled={uploading}
                  className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    visibility === id
                      ? 'bg-zinc-800 text-white border border-blue-500/80 shadow-sm'
                      : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* 6. Mobile Docked Action Bar (Clean Modern Styling - Zero Parentheses) */}
        <div className="fixed bottom-[calc(3.5rem+env(safe-area-inset-bottom,0px))] md:static md:bottom-auto left-0 right-0 p-3.5 sm:p-4 bg-[#0e0e11]/95 backdrop-blur-xl border-t border-zinc-800/90 z-30 max-w-2xl mx-auto shadow-[0_-8px_30px_rgba(0,0,0,0.85)]">
          <button
            type="submit"
            disabled={uploading || !file || !title.trim() || isExtractingAutoThumbnail}
            className="w-full py-3.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm tracking-wide shadow-md flex items-center justify-center gap-2.5 transition-all active:scale-[0.99]"
          >
            {uploading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Uploading Video • {progress}%</span>
              </>
            ) : isExtractingAutoThumbnail ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Capturing 5s Thumbnail...</span>
              </>
            ) : uploadSuccess ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>Upload Completed!</span>
              </>
            ) : (
              <>
                <UploadCloud className="w-5 h-5" />
                <span>Publish Video & Thumbnail</span>
              </>
            )}
          </button>
        </div>

      </form>

    </div>
  );
}
