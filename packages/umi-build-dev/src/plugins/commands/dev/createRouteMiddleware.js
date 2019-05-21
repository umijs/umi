import getHtmlGenerator from '../getHtmlGenerator';
import chunksToMap from '../build/chunksToMap';

const debug = require('debug')('umi-build-dev:createRouteMiddleware');

export default function createRouteMiddleware(service) {
  return (req, res, next) => {
    const { path, method } = req;

    function sendHtml() {
      if (!service.__chunks) {
        setTimeout(sendHtml, 300);
        return;
      }
      const chunksMap = chunksToMap(service.__chunks);
      const htmlGenerator = getHtmlGenerator(service, {
        chunksMap,
      });
      const content = htmlGenerator.getMatchedContent(normalizePath(path, service.config.base));
      res.setHeader('Content-Type', 'text/html');
      res.send(content);
    }

    if (path === '/favicon.ico') {
      next();
    } else {
      debug(`[${method}] ${path}`);
      if (path === '/__umiDev/routes') {
        res.setHeader('Content-Type', 'text/json');
        res.send(JSON.stringify(service.routes));
      } else {
        sendHtml();
      }
    }
  };
}

function normalizePath(path, base = '/') {
  if (path.startsWith(base)) {
    path = path.replace(base, '/');
  }
  return path;
}
