import { IApi, NextFunction, Request, Response } from '@umijs/types';
import { extname, join } from 'path';
import { getHtmlGenerator, chunksToFiles } from '../htmlUtils';

const ASSET_EXTNAMES = ['.ico', '.png', '.jpg', '.jpeg', '.gif', '.svg'];

export default ({
  api,
  sharedMap,
}: {
  api: IApi;
  sharedMap: Map<string, any>;
}) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    async function sendHtml() {
      const defaultFiles = {
        jsFiles: ['umi.js'],
        cssFiles: ['umi.css'],
      };
      const { jsFiles, cssFiles } = sharedMap.get('chunks')
        ? chunksToFiles(sharedMap.get('chunks'))
        : defaultFiles;
      const html = getHtmlGenerator({ api });
      const content = await html.getContent({
        route: { path: req.path },
        cssFiles,
        jsFiles,
      });
      res.setHeader('Content-Type', 'text/html');
      res.send(content);
    }

    if (req.path === '/favicon.ico') {
      res.sendFile(join(__dirname, 'umi.png'));
    } else if (ASSET_EXTNAMES.includes(extname(req.path))) {
      next();
    } else {
      await sendHtml();
    }
  };
};
