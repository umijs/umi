import { chalk } from '@umijs/utils';
import { IApi } from '../../types';

export default (api: IApi) => {
  api.describe({
    key: 'terminal',
    config: {
      schema({ zod }) {
        return zod.object({});
      },
    },
  });

  api.onGenerateFiles(() => {
    // ref:
    // https://github.com/patak-dev/vite-plugin-terminal/blob/main/src/index.ts
    api.writeTmpFile({
      path: 'core/terminal.ts',
      noPluginDir: true,
      content: `
let count = 0;
let groupLevel = 0;
function send(type: string, message?: string) {
  if(process.env.NODE_ENV==='production'){
    return;
  }else{
    const encodedMessage = message ? \`&m=\${encodeURI(message)}\` : '';
    fetch(\`/__umi/api/terminal?type=\${type}&t=\${Date.now()}&c=\${count++}&g=\${groupLevel}\${encodedMessage}\`, { mode: 'no-cors' })
  }
}
function prettyPrint(obj: any) {
  return JSON.stringify(obj, null, 2);
}
function stringifyObjs(objs: any[]) {
  const obj = objs.length > 1 ? objs.map(stringify).join(' ') : objs[0];
  return typeof obj === 'object' ? \`\${prettyPrint(obj)}\` : obj.toString();
}
function stringify(obj: any) {
  return typeof obj === 'object' ? \`\${JSON.stringify(obj)}\` : obj.toString();
}
const terminal = {
  log(...objs: any[]) { send('log', stringifyObjs(objs)) },
  info(...objs: any[]) { send('info', stringifyObjs(objs)) },
  warn(...objs: any[]) { send('warn', stringifyObjs(objs)) },
  error(...objs: any[]) { send('error', stringifyObjs(objs)) },
  group() { groupLevel++ },
  groupCollapsed() { groupLevel++ },
  groupEnd() { groupLevel && --groupLevel },
  clear() { send('clear') },
  trace(...args: any[]) { console.trace(...args) },
  profile(...args: any[]) { console.profile(...args) },
  profileEnd(...args: any[]) { console.profileEnd(...args) },
};
export { terminal };
      `.trimStart(),
    });
  });

  api.addBeforeMiddlewares(() => {
    const colors = {
      log: chalk.magentaBright,
      info: chalk.gray,
      warn: chalk.yellowBright,
      error: chalk.red,
    };
    return (req, res, next) => {
      if (req.path === '/__umi/api/terminal') {
        const { type, t, c, g, m } = req.query;
        t;
        c;
        g;
        // @ts-ignore
        console[type](colors[type](`» ${m}`));
        res.end();
      } else {
        return next();
      }
    };
  });
};
