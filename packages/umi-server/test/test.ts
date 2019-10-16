const { server } = require('umi-server');
const http = require('http');
const { readFileSync } = require('fs');
const { join, extname } = require('path');
const root = join(__dirname, 'fixtures', 'ssr', 'dist');
const render = server({
  root,
  publicPath: '/',
});
const headerMap = {
  '.js': 'text/javascript',
  '.css': 'text/css',
};

// your server
http
  .createServer(async (req, res) => {
    const ext = extname(req.url);
    const header = {
      'Content-Type': headerMap[ext] || 'text/html',
    };
    res.writeHead(200, header);

    if (req.url === '/') {
      const ctx = {
        req,
        res,
      };
      const { ssrHtml } = await render(ctx);
      res.write(ssrHtml);
      res.end();
    } else {
      const content = await readFileSync(join(root, req.url), 'utf-8');
      res.end(content, 'utf-8');
    }
  })
  .listen(8000);

console.log('http://localhost:8000');
