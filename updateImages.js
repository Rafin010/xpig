const fs = require('fs');

function replaceImgWithImage(filePath) {
    let code = fs.readFileSync(filePath, 'utf8');
    
    // Add import if needed
    if (!code.includes("import Image from 'next/image';")) {
        code = "import Image from 'next/image';\n" + code;
    }
    
    // VideoCard has a <img> for thumbnail
    // <img src={video.thumbnail_url || "..."} alt={video.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
    code = code.replace(
        /<img([^>]+)src=\{([^}]+)\}([^>]+)>/g,
        '<Image$1src={$2}$3 fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" unoptimized />'
    );
    // Handle string src
    code = code.replace(
        /<img([^>]+)src="([^"]+)"([^>]+)>/g,
        '<Image$1src="$2"$3 fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" unoptimized />'
    );
    
    fs.writeFileSync(filePath, code);
    console.log("Updated " + filePath);
}

replaceImgWithImage("d:/_Xpig/frontend/src/components/video/VideoCard.tsx");
replaceImgWithImage("d:/_Xpig/frontend/src/components/ads/AdCard.tsx");
replaceImgWithImage("d:/_Xpig/frontend/src/components/ads/TopAdBanner.tsx");
