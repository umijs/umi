import { IApi, NextFunction, Request, Response } from '@umijs/types';
import { extname, join } from 'path';
import { getHtmlGenerator } from '../buildDevUtils';

const ASSET_EXTNAMES = ['.ico', '.png', '.jpg', '.jpeg', '.gif', '.svg'];

export default ({ api }: { api: IApi }) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    async function sendHtml() {
      const html = getHtmlGenerator({ api });
      const content = await html.getContent({
        route: { path: req.path },
        cssFiles: ['umi.css'],
        jsFiles: ['umi.js'],
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
