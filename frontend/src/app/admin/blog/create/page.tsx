'use client';
import { useState } from 'react';
import { FileText, Image as ImageIcon, Link as LinkIcon, Send, Settings2, Hash, AlertCircle } from 'lucide-react';

export default function CreateBlogPage() {
  const [isPublishing, setIsPublishing] = useState(false);

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    setIsPublishing(true);
    setTimeout(() => setIsPublishing(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4 border-b border-zinc-800/50 pb-6">
        <div>
          <div className="px-3 py-1 bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 mb-3 w-fit">
            <FileText className="w-3.5 h-3.5" /> SEO Blog Engine
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Create SEO Blog Post</h1>
          <p className="text-zinc-400 mt-1">Publish content to the blog subdomain to generate internal backlinks and boost platform SEO.</p>
        </div>
      </div>

      <form onSubmit={handlePublish} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#111] border border-zinc-800/50 rounded-2xl p-6 md:p-8 shadow-xl space-y-6">
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-300 block">Blog Title</label>
              <input required type="text" placeholder="e.g. Top 10 Best Premium Videos of 2026..." className="w-full bg-[#1a1a1a] border border-zinc-800 rounded-xl px-4 py-3.5 text-white text-lg font-medium focus:outline-none focus:border-pink-600 transition-colors" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-pink-500" /> Target Backlink URL (SEO)
              </label>
              <input required type="url" placeholder="https://xpig.com/watch/video-id" className="w-full bg-[#1a1a1a] border border-zinc-800 rounded-xl px-4 py-3 text-pink-400 focus:outline-none focus:border-pink-600 transition-colors" />
              <p className="text-xs text-zinc-500 mt-1">The main "Watch Video" button in the blog will point to this URL to pass SEO juice.</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-300 block">Blog Content (Rich Text)</label>
              <div className="border border-zinc-800 rounded-xl overflow-hidden bg-[#1a1a1a] flex flex-col">
                <div className="h-10 bg-[#222] border-b border-zinc-800 flex items-center px-2 gap-1">
                  <button type="button" className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded"><b className="font-serif">B</b></button>
                  <button type="button" className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded"><i className="font-serif">I</i></button>
                  <button type="button" className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded"><u className="font-serif">U</u></button>
                  <div className="w-px h-4 bg-zinc-700 mx-2"></div>
                  <button type="button" className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded"><LinkIcon className="w-4 h-4" /></button>
                  <button type="button" className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded"><ImageIcon className="w-4 h-4" /></button>
                </div>
                <textarea required rows={12} placeholder="Write your blog post here..." className="w-full bg-transparent p-4 text-zinc-300 focus:outline-none resize-y min-h-[200px]"></textarea>
              </div>
            </div>

          </div>
        </div>

        {/* Sidebar Sidebar */}
        <div className="space-y-6">
          
          <div className="bg-[#111] border border-zinc-800/50 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-zinc-800/50 pb-4">
              <ImageIcon className="w-5 h-5 text-purple-500" /> Photo Card
            </h3>
            
            <div className="border-2 border-dashed border-zinc-800 hover:border-pink-500/50 bg-[#1a1a1a] rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors text-center aspect-video">
              <ImageIcon className="w-10 h-10 text-zinc-500 mb-3" />
              <span className="text-sm font-bold text-white mb-1">Upload Thumbnail</span>
              <span className="text-xs text-zinc-500">JPG, PNG or WEBP<br/>(16:9 ratio recommended)</span>
            </div>
            <p className="text-xs text-zinc-500 text-center">This image will appear on the blog subdomain homepage and when shared on social media.</p>
          </div>

          <div className="bg-[#111] border border-zinc-800/50 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-zinc-800/50 pb-4">
              <Settings2 className="w-5 h-5 text-emerald-500" /> SEO Settings
            </h3>
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-300 block">Focus Keywords</label>
              <input type="text" placeholder="e.g. premium, videos, free" className="w-full bg-[#1a1a1a] border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-pink-600 transition-colors" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-300 block">Meta Description</label>
              <textarea rows={3} placeholder="Brief summary for search engines..." className="w-full bg-[#1a1a1a] border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-pink-600 transition-colors resize-none"></textarea>
            </div>
          </div>

          {/* Action */}
          <button 
            type="submit" 
            disabled={isPublishing}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-pink-600 hover:bg-pink-500 text-white rounded-xl font-bold text-lg transition-all shadow-lg shadow-pink-900/20 disabled:opacity-70"
          >
            {isPublishing ? (
              <><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> Publishing...</>
            ) : (
              <><Send className="w-5 h-5" /> Publish to Blog</>
            )}
          </button>
          
        </div>

      </form>
    </div>
  );
}
