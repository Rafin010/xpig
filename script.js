const fs = require('fs');

const path = "d:/_Xpig/frontend/src/app/(main)/watch/[id]/WatchClient.tsx";
let code = fs.readFileSync(path, 'utf8');

// Extract the Related Videos block
const relatedStart = code.indexOf('          {/* Related Videos Section */}');
const relatedEnd = code.indexOf('          </div> {/* End Mobile Padding Wrapper */}');

if (relatedStart === -1 || relatedEnd === -1) {
  console.log("Could not find blocks");
  process.exit(1);
}

const relatedBlock = code.substring(relatedStart, relatedEnd);

// Remove it from the current location
code = code.substring(0, relatedStart) + code.substring(relatedEnd);

// Find the end of the grid (after Right Col)
const gridEndRegex = /        <\/div>\r?\n\s*<\/div>\r?\n\s*<\/div>\r?\n\s*\);\r?\n\}/;
const match = code.match(gridEndRegex);

if (!match) {
  console.log("Could not find end of grid");
  process.exit(1);
}

const injectionPoint = match.index + match[0].indexOf('      </div>\n    </div>') > -1 ? 
                       match.index + match[0].indexOf('      </div>\n    </div>') : 
                       match.index + match[0].indexOf('      </div>\r\n    </div>');

// Inject the block wrapping it with a max-w container if needed, but it's already inside a max-w container? 
// No, the grid is inside `<div className="max-w-[1400px] mx-auto...`
// Wait, looking at the layout:
/*
    <div className="min-h-screen bg-black md:px-8 text-white pb-20 pt-4 md:pt-6">
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-3 gap-0 md:gap-8">
        <div className="lg:col-span-2">
           <div className="px-4 md:px-0">
             // details
           </div>
        </div>
        <div className="lg:col-span-1 space-y-6">
        </div>
      </div>
    </div>
*/
const modifiedRelatedBlock = `\n      {/* Full Width Related Videos Section */}\n      <div className="max-w-[1400px] mx-auto px-4 md:px-0">\n` + relatedBlock.replace(/          /g, '        ') + `      </div>\n`;

// Let's just do a simple replacement to place it right after the grid closes.
// The grid closes at `      </div>\n    </div>\n  );\n}`
const targetClose = '      </div>\n    </div>';
const targetCloseCRLF = '      </div>\r\n    </div>';

if (code.includes(targetClose)) {
  code = code.replace(targetClose, '      </div>\n' + modifiedRelatedBlock + '    </div>');
  fs.writeFileSync(path, code);
  console.log("Updated with LF");
} else if (code.includes(targetCloseCRLF)) {
  code = code.replace(targetCloseCRLF, '      </div>\r\n' + modifiedRelatedBlock + '    </div>');
  fs.writeFileSync(path, code);
  console.log("Updated with CRLF");
} else {
  console.log("Could not replace target close.");
}

