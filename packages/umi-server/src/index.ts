export interface IConfig {
  exclude?: string[];
  /** default false */
  polyfill?: boolean;
  runInMockContext?: {};
  // use renderToStaticMarkup
  staticMarkup?: boolean;
  // htmlSuffix
  htmlSuffix?: boolean;
  // modify render html function
}

export interface IContext {
  req: {
    url: string;
  };
}

const server = (config: IConfig) => (ctx: IContext) => {
  console.log('config', ctx);
  return config;
};

module.exports = server;
