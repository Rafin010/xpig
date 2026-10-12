'use client';

import React, { useState } from 'react';
import { X, Copy, Check } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  shareUrl: string;
  onShareTrack?: () => void;
}

export function ShareModal({
  isOpen,
  onClose,
  title,
  shareUrl,
  onShareTrack,
}: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      onShareTrack?.();
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {}
  };

  const handleSocialClick = (platformUrl: string) => {
    onShareTrack?.();
    window.open(platformUrl, '_blank', 'noopener,noreferrer');
  };

  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title || 'Watch this exclusive video on XPIG');

  const shareOptions = [
    {
      name: 'Telegram',
      icon: () => (
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden="true">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8-1.57 7.42c-.12.53-.43.66-.88.41l-2.43-1.79-1.17 1.13c-.13.13-.24.24-.49.24l.17-2.48 4.51-4.07c.2-.18-.04-.27-.3-.1l-5.58 3.51-2.4-.75c-.52-.16-.53-.52.11-.77l9.38-3.62c.43-.16.82.1.66.86z"/>
        </svg>
      ),
      color: 'bg-[#229ED9]/15 text-[#229ED9] hover:bg-[#229ED9]/25 border-[#229ED9]/30',
      action: () => handleSocialClick(`https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`),
    },
    {
      name: 'WhatsApp',
      icon: () => (
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden="true">
          <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.45 0-2.87-.38-4.12-1.1l-.3-.17-3.12.82.83-3.04-.19-.31a8.214 8.214 0 0 1-1.26-4.44c0-4.54 3.7-8.24 8.24-8.24m4.52 11.66c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.02-1.24-.74-.66-1.24-1.48-1.39-1.73-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.13-.15.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.43h-.47c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.13.17 1.78 2.71 4.3 3.8 2.53 1.09 2.53.73 2.99.69.45-.05 1.47-.6 1.68-1.18.21-.58.21-1.08.15-1.18-.06-.1-.23-.17-.48-.29z"/>
        </svg>
      ),
      color: 'bg-[#25D366]/15 text-[#25D366] hover:bg-[#25D366]/25 border-[#25D366]/30',
      action: () => handleSocialClick(`https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`),
    },
    {
      name: 'Facebook',
      icon: () => (
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden="true">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      ),
      color: 'bg-[#1877F2]/15 text-[#1877F2] hover:bg-[#1877F2]/25 border-[#1877F2]/30',
      action: () => handleSocialClick(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`),
    },
    {
      name: 'X (Twitter)',
      icon: () => (
        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      ),
      color: 'bg-zinc-800 text-white hover:bg-zinc-700 border-zinc-700',
      action: () => handleSocialClick(`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`),
    },
  ];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-[92%] sm:w-[360px] max-w-[360px] bg-zinc-950/95 border border-zinc-800/80 rounded-2xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.8)] text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-zinc-800/80">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current text-pink-500" aria-hidden="true">
              <path d="M15 5.63 20.66 12 15 18.37V14h-1c-3.96 0-7.14 1-9.75 3.09 1.84-4.07 5.11-6.4 9.89-7.1l.86-.13V5.63M14 3v6C8.62 9.77 5.25 12.63 3 17.5 5.75 14.5 9.5 13 14 13v6l8-7-8-7z"/>
            </svg>
            Share Video
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Social Share Grid */}
        <div className="grid grid-cols-4 gap-2.5 my-5">
          {shareOptions.map((opt) => {
            const IconComp = opt.icon;
            return (
              <button
                key={opt.name}
                onClick={opt.action}
                className="flex flex-col items-center gap-1.5 group cursor-pointer focus:outline-none"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-all transform group-hover:scale-105 active:scale-95 shadow-md ${opt.color}`}>
                  <IconComp />
                </div>
                <span className="text-[11px] font-medium text-zinc-400 group-hover:text-zinc-200 transition-colors">
                  {opt.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* Copy Link Input Section */}
        <div className="mt-3">
          <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
            Video Link
          </label>
          <div className="flex items-center gap-1.5 p-1 bg-zinc-900 border border-zinc-800 rounded-xl focus-within:border-pink-500/60 transition-colors">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 bg-transparent px-2.5 text-xs text-zinc-300 select-all outline-none truncate"
            />
            <button
              onClick={handleCopy}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-pink-600 hover:bg-pink-500 text-white shadow-md active:scale-95'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
