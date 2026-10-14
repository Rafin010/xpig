'use client';

import React, { useState, useEffect } from 'react';
import { 
  FileSignature, 
  Fingerprint, 
  Check, 
  ShieldCheck, 
  Scale, 
  CheckCircle2, 
  Laptop, 
  Calendar, 
  Clock, 
  Globe, 
  Lock 
} from 'lucide-react';

interface DigitalSignatureCardProps {
  documentTitle: string;
}

import { DeviceMetadata, detectClientEnvironment, recordLegalSignature } from '@/lib/device-detection';

export function DigitalSignatureCard({ documentTitle }: DigitalSignatureCardProps) {
  const [isSigned, setIsSigned] = useState(false);
  const [utcTimestamp, setUtcTimestamp] = useState<string>('');
  const [localTimestamp, setLocalTimestamp] = useState<string>('');
  const [calendarDate, setCalendarDate] = useState<string>('');
  const [trackerId, setTrackerId] = useState<string>('');
  const [deviceInfo, setDeviceInfo] = useState<DeviceMetadata>({
    deviceName: 'Loading device...',
    os: '',
    browser: '',
    screenRes: '',
    timezone: '',
    platform: '',
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const clientEnv = detectClientEnvironment();
    setDeviceInfo(clientEnv);

    // Retrieve persistent tracker token
    let token = localStorage.getItem('xpig_tracker_cookie') || '';
    if (!token) {
      const match = document.cookie.match(/xpig_tracker_cookie=([^;]+)/);
      if (match) token = decodeURIComponent(match[1]);
    }
    if (!token) {
      token = 'xpig_trk_audit_' + Math.random().toString(36).substring(2, 10);
    }
    setTrackerId(token);

    // Check if already signed
    const accepted = localStorage.getItem('pig_legal_accepted') === 'true';
    if (accepted) {
      setIsSigned(true);
      const storedUtc = localStorage.getItem('pig_legal_signed_at') || new Date().toUTCString();
      const storedLocal = localStorage.getItem('pig_legal_local_time') || new Date().toLocaleTimeString();
      const storedDate = localStorage.getItem('pig_legal_calendar_date') || new Date().toLocaleDateString(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      const storedDevice = localStorage.getItem('pig_legal_device_name');

      setUtcTimestamp(storedUtc);
      setLocalTimestamp(storedLocal);
      setCalendarDate(storedDate);
      if (storedDevice) {
        setDeviceInfo(prev => ({ ...prev, deviceName: storedDevice }));
      }
    }
  }, []);

  const handleSign = () => {
    // If already signed, cannot be undone (irreversible per user requirement)
    if (isSigned) return;

    const res = recordLegalSignature(deviceInfo);
    if (res) {
      setIsSigned(true);
      setUtcTimestamp(res.utcStr);
      setLocalTimestamp(res.localStr);
      setCalendarDate(res.dateStr);
    }
  };

  // Generate reference docket code
  const docRefCode = documentTitle
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 18);

  return (
    <div className="mt-12 pt-8 border-t border-zinc-800">
      <div className="bg-[#0f0f13] border border-zinc-800/90 rounded-2xl p-6 sm:p-7 shadow-xl shadow-black/40">
        
        {/* Docket Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-zinc-800/80">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-750 flex items-center justify-center shrink-0">
              <FileSignature className="w-5 h-5 text-zinc-300" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Electronic Signature & Attestation Docket
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Binding digital attestation pursuant to 15 U.S.C. § 7001 (ESIGN Act) & UETA frameworks
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {mounted && isSigned ? (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-700/80 text-[11px] font-mono text-zinc-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                <span className="font-semibold tracking-wide">SIGNED & RECORDED</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900/70 border border-zinc-800 text-[11px] font-mono text-zinc-400">
                <span className="w-2 h-2 rounded-full bg-zinc-500 shrink-0" />
                <span className="tracking-wide">PENDING SIGNATURE</span>
              </div>
            )}
          </div>
        </div>

        {/* Checkbox / Agreement Execution Box (Locked once ticked) */}
        <div className="my-5">
          <label 
            onClick={() => { if (!isSigned) handleSign(); }}
            className={`flex items-start gap-3.5 p-4 sm:p-5 rounded-xl border transition-colors ${
              isSigned 
                ? 'bg-[#0a0a0d] border-zinc-800/80 cursor-default' 
                : 'bg-[#0a0a0d] hover:bg-[#121216] border-zinc-800 hover:border-zinc-700 cursor-pointer group'
            }`}
          >
            <div className="relative flex items-center justify-center shrink-0 mt-0.5">
              <input 
                type="checkbox" 
                checked={isSigned}
                disabled={isSigned}
                onChange={() => { if (!isSigned) handleSign(); }}
                className={`peer appearance-none w-5 h-5 rounded transition-colors ${
                  isSigned 
                    ? 'bg-emerald-500 border-2 border-emerald-500 cursor-default' 
                    : 'bg-[#141418] border-2 border-zinc-600 checked:border-emerald-500 checked:bg-emerald-500 cursor-pointer'
                }`}
              />
              <Check className={`w-3.5 h-3.5 text-white stroke-[3] absolute font-extrabold pointer-events-none transition-transform ${
                isSigned ? 'opacity-100 scale-100' : 'opacity-0 scale-75 peer-checked:opacity-100 peer-checked:scale-100'
              }`} />
            </div>
            
            <div className="flex flex-col text-xs leading-relaxed space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="font-medium text-zinc-200">
                  I hereby declare that I am 18 years of age or older. I have thoroughly reviewed, understood, and irrevocably accepted all terms, moral disclaimers, waivers of liability, and administrative indemnifications in this <span className="text-white font-semibold underline underline-offset-4 decoration-zinc-600">{documentTitle}</span>.
                </span>
                {isSigned && (
                  <span className="shrink-0 text-[10px] font-mono bg-zinc-900 border border-zinc-800 text-zinc-400 px-2 py-0.5 rounded flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5 text-zinc-500" />
                    Locked & Irrevocable
                  </span>
                )}
              </div>
              <span className="text-zinc-400 text-[11px]">
                Checking this box constitutes my lawful, legally binding digital signature. Electing not to read this document prior to participation does not invalidate assent; I irrevocably waive all claims of lack of notice, and agree to bear 100% sole personal, moral (sins/gunah), and legal responsibility. Platform operators and administrators remain wholly blameless and fully indemnified.
              </span>
            </div>
          </label>
        </div>

        {/* Verified Electronic Certificate & Full Audit Docket */}
        {mounted && isSigned ? (
          <div className="bg-[#0a0a0d] border border-zinc-800 rounded-xl p-4 sm:p-6 space-y-4 font-mono text-xs animate-in fade-in duration-300">
            
            {/* Certificate Header Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-zinc-800/80">
              <div className="flex items-center gap-2 text-zinc-200 font-semibold text-xs tracking-wider uppercase">
                <Fingerprint className="w-4 h-4 text-zinc-400" />
                <span>Electronic Signature Certificate</span>
              </div>
              <div className="text-[11px] text-zinc-400">
                DOC REF: <span className="text-zinc-200 font-bold">{docRefCode}</span>
              </div>
            </div>

            {/* Prominent Handwritten / Cursive Digital Signature Section */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-zinc-950 via-[#111115] to-zinc-950 border border-zinc-800 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-mono block">
                  Official Digital Signature (Assent Execution)
                </span>
                {/* Styled Cursive Signature */}
                <div 
                  className="font-signature text-2xl sm:text-3xl text-zinc-100 mt-1 select-none tracking-wide"
                  style={{ fontFamily: "'Dancing Script', 'Brush Script MT', 'Segoe Script', cursive" }}
                >
                  I Accept &amp; Legally Attest
                </div>
                <div className="w-44 sm:w-56 h-[1px] bg-zinc-700/80 mt-1 mb-1" />
                <span className="text-[10px] text-zinc-500 font-mono">
                  Cryptographically Bound Signatory Assent
                </span>
              </div>

              {/* Verified Green Signatory Seal */}
              <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold shrink-0 self-start md:self-auto shadow-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>OFFICIALLY SIGNED &amp; SEALED</span>
              </div>
            </div>

            {/* Comprehensive A-to-Z Metadata Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
              
              {/* 1. Device Hardware Name */}
              <div className="bg-zinc-900/60 border border-zinc-800/80 p-3 rounded-lg flex flex-col justify-between">
                <div className="text-[10px] text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Laptop className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Signatory Device</span>
                </div>
                <div className="text-zinc-100 font-bold text-xs mt-1 truncate" title={deviceInfo.deviceName}>
                  {deviceInfo.deviceName}
                </div>
                <div className="text-[10px] text-zinc-400 mt-0.5">
                  {deviceInfo.browser}
                </div>
              </div>

              {/* 2. Full Date & Day */}
              <div className="bg-zinc-900/60 border border-zinc-800/80 p-3 rounded-lg flex flex-col justify-between">
                <div className="text-[10px] text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Attestation Date</span>
                </div>
                <div className="text-zinc-100 font-bold text-xs mt-1 truncate" title={calendarDate}>
                  {calendarDate || 'Logged Session Date'}
                </div>
                <div className="text-[10px] text-zinc-400 mt-0.5">
                  Timezone: {deviceInfo.timezone}
                </div>
              </div>

              {/* 3. Exact Time (UTC + Local Clock) */}
              <div className="bg-zinc-900/60 border border-zinc-800/80 p-3 rounded-lg flex flex-col justify-between">
                <div className="text-[10px] text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Exact Time Recorded</span>
                </div>
                <div className="text-zinc-100 font-bold text-xs mt-1 truncate">
                  {localTimestamp} (Local)
                </div>
                <div className="text-[10px] text-zinc-400 mt-0.5 truncate" title={utcTimestamp}>
                  {utcTimestamp || 'UTC Verified'}
                </div>
              </div>

              {/* 4. Audit Session Token */}
              <div className="bg-zinc-900/60 border border-zinc-800/80 p-3 rounded-lg flex flex-col justify-between">
                <div className="text-[10px] text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Audit Session Token</span>
                </div>
                <div className="text-zinc-200 font-bold text-[11px] mt-1 truncate font-mono" title={trackerId}>
                  {trackerId}
                </div>
                <div className="text-[10px] text-zinc-400 mt-0.5">
                  Persistent Cookie Telemetry
                </div>
              </div>

              {/* 5. Screen & Display Environment */}
              <div className="bg-zinc-900/60 border border-zinc-800/80 p-3 rounded-lg flex flex-col justify-between">
                <div className="text-[10px] text-zinc-400 uppercase tracking-wider">
                  Screen Environment
                </div>
                <div className="text-zinc-200 font-bold text-xs mt-1">
                  {deviceInfo.screenRes}
                </div>
                <div className="text-[10px] text-zinc-400 mt-0.5">
                  Platform: {deviceInfo.platform}
                </div>
              </div>

              {/* 6. Regulatory Framework */}
              <div className="bg-zinc-900/60 border border-zinc-800/80 p-3 rounded-lg flex flex-col justify-between">
                <div className="text-[10px] text-zinc-400 uppercase tracking-wider">
                  Governing Framework
                </div>
                <div className="text-zinc-200 font-bold text-xs mt-1">
                  ESIGN (15 U.S.C. § 7001) / UETA
                </div>
                <div className="text-[10px] text-zinc-400 mt-0.5">
                  Admissible &amp; Non-Repudiable
                </div>
              </div>

            </div>

            {/* Evidentiary Notice & Digital Seal Footer */}
            <div className="pt-3 border-t border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[10.5px] text-zinc-400">
              <p className="leading-relaxed">
                Legally admissible digital record under federal and international electronic commerce statutes. Permanent audit record synchronized with platform security infrastructure.
              </p>
              <div className="shrink-0 flex items-center gap-1.5 text-zinc-300 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-zinc-300" />
                <span>TAMPER-EVIDENT SESSION RECORD</span>
              </div>
            </div>

          </div>
        ) : (
          <div className="text-[11px] text-zinc-400 flex items-center gap-2 pt-1">
            <Scale className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            <span>Click the declaration box above to execute your irrevocable digital signature and generate your verified audit certificate.</span>
          </div>
        )}

      </div>
    </div>
  );
}
