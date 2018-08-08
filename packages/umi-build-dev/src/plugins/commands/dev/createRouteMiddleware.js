import getHtmlGenerator from '../getHtmlGenerator';

export default function createRouteMiddleware(service) {
  return (req, res) => {
    const { path } = req;

    if (path === '/__umiDev/routes') {
      res.setHeader('Content-Type', 'text/json');
      res.send(JSON.stringify(service.routes));
    } else {
      const htmlGenerator = getHtmlGenerator(service);
      const content = htmlGenerator.getMatchedContent(path);
      res.setHeader('Content-Type', 'text/html');
      res.send(content);
    }
  };
}
