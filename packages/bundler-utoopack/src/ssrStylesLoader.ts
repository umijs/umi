import { winPath } from '@umijs/utils';

function ensureLastSlash(path: string) {
  return path.endsWith('/') ? path : path + '/';
}

function hashString(str: string) {
  let hash = Buffer.from(str).toString('base64').replace(/=/g, '');
  hash = hash.substring(hash.length - 5);
  return hash;
}

function getClassNames(code: string) {
  const classNames = new Set<string>();
  const regexp = /\.([_a-zA-Z][\w-]*)/g;
  let match: RegExpExecArray | null;

  while ((match = regexp.exec(code))) {
    classNames.add(match[1]);
  }

  return Array.from(classNames);
}

export default function ssrStylesLoader(this: any, content: string | Buffer) {
  const options = this.getOptions?.() || {};
  const cwd = winPath(options.cwd || this.rootContext || process.cwd());
  const filename = winPath(this.resourcePath).replace(ensureLastSlash(cwd), '');
  const code = Buffer.isBuffer(content) ? content.toString() : content;
  const cssModuleObject = getClassNames(code)
    .sort()
    .reduce<Record<string, string>>((memo, key) => {
      memo[key] = `${key}___${hashString(`${filename}@${key}`)}`;
      return memo;
    }, {});

  return `export default ${JSON.stringify(cssModuleObject)};`;
}
