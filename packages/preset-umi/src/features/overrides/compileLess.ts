import less from '@umijs/bundler-utils/compiled/less';

export async function compileLess(
  lessContent: string,
  filePath: string,
  modifyVars: Record<string, string> = {},
  alias: Record<string, string> = {},
) {
  const result = await less.render(lessContent, {
    filename: filePath,
    plugins: [
      new (require('less-plugin-resolve') as any)({
        aliases: alias,
      }),
    ],
    javascriptEnabled: true,
    modifyVars,
  });
  return result.css;
}
