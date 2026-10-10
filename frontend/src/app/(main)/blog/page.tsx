import Link from 'next/link';
import { FileText, Calendar, ArrowRight } from 'lucide-react';

export const instant = false;

async function getBlogs() {
  
  try {
    const res = await fetch('https://xpig.onrender.com/api/v1/blogs', { cache: 'no-store' });
    if (!res.ok) return [];
    return await res.json();
  } catch (err) {
    return [];
  }
}

export default async function BlogIndexPage() {
  const blogs = await getBlogs();

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-20">
      
      {/* Hero Section */}
      <div className="bg-[#111] border-b border-zinc-800/50 py-16 px-4 md:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center justify-center p-3 bg-pink-500/10 rounded-full mb-6">
            <FileText className="w-8 h-8 text-pink-500" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">Official XPIG Blog</h1>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
            Insights, Creator Tips, Platform Updates, and exclusive premium entertainment news.
          </p>
        </div>
      </div>

      {/* Blog Grid */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogs.length === 0 && <p className="text-zinc-500">No blog posts yet.</p>}
          {blogs.map((post: any) => (
            <Link key={post.id} href={`/blog/${post.slug}`} className="group flex flex-col bg-[#111] rounded-2xl overflow-hidden border border-zinc-800/50 hover:border-pink-500/50 transition-colors shadow-lg">
              
              {/* Thumbnail */}
              <div className="w-full aspect-video overflow-hidden relative bg-zinc-900">
                <img 
                  src={post.thumbnail} 
                  alt={post.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className="px-2.5 py-1 bg-black/60 backdrop-blur border border-white/10 rounded text-[10px] font-bold text-white uppercase tracking-wider">
                    {post.keywords[0]}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500 mb-3">
                  <Calendar className="w-3.5 h-3.5" /> {post.date}
                </div>
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-pink-400 transition-colors line-clamp-2">
                  {post.title}
                </h3>
                <p className="text-zinc-400 text-sm mb-6 line-clamp-3 flex-1">
                  {post.excerpt}
                </p>
                
                <div className="flex items-center justify-between text-sm mt-auto pt-4 border-t border-zinc-800/50">
                  <span className="font-semibold text-zinc-300">By {post.author}</span>
                  <span className="text-pink-500 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    Read More <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
}

