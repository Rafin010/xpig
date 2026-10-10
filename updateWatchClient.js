const fs = require('fs');

const path = "d:/_Xpig/frontend/src/app/(main)/watch/[id]/WatchClient.tsx";
let code = fs.readFileSync(path, 'utf8');

if (!code.includes('import AdCard')) {
  code = code.replace("import VideoCard from '@/components/video/VideoCard';", "import VideoCard from '@/components/video/VideoCard';\nimport AdCard from '@/components/ads/AdCard';");
}

if (!code.includes('<AdCard key="ad1" />')) {
  code = code.replace("{relatedVideos.map((video) => (", "<AdCard key=\"ad1\" />\n            <AdCard key=\"ad2\" />\n            {relatedVideos.map((video) => (");
}

fs.writeFileSync(path, code);
console.log("Updated WatchClient.tsx");
