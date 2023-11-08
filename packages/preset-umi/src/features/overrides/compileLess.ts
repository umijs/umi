import less from '@umijs/bundler-utils/compiled/less';
import { winPath } from '@umijs/utils';

export async function compileLess(opts: {
  lessContent: string;
  filePath: string;
  modifyVars: Record<string, string>;
  alias: Record<string, string>;
  targetPath: string;
}) {
  const {
    lessContent,
    filePath,
    modifyVars = {},
    alias = {},
    targetPath,
  } = opts;
  const resolvePlugin = new (require('less-plugin-resolve') as any)({
    aliases: alias,
    urlRewriteTargetPath: winPath(targetPath),
  });
  const result = await less.render(lessContent, {
    filename: filePath,
    plugins: [resolvePlugin],
    javascriptEnabled: true,
    modifyVars,
  });
  return result.css;
}
