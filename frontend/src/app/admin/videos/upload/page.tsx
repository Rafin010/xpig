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
  Eye, 
  HardDrive,
  RefreshCw,
  Check,
  Globe,
  Lock,
  EyeOff
} from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://xpig.onrender.com';

// 'All' is placed first and mandatory per user requirement
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

  // Form State
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  // 'All' is automatically selected and mandatory by default
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['All']);
  const [visibility, setVisibility] = useState('PUBLIC');
  const [status, setStatus] = useState('PUBLISHED');

  // Upload Progress & Status State
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Clean up object URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  // Handle Multi-Select Category Toggle ('All' is mandatory and permanently selected)
  const toggleCategory = (cat: string) => {
    if (uploading || cat === 'All') return; // 'All' is permanently selected

    if (selectedCategories.includes(cat)) {
      setSelectedCategories(selectedCategories.filter(c => c !== cat));
    } else {
      setSelectedCategories([...selectedCategories, cat]);
    }
  };

  // Handle file selection
  const handleFileSelect = (selectedFile: File) => {
    if (!selectedFile) return;

    if (!selectedFile.type.startsWith('video/') && !selectedFile.name.match(/\.(mp4|mov|webm|mkv)$/i)) {
      setErrorMessage('অনুগ্রহ করে একটি ভ্যালিড ভিডিও ফাইল (.mp4, .mov, .webm) সিলেক্ট করুন।');
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
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes >= 1024 * 1024 * 1024) {
      return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
    }
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // Submit Upload with Real Progress Tracking
  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      setErrorMessage('দয়া করে প্রথমে ডিভাইস থেকে একটি ভিডিও নির্বাচন করুন');
      return;
    }

    if (!title.trim()) {
      setErrorMessage('ভিডিওর টাইটেল দেওয়া বাধ্যতামূলক');
      return;
    }

    setUploading(true);
    setProgress(0);
    setErrorMessage(null);
    setUploadSuccess(false);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title.trim());
    formData.append('description', description.trim());
    const finalCategories = Array.from(new Set(['All', ...selectedCategories])).filter(Boolean);
    formData.append('categories', finalCategories.join(','));
    formData.append('visibility', visibility);
    formData.append('status', status);

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
          setErrorMessage(errRes.detail || 'আপলোড ব্যর্থ হয়েছে। আবার চেষ্টা করুন।');
        } catch {
          setErrorMessage(`আপলোড ব্যর্থ হয়েছে (Status: ${xhr.status})`);
        }
      }
    };

    xhr.onerror = () => {
      setUploading(false);
      setErrorMessage('সার্ভারের সাথে সংযোগ স্থাপন করা সম্ভব হয়নি। নেটওয়ার্ক চেক করুন।');
    };

    xhr.send(formData);
  };

  return (
    <div className="min-h-full bg-[#09090b] text-white pb-36 md:pb-12 max-w-2xl mx-auto">
      
      {/* 1. Header (Natural Page Flow - Scrolls with the page per user request) */}
      <header className="w-full bg-[#111114] border-b border-zinc-800 px-4 py-3.5 flex items-center justify-between select-none">
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
            <p className="text-[11px] text-zinc-400">Direct Device Video Publisher</p>
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
              <p className="text-sm font-bold text-white">ভিডিও সফলভাবে আপলোড সম্পন্ন হয়েছে!</p>
              <p className="text-[11px] text-emerald-300 font-medium mt-0.5">Cloudflare R2 স্টোরেজে ভিডিও প্রসেস হয়েছে। রিডাইরেক্ট হচ্ছে...</p>
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
                ডিভাইস থেকে ভিডিও ফাইল সিলেক্ট করুন
              </p>
              <p className="text-xs text-zinc-400 mt-1">
                এখানে ট্যাপ করে মোবাইল স্টোরেজ বা গ্যালারি থেকে ফাইল নিন
              </p>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-[11px] font-medium text-zinc-400">
              <span>MP4, MOV, WEBM</span>
              <span>•</span>
              <span className="text-blue-400">Original Full Quality</span>
            </div>
          </div>
        ) : (
          <div className="bg-[#121215] border border-zinc-800 rounded-2xl p-4 shadow-lg space-y-3.5">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
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
              <div className="relative aspect-video rounded-xl overflow-hidden bg-black border border-zinc-800 flex items-center justify-center shadow-inner group">
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
                <span>অন্য ভিডিও নির্বাচন করুন</span>
              </button>
            )}
          </div>
        )}

        {/* 3. Real-Time Upload Progress Bar (Solid Blue & Monospace Indicator) */}
        {uploading && (
          <div className="bg-[#121215] border border-blue-500/30 rounded-xl p-4 shadow-lg space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-blue-400 flex items-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-400" />
                Cloudflare R2-তে আপলোড হচ্ছে...
              </span>
              <span className="font-mono text-white text-sm">{progress}%</span>
            </div>

            <div className="h-2.5 w-full bg-zinc-900 rounded-full overflow-hidden p-0.5 border border-zinc-800">
              <div
                className="h-full rounded-full bg-blue-600 transition-all duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-[10px] text-zinc-400 text-center font-mono">
              আপলোড ও প্রসেসিং চলাকালীন পেজটি পরিবর্তন করবেন না
            </p>
          </div>
        )}

        {/* 4. Metadata Inputs Card */}
        <div className="space-y-4 bg-[#121215] border border-zinc-800 p-4 sm:p-5 rounded-2xl shadow-lg">
          
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
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
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
              placeholder="ভিডিও সম্পর্কে সংক্ষিপ্ত বিবরণ বা কি-ওয়ার্ড..."
              disabled={uploading}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors resize-none"
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
              একাধিক ক্যাটাগরি সিলেক্ট করুন। হোম ফিডে ইউজাররা এই ক্যাটাগরি ফিল্টার করলে ভিডিওটি দেখতে পাবেন।
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
                    title={isAll ? "প্রধান ফিডের জন্য 'All' ক্যাটাগরি বাধ্যতামূলক ও স্থায়ী" : undefined}
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

        {/* 5. Mobile Docked Action Bar (Zero Gap With Mobile Bottom Navigation) */}
        <div className="fixed bottom-[calc(3.5rem+env(safe-area-inset-bottom,0px))] md:static md:bottom-auto left-0 right-0 p-3 sm:p-4 bg-[#111114]/98 border-t border-zinc-800 z-30 max-w-2xl mx-auto shadow-2xl">
          <button
            type="submit"
            disabled={uploading || !file || !title.trim()}
            className="w-full py-3.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm tracking-wide shadow-md flex items-center justify-center gap-2.5 transition-all active:scale-[0.99]"
          >
            {uploading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>ভিডিও আপলোড হচ্ছে ({progress}%)...</span>
              </>
            ) : uploadSuccess ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>আপলোড সম্পন্ন হয়েছে!</span>
              </>
            ) : (
              <>
                <UploadCloud className="w-5 h-5" />
                <span>Publish Video to Platform</span>
              </>
            )}
          </button>
        </div>

      </form>

    </div>
  );
}
