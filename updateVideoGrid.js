const fs = require('fs');

const path = "d:/_Xpig/frontend/src/components/video/VideoGrid.tsx";
let code = fs.readFileSync(path, 'utf8');

if (!code.includes('import AdCard')) {
  code = code.replace("import VideoCard from './VideoCard';", "import VideoCard from './VideoCard';\nimport AdCard from '../ads/AdCard';");
}

// Replace `{videos.map((video) => (` with:
// `<AdCard key="ad1" />\n<AdCard key="ad2" />\n{videos.map((video) => (`

if (!code.includes('<AdCard key="ad1" />')) {
  code = code.replace("{videos.map((video) => (", "<AdCard key=\"ad1\" />\n        <AdCard key=\"ad2\" />\n        {videos.map((video) => (");
}

fs.writeFileSync(path, code);
console.log("Updated VideoGrid.tsx");
