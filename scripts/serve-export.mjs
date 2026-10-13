import http from 'node:http';
import path from 'node:path';
import {readFile, stat} from 'node:fs/promises';

const root = path.resolve('dist');
const port = Number(process.argv[2] || 4189);
const types = {'.html':'text/html; charset=utf-8','.txt':'text/plain; charset=utf-8','.xml':'application/xml','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.ico':'image/x-icon','.svg':'image/svg+xml'};
const server = http.createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://127.0.0.1').pathname);
    const target = path.resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
    if (!target.startsWith(root + path.sep)) { res.writeHead(400); res.end(); return; }
    let file;
    for (const candidate of [target, target + '.html', path.join(target,'index.html')]) {
      try { if ((await stat(candidate)).isFile()) { file = candidate; break; } } catch {}
    }
    if (!file) { res.writeHead(404, {'Content-Type':'text/html; charset=utf-8'}); res.end(await readFile(path.join(root, '404.html'))); return; }
    res.writeHead(200, {'Content-Type': types[path.extname(file)] || 'application/octet-stream', 'Cache-Control':'no-store'});
    res.end(await readFile(file));
  } catch { res.writeHead(500); res.end('Static preview error'); }
});
server.listen(port, '127.0.0.1', () => console.log(`Export preview: http://127.0.0.1:${port}`));
