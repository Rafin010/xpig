'use client';
import { useState } from 'react';
import { Save, Settings2, Globe, Shield, CreditCard, HardDrive, Mail, Bell, CheckCircle2 } from 'lucide-react';

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }, 1500);
  };

  const tabs = [
    { id: 'general', label: 'General & SEO', icon: Globe },
    { id: 'monetization', label: 'Monetization & Ads', icon: CreditCard },
    { id: 'security', label: 'Trust & Safety', icon: Shield },
    { id: 'storage', label: 'CDN & Storage', icon: HardDrive },
    { id: 'mail', label: 'SMTP & Emails', icon: Mail },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-zinc-800/50 pb-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <Settings2 className="w-8 h-8 text-pink-500" /> System Configuration
          </h1>
          <p className="text-zinc-400 mt-1">Manage global platform settings, security, and infrastructure.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold transition-all shadow-lg ${
            saved 
            ? 'bg-green-500 text-white shadow-green-900/20' 
            : 'bg-pink-600 hover:bg-pink-500 text-white shadow-pink-900/20 disabled:opacity-70'
          }`}
        >
          {isSaving ? (
            <><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> Saving...</>
          ) : saved ? (
            <><CheckCircle2 className="w-5 h-5" /> Saved Successfully</>
          ) : (
            <><Save className="w-5 h-5" /> Save Changes</>
          )}
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sidebar Tabs */}
        <div className="w-full md:w-64 shrink-0 space-y-2">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-semibold transition-all text-sm ${
                  activeTab === tab.id 
                  ? 'bg-pink-600 text-white shadow-lg shadow-pink-900/20' 
                  : 'bg-[#111] text-zinc-400 hover:bg-[#1a1a1a] hover:text-white border border-zinc-800/50'
                }`}
              >
                <Icon className="w-5 h-5" /> {tab.label}
              </button>
            )
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-[#111] border border-zinc-800/50 rounded-2xl p-6 md:p-8 shadow-xl">
          <form onSubmit={handleSave} className="space-y-8">
            
            {/* GENERAL TAB */}
            {activeTab === 'general' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <h2 className="text-xl font-bold text-white mb-6 border-b border-zinc-800/50 pb-4">General & SEO Settings</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-zinc-300">Platform Name</label>
                    <input type="text" defaultValue="XPIG Network" className="w-full bg-[#1a1a1a] border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-pink-600 transition-colors" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-zinc-300">Primary Domain URL</label>
                    <input type="url" defaultValue="https://xpig.me" className="w-full bg-[#1a1a1a] border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-pink-600 transition-colors" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-zinc-300">Global SEO Description</label>
                  <textarea rows={3} defaultValue="The ultimate premium entertainment platform..." className="w-full bg-[#1a1a1a] border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-pink-600 transition-colors resize-none"></textarea>
                </div>

                <div className="flex items-center justify-between p-5 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                  <div>
                    <h4 className="font-bold text-amber-500">Maintenance Mode</h4>
                    <p className="text-sm text-amber-500/80 mt-1">Enable this to lock out all non-admin users. Displays a "Site Under Construction" page.</p>
                  </div>
                  <button type="button" className="w-14 h-7 rounded-full bg-zinc-800 relative transition-colors">
                    <div className="w-5 h-5 bg-zinc-500 rounded-full absolute top-1 left-1 transition-transform" />
                  </button>
                </div>
              </div>
            )}

            {/* MONETIZATION TAB */}
            {activeTab === 'monetization' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <h2 className="text-xl font-bold text-white mb-6 border-b border-zinc-800/50 pb-4">Monetization & Revenue</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-zinc-300">Creator Revenue Share (%)</label>
                    <div className="relative">
                      <input type="number" defaultValue="70" className="w-full bg-[#1a1a1a] border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-pink-600 transition-colors" />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 font-bold">%</span>
                    </div>
                    <p className="text-xs text-zinc-500">Percentage of ad/sub revenue paid out to creators.</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-zinc-300">Minimum Payout Threshold</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-bold">$</span>
                      <input type="number" defaultValue="100.00" className="w-full bg-[#1a1a1a] border border-zinc-800 rounded-xl pl-8 pr-4 py-3 text-white focus:outline-none focus:border-pink-600 transition-colors" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-4">
                  <h3 className="text-sm font-bold text-white">Default Ad Frequency</h3>
                  <div className="p-4 bg-[#1a1a1a] border border-zinc-800 rounded-xl space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-zinc-300 font-medium">Force Pre-roll Ads on Free Videos</span>
                      <button type="button" className="w-12 h-6 rounded-full bg-pink-600 relative transition-colors">
                        <div className="w-4 h-4 bg-white rounded-full absolute top-1 translate-x-7 transition-transform" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-zinc-300 font-medium">Mid-roll Ad Interval (minutes)</span>
                      <input type="number" defaultValue="15" className="w-24 bg-[#222] border border-zinc-700 rounded-lg px-3 py-1.5 text-center text-white focus:outline-none focus:border-pink-500" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SECURITY TAB */}
            {activeTab === 'security' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <h2 className="text-xl font-bold text-white mb-6 border-b border-zinc-800/50 pb-4">Trust & Safety</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-[#1a1a1a] border border-zinc-800 rounded-xl">
                    <div>
                      <h4 className="font-bold text-white text-sm">Strict Content Moderation</h4>
                      <p className="text-xs text-zinc-400 mt-1">All newly uploaded videos must be manually approved by admins before going public.</p>
                    </div>
                    <button type="button" className="w-12 h-6 rounded-full bg-pink-600 relative transition-colors shrink-0">
                      <div className="w-4 h-4 bg-white rounded-full absolute top-1 translate-x-7 transition-transform" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-[#1a1a1a] border border-zinc-800 rounded-xl">
                    <div>
                      <h4 className="font-bold text-white text-sm">Require Email Verification</h4>
                      <p className="text-xs text-zinc-400 mt-1">Users cannot upload content or leave comments until their email is verified.</p>
                    </div>
                    <button type="button" className="w-12 h-6 rounded-full bg-pink-600 relative transition-colors shrink-0">
                      <div className="w-4 h-4 bg-white rounded-full absolute top-1 translate-x-7 transition-transform" />
                    </button>
                  </div>
                  
                  <div className="space-y-2 pt-2">
                    <label className="text-sm font-semibold text-zinc-300">Banned IP Addresses</label>
                    <textarea rows={4} placeholder="Enter IP addresses separated by commas..." className="w-full bg-[#1a1a1a] border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-pink-600 transition-colors resize-none font-mono text-sm"></textarea>
                  </div>
                </div>
              </div>
            )}

            {/* CDN / STORAGE TAB */}
            {activeTab === 'storage' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <h2 className="text-xl font-bold text-white mb-6 border-b border-zinc-800/50 pb-4">CDN & Cloud Storage</h2>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-zinc-300">Storage Provider</label>
                    <select className="w-full bg-[#1a1a1a] border border-zinc-800 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-pink-600 transition-colors">
                      <option>Amazon S3 (AWS)</option>
                      <option>Cloudflare R2</option>
                      <option>Google Cloud Storage</option>
                      <option>Local Server Disk (Not Recommended)</option>
                    </select>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-zinc-300">Bucket Name</label>
                      <input type="text" defaultValue="xpig-video-assets-prod" className="w-full bg-[#1a1a1a] border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-pink-600 transition-colors font-mono text-sm" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-zinc-300">CDN URL</label>
                      <input type="url" defaultValue="https://cdn.xpig.me" className="w-full bg-[#1a1a1a] border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-pink-600 transition-colors font-mono text-sm" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-zinc-300">Access Key ID</label>
                      <input type="password" defaultValue="*****************" className="w-full bg-[#1a1a1a] border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-pink-600 transition-colors font-mono text-sm" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-zinc-300">Secret Access Key</label>
                      <input type="password" defaultValue="*****************" className="w-full bg-[#1a1a1a] border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-pink-600 transition-colors font-mono text-sm" />
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* MAIL TAB */}
            {activeTab === 'mail' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <h2 className="text-xl font-bold text-white mb-6 border-b border-zinc-800/50 pb-4">SMTP & Email Configuration</h2>
                <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl text-sm text-zinc-400 mb-6">
                  Configure the mail server used to send password resets, welcome emails, and creator payout notifications.
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-zinc-300">SMTP Host</label>
                    <input type="text" defaultValue="smtp.mailgun.org" className="w-full bg-[#1a1a1a] border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-pink-600 transition-colors font-mono text-sm" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-zinc-300">SMTP Port</label>
                    <input type="number" defaultValue="587" className="w-full bg-[#1a1a1a] border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-pink-600 transition-colors font-mono text-sm" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-zinc-300">SMTP Username</label>
                    <input type="text" defaultValue="postmaster@xpig.me" className="w-full bg-[#1a1a1a] border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-pink-600 transition-colors font-mono text-sm" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-zinc-300">SMTP Password</label>
                    <input type="password" defaultValue="*****************" className="w-full bg-[#1a1a1a] border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-pink-600 transition-colors font-mono text-sm" />
                  </div>
                </div>
              </div>
            )}

          </form>
        </div>

      </div>
    </div>
  );
}
