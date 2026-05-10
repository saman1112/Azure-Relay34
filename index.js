const http = require('http');
const httpProxy = require('http-proxy');

const TARGET_URL = 'https://xray.royatweb.com';

const proxy = httpProxy.createProxyServer({
  target: TARGET_URL,
  changeOrigin: true,
  secure: false,
  xfwd: true,
  proxyTimeout: 0,
  timeout: 0,
  ws: true
});

proxy.on('error', function (err, req, res) {
  console.error('Proxy error:', err.message);

  if (res && !res.headersSent) {
    res.writeHead(502, { 'Content-Type': 'text/plain' });
  }

  if (res) {
    res.end('Relay Error: ' + err.message);
  }
});

const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('OK');
    return;
  }

  proxy.web(req, res);
});

server.on('upgrade', (req, socket, head) => {
  proxy.ws(req, socket, head);
});

const PORT = process.env.PORT || 8080;

server.listen(PORT, () => {
  console.log(`Azure Relay running on port ${PORT}`);
});
