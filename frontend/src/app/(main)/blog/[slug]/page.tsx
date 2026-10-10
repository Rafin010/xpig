import Link from 'next/link';
import { Calendar, User, Tag, ArrowLeft, PlayCircle, Share2, Link as LinkIcon } from 'lucide-react';

export const instant = false;

async function getBlogPost(slug: string) {
  if (process.env.VERCEL) return null;
  try {
    const res = await fetch(`http://127.0.0.1:8000/api/v1/blogs/${slug}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    return null;
  }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  const post = await getBlogPost(slug);

  if (!post) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-4xl font-black text-white mb-4">Blog Post Not Found</h1>
        <p className="text-zinc-400 mb-8">The article you are looking for does not exist or has been removed.</p>
        <Link href="/blog" className="px-6 py-3 bg-pink-600 hover:bg-pink-500 text-white rounded-xl font-bold transition-all">Back to Blog</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] pb-20">
      
      {/* Article Header (Thumbnail Parallax style) */}
      <div className="w-full h-[40vh] md:h-[50vh] relative overflow-hidden bg-black">
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/60 to-transparent z-10"></div>
        <img src={post.thumbnail} alt={post.title} className="w-full h-full object-cover opacity-60" />
        
        <div className="absolute bottom-0 left-0 right-0 z-20 px-4 md:px-8 pb-12">
          <div className="max-w-4xl mx-auto">
            <Link href="/blog" className="inline-flex items-center gap-1.5 text-zinc-400 hover:text-white text-sm font-semibold mb-6 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to all articles
            </Link>
            <div className="flex flex-wrap gap-2 mb-4">
              {post.keywords.map((kw: string) => (
                <span key={kw} className="px-3 py-1 bg-pink-500/20 text-pink-400 border border-pink-500/20 rounded-full text-xs font-bold uppercase tracking-wider">
                  {kw}
                </span>
              ))}
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight mb-6">
              {post.title}
            </h1>
            <div className="flex flex-wrap items-center gap-6 text-sm font-semibold text-zinc-400">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-white"><User className="w-4 h-4"/></div>
                {post.author}
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" /> {post.date}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 md:px-8 pt-12 flex flex-col lg:flex-row gap-12">
        
        {/* Main Content */}
        <article className="flex-1">
          {/* SEO Targeted Backlink Highlight Box */}
          <div className="mb-10 p-6 bg-gradient-to-r from-pink-900/20 to-purple-900/20 border border-pink-500/20 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                <PlayCircle className="w-5 h-5 text-pink-500" /> Watch the Full Video
              </h3>
              <p className="text-sm text-zinc-400">Unlock the premium content referenced in this article.</p>
            </div>
            <a 
              href={post.targetUrl} 
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 px-6 py-3 bg-pink-600 hover:bg-pink-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-pink-900/20 text-center"
            >
              Watch on XPIG
            </a>
          </div>

          <div 
            className="prose prose-invert prose-pink max-w-none prose-p:text-zinc-300 prose-p:leading-relaxed prose-p:mb-6 prose-h2:text-2xl prose-h2:font-bold prose-h2:text-white prose-h2:mb-4 prose-h2:mt-10"
            dangerouslySetInnerHTML={{ __html: post.content }}
          ></div>

          {/* Bottom Backlink (For maximum SEO juice) */}
          <div className="mt-12 pt-8 border-t border-zinc-800/50">
            <h4 className="text-white font-bold mb-4">Related Link</h4>
            <a 
              href={post.targetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-pink-400 hover:text-pink-300 font-medium transition-colors"
            >
              <LinkIcon className="w-4 h-4" /> {post.targetUrl}
            </a>
          </div>
        </article>

        {/* Sidebar Social Share */}
        <aside className="w-full lg:w-64 shrink-0 space-y-8">
          <div className="bg-[#111] border border-zinc-800/50 rounded-2xl p-6 sticky top-24">
            <h4 className="font-bold text-white mb-4 flex items-center gap-2">
              <Share2 className="w-4 h-4 text-zinc-400" /> Share Article
            </h4>
            <div className="flex flex-col gap-3">
              <button className="flex items-center justify-center gap-2 w-full py-2.5 bg-[#1877F2]/10 hover:bg-[#1877F2]/20 text-[#1877F2] rounded-xl font-semibold transition-colors">
                Facebook
              </button>
              <button className="flex items-center justify-center gap-2 w-full py-2.5 bg-[#1DA1F2]/10 hover:bg-[#1DA1F2]/20 text-[#1DA1F2] rounded-xl font-semibold transition-colors">
                Twitter
              </button>
              <button className="flex items-center justify-center gap-2 w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-semibold transition-colors">
                <LinkIcon className="w-4 h-4" /> Copy Link
              </button>
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
}


