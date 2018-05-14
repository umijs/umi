import HtmlGenerator from '../html/HtmlGenerator';

let config = null;

export default function createRouteMiddleware(service) {
  ({ config } = service);

  return (req, res) => {
    const { path } = req;
    service.applyPlugins('onRouteRequest', {
      args: {
        req,
      },
    });
    const htmlGenerator = new HtmlGenerator(service);
    const content = htmlGenerator.getContent(
      config.exportStatic ? path : undefined,
    );
    res.setHeader('Content-Type', 'text/html');
    res.send(content);
  };
}

export function setConfig(_config) {
  config = _config;
}
