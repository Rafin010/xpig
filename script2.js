const fs = require('fs');

const path = "d:/_Xpig/frontend/src/app/(main)/watch/[id]/WatchClient.tsx";
let code = fs.readFileSync(path, 'utf8');

// 1. Add import if not present
if (!code.includes('import VideoCard')) {
  code = code.replace("import { PlayCircle, ThumbsUp, Eye, CheckCircle2 } from 'lucide-react';", 
    "import { PlayCircle, ThumbsUp, Eye, CheckCircle2 } from 'lucide-react';\nimport VideoCard from '@/components/video/VideoCard';");
}

// 2. Change grid columns to max 4
code = code.replace(/xl:grid-cols-5 2xl:grid-cols-6/g, "xl:grid-cols-4 2xl:grid-cols-4");

// 3. Replace the inner map with VideoCard
const mapRegex = /\{relatedVideos\.map\(\(video\) => \([\s\S]*?\)\)\}/;
const replacement = `{relatedVideos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}`;

code = code.replace(mapRegex, replacement);

fs.writeFileSync(path, code);
console.log("Updated WatchClient.tsx");
