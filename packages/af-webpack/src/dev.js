import openBrowser from 'react-dev-utils/openBrowser';
import webpack from 'webpack';
import WebpackDevServer from 'webpack-dev-server';
import chalk from 'chalk';
import { createCompiler, prepareUrls } from './WebpackDevServerUtils';
import clearConsole from './clearConsole';
import errorOverlayMiddleware from './errorOverlayMiddleware';
import send, { STARTING, COMPILING, DONE } from './send';
import choosePort from './choosePort';

const isInteractive = process.stdout.isTTY;
const DEFAULT_PORT = parseInt(process.env.PORT, 10) || 8000;
const HOST = process.env.HOST || '0.0.0.0';
const PROTOCOL = process.env.HTTPS ? 'https' : 'http';
const noop = () => {};

process.env.NODE_ENV = 'development';

export default function dev({
  cwd,
  webpackConfig,
  extraMiddlewares,
  beforeServerWithApp,
  beforeServer,
  afterServer,
  contentBase,
  onCompileDone = noop,
  onCompileInvalid = noop,
  proxy,
  openBrowser: openBrowserOpts,
  historyApiFallback = {
    disableDotRule: true,
  },
}) {
  if (!webpackConfig) {
    throw new Error('必须提供 webpackConfig 配置项');
  }
  choosePort(DEFAULT_PORT)
    .then(port => {
      if (port === null) {
        return;
      }

      const urls = prepareUrls(PROTOCOL, HOST, port);
      const compiler = createCompiler(webpack, webpackConfig, 'Your App', urls);

      // Webpack startup recompilation fix. Remove when @sokra fixes the bug.
      // https://github.com/webpack/webpack/issues/2983
      // https://github.com/webpack/watchpack/issues/25
      const timefix = 11000;
      compiler.plugin('watch-run', (watching, callback) => {
        watching.startTime += timefix;
        callback();
      });
      compiler.plugin('done', stats => {
        send({ type: DONE });
        stats.startTime -= timefix;
        onCompileDone();
      });
      compiler.plugin('invalid', () => {
        send({ type: COMPILING });
        onCompileInvalid();
      });
      const serverConfig = {
        disableHostCheck: true,
        compress: true,
        clientLogLevel: 'none',
        hot: true,
        quiet: true,
        headers: {
          'access-control-allow-origin': '*',
        },
        publicPath: webpackConfig.output.publicPath,
        watchOptions: {
          ignored: /node_modules/,
        },
        historyApiFallback,
        overlay: false,
        host: HOST,
        proxy,
        https: !!process.env.HTTPS,
        contentBase: contentBase || process.env.CONTENT_BASE,
        before(app) {
          if (beforeServerWithApp) {
            beforeServerWithApp(app);
          }
          app.use(errorOverlayMiddleware());
        },
        after(app) {
          if (extraMiddlewares) {
            extraMiddlewares.forEach(middleware => {
              app.use(middleware);
            });
          }
        },
      };
      const devServer = new WebpackDevServer(compiler, serverConfig);

      if (beforeServer) {
        beforeServer(devServer);
      }

      devServer.listen(port, HOST, err => {
        if (err) {
          console.log(err);
          return;
        }
        if (isInteractive) {
          clearConsole();
        }
        console.log(chalk.cyan('\nStarting the development server...\n'));
        if (openBrowserOpts) {
          openBrowser(urls.localUrlForBrowser);
        }
        send({ type: STARTING });
        if (afterServer) {
          afterServer(devServer);
        }
      });
    })
    .catch(err => {
      console.log(err);
    });
}
