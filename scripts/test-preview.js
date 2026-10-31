import http from 'http';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const distDir = path.resolve('dist');
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml'
};

const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  if (reqPath === '/') reqPath = '/index.html';
  const filePath = path.join(distDir, reqPath);

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

const PORT = 4173;
server.listen(PORT, async () => {
  console.log(`Preview server listening on port ${PORT}`);
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const artifactDir = 'C:\\Users\\Prabh\\.gemini\\antigravity\\brain\\971d889c-a50a-4799-b784-bdbcae559525';

  const viewports = [
    { name: 'phone_390x844', w: 390, h: 844 },
    { name: 'phone_360x640', w: 360, h: 640 },
    { name: 'phone_430x932', w: 430, h: 932 },
    { name: 'phone_landscape_844x390', w: 844, h: 390 },
    { name: 'desktop_1280x800', w: 1280, h: 800 }
  ];

  for (const vp of viewports) {
    const outPath = path.join(artifactDir, `${vp.name}.png`);
    const cmd = `"${chromePath}" --headless --no-sandbox --disable-dev-shm-usage --disable-gpu --run-all-compositor-stages-before-draw --virtual-time-budget=2500 --window-size=${vp.w},${vp.h} --screenshot="${outPath}" "http://localhost:${PORT}"`;
    try {
      console.log(`Capturing ${vp.name}...`);
      execSync(cmd, { stdio: 'pipe' });
      console.log(`Saved ${outPath} (${fs.statSync(outPath).size} bytes)`);
    } catch (e) {
      console.error(`Error on ${vp.name}:`, e.stderr ? e.stderr.toString() : e.message);
    }
  }

  server.close(() => {
    console.log('Testing completed and server closed.');
    process.exit(0);
  });
});
