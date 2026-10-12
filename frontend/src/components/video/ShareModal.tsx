'use client';

import React, { useState } from 'react';
import { X, Copy, Check, Send, MessageCircle, Share2 } from 'lucide-react';

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
      icon: Send,
      color: 'bg-[#229ED9]/15 text-[#229ED9] hover:bg-[#229ED9]/25 border-[#229ED9]/30',
      action: () => handleSocialClick(`https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`),
    },
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      color: 'bg-[#25D366]/15 text-[#25D366] hover:bg-[#25D366]/25 border-[#25D366]/30',
      action: () => handleSocialClick(`https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`),
    },
    {
      name: 'Facebook',
      icon: Share2,
      color: 'bg-[#1877F2]/15 text-[#1877F2] hover:bg-[#1877F2]/25 border-[#1877F2]/30',
      action: () => handleSocialClick(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`),
    },
    {
      name: 'X (Twitter)',
      icon: () => (
        <span className="font-bold text-sm tracking-tighter">𝕏</span>
      ),
      color: 'bg-zinc-800 text-white hover:bg-zinc-700 border-zinc-700',
      action: () => handleSocialClick(`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`),
    },
  ];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-[0_20px_60px_rgba(0,0,0,0.8)] text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Share2 className="w-5 h-5 text-pink-500" />
            Share Video
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Social Share Grid */}
        <div className="grid grid-cols-4 gap-3 my-6">
          {shareOptions.map((opt) => {
            const IconComp = opt.icon;
            return (
              <button
                key={opt.name}
                onClick={opt.action}
                className="flex flex-col items-center gap-2 group cursor-pointer focus:outline-none"
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-all transform group-hover:scale-105 active:scale-95 shadow-md ${opt.color}`}>
                  <IconComp className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-medium text-zinc-400 group-hover:text-zinc-200 transition-colors">
                  {opt.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* Copy Link Input Section */}
        <div className="mt-4">
          <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
            Video Link
          </label>
          <div className="flex items-center gap-2 p-1.5 bg-zinc-900 border border-zinc-800 rounded-xl focus-within:border-pink-500/60 transition-colors">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 bg-transparent px-3 text-xs text-zinc-300 select-all outline-none"
            />
            <button
              onClick={handleCopy}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-bold text-xs transition-all ${
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
