import getHtmlGenerator from '../getHtmlGenerator';

export default function createRouteMiddleware(service) {
  return (req, res) => {
    const { path } = req;
    const htmlGenerator = getHtmlGenerator(service);
    const content = htmlGenerator.getMatchedContent(path);
    res.setHeader('Content-Type', 'text/html');
    res.send(content);
  };
}
