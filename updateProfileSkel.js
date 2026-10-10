const fs = require('fs');
const path = "d:/_Xpig/frontend/src/app/(main)/profile/page.tsx";
let code = fs.readFileSync(path, 'utf8');

if (!code.includes('import ProfileSkeleton')) {
  code = code.replace("import { useAuth } from '@/context/AuthContext';", "import { useAuth } from '@/context/AuthContext';\nimport ProfileSkeleton from '@/components/skeletons/ProfileSkeleton';");
}

const oldLoader = 'if (isInitializing) return null;';
const newLoader = 'if (isInitializing) return <ProfileSkeleton />;';

if (code.includes(oldLoader)) {
  code = code.replace(oldLoader, newLoader);
} else {
  code = code.replace(oldLoader.replace(/\n/g, '\r\n'), newLoader);
}

fs.writeFileSync(path, code);
console.log("Updated Profile page");
