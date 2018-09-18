import getHtmlGenerator from '../getHtmlGenerator';
import chunksToMap from '../build/chunksToMap';

export default function createRouteMiddleware(service) {
  return (req, res) => {
    const { path } = req;

    if (path === '/__umiDev/routes') {
      res.setHeader('Content-Type', 'text/json');
      res.send(JSON.stringify(service.routes));
    } else {
      const chunksMap = chunksToMap(service.__chunks);
      const htmlGenerator = getHtmlGenerator(service, {
        chunksMap,
      });
      const content = htmlGenerator.getMatchedContent(path);
      res.setHeader('Content-Type', 'text/html');
      res.send(content);
    }
  };
}
