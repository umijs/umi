const CONFIG_PROMPT = `
umi config 命令用于查看或修改配置，有以下功能：
- 传递 list 参数,列举当前项目所有配置
- 传递 get,配置名,两个参数查看该配置的具体值
- 传递 set,配置名,配置值,三个参数修改配置
- 传递 remove,配置名,配置值,三个参数去除配置

配置的ts类型如下,类型属性对应配置名:
\`
interface IConfig {
  alias?: Record<string, string>;
  autoCSSModules?: boolean;
  base?: string;
  /** copy file to dist */
  copy?: { from: string; to: string; }[] | string[];
  cssLoader?: { [key: string]: any };
  cssMinifier?: "esbuild" | "none" | "cssnano" | "pacelCSS";
  define?: { [key: string]: any };
  depTranspiler?: "babel" | "swc" | "esbuild" | "none";
  /** change source-map type */
  devtool: 'eval'|'eval-cheap-source-map'|'eval-cheap-module-source-map'|'eval-source-map'|'cheap-source-map'|'cheap-module-source-map'|'source-map'|'inline-cheap-source-map'|'inline-cheap-module-source-map'|'inline-source-map';
  hash?: boolean;
  ignoreMomentLocale?: boolean;
  jsMinifier?: "swc" | "esbuild" | "none" | "terser" | "uglifyJs";
  jsMinifierOptions?: { [key: string]: any };
  lessLoader?: { lessOptions: any };
  mfsu?: {} | false;
  outputPath?: string;
  polyfill?: any;
  publicPath?: string;
  sassLoader?: { [key: string]: any };
  targets?: { [key: string]: any };
  writeToDisk?: boolean;
  babelLoaderCustomize?: string;
  esbuildMinifyIIFE?: boolean;
}
\`
基于以上知识,根据我的要求,返回我应该使用的命令,只需返回这条命令,不包括任何其他信息,不做任何提示
`;
export default CONFIG_PROMPT;
