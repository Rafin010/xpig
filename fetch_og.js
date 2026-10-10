const https = require('https');

https.get('https://xpig.me', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const lines = data.split('\n');
    lines.forEach(line => {
      if (line.includes('og:image')) {
        console.log(line.trim());
      }
    });
  });
});
