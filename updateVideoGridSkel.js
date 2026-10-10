const fs = require('fs');

const path = "d:/_Xpig/frontend/src/components/video/VideoGrid.tsx";
let code = fs.readFileSync(path, 'utf8');

if (!code.includes('import VideoCardSkeleton')) {
  code = code.replace("import AdCard from '../ads/AdCard';", "import AdCard from '../ads/AdCard';\nimport VideoCardSkeleton from '../skeletons/VideoCardSkeleton';");
}

const emptyState = `{videos.length === 0 && !loading ? (
        <div className="text-zinc-500 flex flex-col items-center justify-center py-20">
          <p>No videos found for this category.</p>
        </div>
      ) : (`;

const newLoadingState = `{videos.length === 0 && loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
          {[...Array(12)].map((_, i) => <VideoCardSkeleton key={i} />)}
        </div>
      ) : videos.length === 0 && !loading ? (
        <div className="text-zinc-500 flex flex-col items-center justify-center py-20">
          <p>No videos found for this category.</p>
        </div>
      ) : (`;

if (code.includes(emptyState)) {
  code = code.replace(emptyState, newLoadingState);
} else {
  // Try CRLF
  code = code.replace(emptyState.replace(/\n/g, '\r\n'), newLoadingState);
}

// Remove the bottom spinner if it's initial load (length === 0), keep spinner if loading more
// actually it's fine, if videos.length > 0 it shows the spinner at the bottom.
// Wait, the bottom spinner is `{loading && (`
const oldSpinner = `{loading && (
        <div className="flex justify-center py-8">
          <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
        </div>
      )}`;
const newSpinner = `{loading && videos.length > 0 && (
        <div className="flex justify-center py-8">
          <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
        </div>
      )}`;
if (code.includes(oldSpinner)) {
  code = code.replace(oldSpinner, newSpinner);
} else {
  code = code.replace(oldSpinner.replace(/\n/g, '\r\n'), newSpinner);
}

fs.writeFileSync(path, code);
console.log("Updated VideoGrid.tsx");
