const fs = require('fs');
const path = "d:/_Xpig/frontend/src/app/(main)/watch/[id]/WatchClient.tsx";
let code = fs.readFileSync(path, 'utf8');

if (!code.includes('import WatchPageSkeleton')) {
  code = code.replace("import AdCard from '@/components/ads/AdCard';", "import AdCard from '@/components/ads/AdCard';\nimport WatchPageSkeleton from '@/components/skeletons/WatchPageSkeleton';");
}

const oldLoader = 'if (isLoading) return <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white">Loading...</div>;';
const newLoader = 'if (isLoading) return <WatchPageSkeleton />;';

if (code.includes(oldLoader)) {
  code = code.replace(oldLoader, newLoader);
} else {
  code = code.replace(oldLoader.replace(/\n/g, '\r\n'), newLoader);
}

fs.writeFileSync(path, code);
console.log("Updated WatchClient.tsx");
