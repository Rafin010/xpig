const fs = require('fs');
const path = "d:/_Xpig/frontend/src/components/layout/Sidebar.tsx";
let code = fs.readFileSync(path, 'utf8');

// Ensure next/image and next/link are imported if not
if (!code.includes("import Image from 'next/image';")) {
    code = code.replace("import { usePathname }", "import Image from 'next/image';\nimport { usePathname }");
}
if (!code.includes("import Link from 'next/link';")) {
    code = code.replace("import { usePathname }", "import Link from 'next/link';\nimport { usePathname }");
}

const oldSettingsItem = `<NavItem icon={Settings} label="Settings" href="/settings" />`;
const newSettingsAndSupport = `<NavItem icon={Settings} label="Settings" href="/settings" />
          
          <Link 
            href="/support"
            className="group flex items-center px-4 py-3 rounded-2xl transition-all duration-300 font-bold text-sm text-zinc-400 hover:bg-[#222] hover:text-white w-full"
            title={isCollapsed ? "Support Us" : undefined}
          >
            <div className="w-5 h-5 flex-shrink-0 flex items-center justify-center">
              <Image 
                src="/pig-logo.png" 
                alt="Support" 
                width={20} 
                height={20} 
                className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-125"
              />
            </div>
            {!isCollapsed && <span className="ml-4">Support</span>}
          </Link>`;

if (code.includes(oldSettingsItem)) {
    code = code.replace(oldSettingsItem, newSettingsAndSupport);
} else {
    code = code.replace(oldSettingsItem.replace(/\n/g, '\r\n'), newSettingsAndSupport);
}

fs.writeFileSync(path, code);
console.log("Updated Sidebar.tsx with Support button");
