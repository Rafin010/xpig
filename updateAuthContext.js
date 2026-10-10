const fs = require('fs');
const path = "d:/_Xpig/frontend/src/context/AuthContext.tsx";
let code = fs.readFileSync(path, 'utf8');

const oldGoogleLogin = `  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: \`Bearer \${tokenResponse.access_token}\` },
        });
        const userInfo = await res.json();
        
        // Sync with backend
        const backendRes = await fetch('https://xpig.onrender.com/api/v1/auth/google', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: userInfo.email,
            name: userInfo.name,
            picture: userInfo.picture,
          }),
        });

        if (backendRes.ok) {
          const userData = await backendRes.json();
          setUser(userData);
          localStorage.setItem('xpig_user', JSON.stringify(userData));
        }
      } catch (err) {
        console.error('Login failed', err);
      }
    },
  });`;

const newGoogleLogin = `  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        // Securely pass the Google access token to our backend for validation
        const backendRes = await fetch('https://xpig.onrender.com/api/v1/auth/google', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            access_token: tokenResponse.access_token
          }),
        });

        if (backendRes.ok) {
          const data = await backendRes.json();
          setUser(data.user);
          localStorage.setItem('xpig_user', JSON.stringify(data.user));
          localStorage.setItem('xpig_token', data.access_token);
        }
      } catch (err) {
        console.error('Login failed', err);
      }
    },
  });`;

if (code.includes('https://www.googleapis.com/oauth2/v3/userinfo')) {
    code = code.replace(oldGoogleLogin, newGoogleLogin);
    fs.writeFileSync(path, code);
    console.log("Updated AuthContext.tsx");
} else {
    // try CRLF
    code = code.replace(oldGoogleLogin.replace(/\n/g, '\r\n'), newGoogleLogin);
    fs.writeFileSync(path, code);
    console.log("Updated AuthContext.tsx (CRLF)");
}
