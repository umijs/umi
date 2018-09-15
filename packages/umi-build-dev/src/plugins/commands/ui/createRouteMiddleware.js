import getRouteConfig from '../../../routes/getRouteConfig';
import getHtmlGenerator from '../getHtmlGenerator';
import Service from '../../../Service';

export default function createRouteMiddleware(service) {
  return (req, res) => {
    const { path } = req;
    if (path === '/__umiDashboard/routes') {
      const service = new Service(process.cwd());
      const projectPaths = service.paths;
      let projectRoutes = null;
      try {
        projectRoutes = getRouteConfig(projectPaths);
      } catch (err) {
        projectRoutes = [];
      }
      res.setHeader('Content-Type', 'text/json');
      res.send(JSON.stringify(projectRoutes));
    } else {
      const htmlGenerator = getHtmlGenerator(service);
      const content = htmlGenerator.getMatchedContent(path);
      res.setHeader('Content-Type', 'text/html');
      res.send(content);
    }
  };
}
