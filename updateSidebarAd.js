const fs = require('fs');
const path = "d:/_Xpig/frontend/src/components/layout/Sidebar.tsx";
let code = fs.readFileSync(path, 'utf8');

const oldSettingsItem = `<NavItem icon={Settings} label="Settings" href="/settings" />`;

const newAdvertiseItem = `<NavItem icon={Settings} label="Settings" href="/settings" />
          <a 
            href="mailto:info@xpig.me?subject=Business%20and%20Advertising%20Inquiry"
            className="flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 font-bold text-sm text-pink-400 hover:bg-pink-500/10 hover:text-pink-300 w-full"
            title={isCollapsed ? "Advertise" : undefined}
          >
            <div className="w-5 h-5 flex-shrink-0 flex items-center justify-center">
              <span className="text-lg leading-none">🚀</span>
            </div>
            {!isCollapsed && <span>Advertise with us</span>}
          </a>`;

if (code.includes(oldSettingsItem)) {
    code = code.replace(oldSettingsItem, newAdvertiseItem);
    fs.writeFileSync(path, code);
    console.log("Updated Sidebar.tsx");
} else {
    // Try CRLF
    code = code.replace(oldSettingsItem.replace(/\n/g, '\r\n'), newAdvertiseItem);
    fs.writeFileSync(path, code);
    console.log("Updated Sidebar.tsx (CRLF)");
}
