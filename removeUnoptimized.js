const fs = require('fs');

function removeUnoptimized(filePath) {
    let code = fs.readFileSync(filePath, 'utf8');
    code = code.replace(/ unoptimized \/>/g, ' />');
    fs.writeFileSync(filePath, code);
    console.log("Removed unoptimized from " + filePath);
}

removeUnoptimized("d:/_Xpig/frontend/src/components/video/VideoCard.tsx");
removeUnoptimized("d:/_Xpig/frontend/src/components/ads/AdCard.tsx");
removeUnoptimized("d:/_Xpig/frontend/src/components/ads/TopAdBanner.tsx");
