'use client';

import React, { useState } from 'react';
import { Mail, Copy, Check } from 'lucide-react';

export default function SponsorContactButton() {
  const [copied, setCopied] = useState(false);
  const email = 'admin@xpig.me';
  const mailtoUrl = `mailto:${email}?subject=XPIG%20Sponsorship%20%26%20Advertising%20Inquiry&body=Hello%20XPIG%20Advertising%20Team%2C%0A%0AI%20am%20interested%20in%20discussing%20sponsorships%20and%20ad%20placements%20on%20XPIG.%0A%0ACompany%20%2F%20Brand%3A%0ABudget%3A%0APreferred%20Placement%3A%0A%0ABest%20regards%2C`;

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleMailClick = () => {
    window.location.href = mailtoUrl;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
      {/* Primary 10px rounded, professional executive button */}
      <a
        href={mailtoUrl}
        onClick={handleMailClick}
        className="flex items-center gap-3 bg-[#18181b] hover:bg-[#222227] text-white px-7 py-3.5 rounded-[10px] font-semibold text-base transition-all duration-200 border border-white/10 hover:border-pink-500/40 shadow-md shadow-black/50 group"
      >
        <Mail className="w-5 h-5 text-pink-500 group-hover:scale-110 transition-transform" />
        <span>Email Us: <strong className="text-pink-400 font-bold ml-1">{email}</strong></span>
      </a>

      {/* Copy Email Button */}
      <button
        onClick={handleCopy}
        title="Copy email to clipboard"
        className="flex items-center gap-2 bg-[#121214] hover:bg-[#1c1c20] text-zinc-300 hover:text-white px-5 py-3.5 rounded-[10px] font-medium text-sm transition-all duration-200 border border-white/5 hover:border-zinc-700 shadow-sm"
      >
        {copied ? (
          <>
            <Check className="w-4 h-4 text-emerald-400" />
            <span className="text-emerald-400 font-semibold">Copied!</span>
          </>
        ) : (
          <>
            <Copy className="w-4 h-4 text-zinc-400" />
            <span>Copy Email</span>
          </>
        )}
      </button>
    </div>
  );
}
