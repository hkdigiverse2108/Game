const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 5502;
const ROOT_DIR = path.resolve(__dirname, '..');

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.mp4': 'video/mp4',
  '.mov': 'video/quicktime',
  '.ogg': 'audio/ogg',
  '.mp3': 'audio/mpeg',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2'
};

const server = http.createServer((req, res) => {
  console.log(`${req.method} ${req.url}`);
  
  // Parse URL
  let parsedUrl = req.url.split('?')[0];
  if (parsedUrl === '/') parsedUrl = '/index.html';
  
  const filePath = path.join(ROOT_DIR, decodeURIComponent(parsedUrl));
  
  if (!fs.existsSync(filePath)) {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Not Found');
    return;
  }
  
  const stat = fs.statSync(filePath);
  if (stat.isDirectory()) {
    res.statusCode = 403;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Directory Listing Forbidden');
    return;
  }
  
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';
  
  res.statusCode = 200;
  res.setHeader('Content-Type', contentType);
  
  const stream = fs.createReadStream(filePath);
  stream.pipe(res);
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Test server running at http://127.0.0.1:${PORT}`);
});
