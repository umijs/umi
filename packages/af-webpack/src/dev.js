import openBrowser from 'react-dev-utils/openBrowser';
import webpack from 'webpack';
import WebpackDevServer from 'webpack-dev-server';
import chalk from 'chalk';
import { prepareUrls } from './WebpackDevServerUtils';
import clearConsole from './clearConsole';
import errorOverlayMiddleware from './errorOverlayMiddleware';
import send, { STARTING, DONE } from './send';
import choosePort from './choosePort';

const isInteractive = process.stdout.isTTY;
const DEFAULT_PORT = parseInt(process.env.PORT, 10) || 8000;
const HOST = process.env.HOST || '0.0.0.0';
const PROTOCOL = process.env.HTTPS ? 'https' : 'http';
const noop = () => {};

process.env.NODE_ENV = 'development';

export default function dev({
  webpackConfig,
  extraMiddlewares,
  beforeServerWithApp,
  beforeServer,
  afterServer,
  contentBase,
  onCompileDone = noop,
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

      const compiler = webpack(webpackConfig);

      let isFirstCompile = true;
      const urls = prepareUrls(PROTOCOL, HOST, port);
      compiler.hooks.done.tap('af-webpack dev', stats => {
        send({ type: DONE });

        if (stats.hasErrors()) {
          return;
        }

        let copied = '';
        if (isFirstCompile) {
          require('clipboardy').write(urls.localUrlForBrowser);
          copied = chalk.dim('(copied to clipboard)');
        }

        console.log();
        console.log(
          [
            `  App running at:`,
            `  - Local:   ${chalk.cyan(urls.localUrlForTerminal)} ${copied}`,
            `  - Network: ${chalk.cyan(urls.lanUrlForTerminal)}`,
          ].join('\n'),
        );
        console.log();

        if (isFirstCompile) {
          isFirstCompile = false;

          if (openBrowserOpts) {
            openBrowser(urls.localUrlForBrowser);
          }
        }

        onCompileDone();
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
      const server = new WebpackDevServer(compiler, serverConfig);

      ['SIGINT', 'SIGTERM'].forEach(signal => {
        process.on(signal, () => {
          server.close(() => {
            process.exit(0);
          });
        });
      });

      if (beforeServer) {
        beforeServer(server);
      }

      server.listen(port, HOST, err => {
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
          afterServer(server);
        }
      });
    })
    .catch(err => {
      console.log(err);
    });
}
