const http = require('http');
const fs = require('fs');
const path = require('path');

const host = '127.0.0.1';
const port = 4173;
const root = path.resolve(__dirname, '..', 'dist');

const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.gif': 'image/gif',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
};

const server = http.createServer((req, res) => {
  const urlPath = (req.url || '/').split('?')[0];
  const normalizedPath = urlPath === '/' ? '/index.html' : urlPath;
  let filePath = path.join(root, decodeURIComponent(normalizedPath));

  if (!filePath.startsWith(root)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.stat(filePath, (statError, stats) => {
    if (statError || !stats.isFile()) {
      filePath = path.join(root, 'index.html');
    }

    fs.readFile(filePath, (readError, data) => {
      if (readError) {
        res.writeHead(404);
        res.end('Not found');
        return;
      }

      const extension = path.extname(filePath).toLowerCase();
      res.writeHead(200, {
        'Cache-Control': 'no-cache',
        'Content-Type': mimeTypes[extension] || 'application/octet-stream',
      });
      res.end(data);
    });
  });
});

server.listen(port, host, () => {
  console.log(`STATIC_SERVER_READY http://${host}:${port}`);
});
