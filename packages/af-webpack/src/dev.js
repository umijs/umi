import {
  createCompiler,
  prepareUrls,
} from 'react-dev-utils/WebpackDevServerUtils';
import clearConsole from 'react-dev-utils/clearConsole';
import webpack from 'webpack';
import WebpackDevServer from 'webpack-dev-server';
import chalk from 'chalk';
import errorOverlayMiddleware from './errorOverlayMiddleware';
import send, { STARTING, COMPILING, DONE } from './send';
import choosePort from './choosePort';

const isInteractive = process.stdout.isTTY;
const DEFAULT_PORT = parseInt(process.env.PORT, 10) || 8000;
const HOST = '0.0.0.0';
const PROTOCOL = 'http';

process.env.NODE_ENV = 'development';

export default function dev({
  webpackConfig,
  appName,
  extraMiddlewares,
  beforeServer,
  afterServer,
  proxy,
}) {
  if (!webpackConfig) {
    throw new Error('必须提供 webpackConfig 配置项');
  }
  choosePort(DEFAULT_PORT)
    .then(port => {
      if (port === null) {
        return;
      }

      if (beforeServer) {
        beforeServer();
      }

      const urls = prepareUrls(PROTOCOL, HOST, port);
      const compiler = createCompiler(
        webpack,
        webpackConfig,
        appName || 'Your App',
        urls,
      );

      // Webpack startup recompilation fix. Remove when @sokra fixes the bug.
      // https://github.com/webpack/webpack/issues/2983
      // https://github.com/webpack/watchpack/issues/25
      const timefix = 11000;
      compiler.plugin('watch-run', (watching, callback) => {
        watching.startTime += timefix;
        callback();
      });
      compiler.plugin('done', stats => {
        stats.startTime -= timefix;
      });

      compiler.plugin('invalid', () => {
        send({ type: COMPILING });
      });
      compiler.plugin('done', () => {
        send({ type: DONE });
      });
      const serverConfig = {
        disableHostCheck: true,
        compress: true,
        clientLogLevel: 'none',
        hot: true,
        quiet: true,
        publicPath: webpackConfig.output.publicPath,
        watchOptions: {
          ignored: /node_modules/,
        },
        historyApiFallback: {
          disableDotRule: true,
        },
        overlay: false,
        host: HOST,
        proxy,
        before(app) {
          if (extraMiddlewares) {
            extraMiddlewares.forEach(middleware => {
              app.use(middleware);
            });
          }
          app.use(errorOverlayMiddleware());
        },
      };
      const devServer = new WebpackDevServer(compiler, serverConfig);
      devServer.listen(port, HOST, err => {
        if (err) {
          console.log(err);
          return;
        }
        if (isInteractive) {
          clearConsole();
        }
        console.log(chalk.cyan('Starting the development server...\n'));
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
