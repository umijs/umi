import fs from 'fs';
import sockjs from 'af-webpack/node_modules/sockjs';
import rimraf from 'rimraf';
import { exec } from 'child_process';
import { join } from 'path';
import chalk from 'chalk';

export default (server, port, HOST) => {
  server.listeningApp.listen(port, HOST, err => {
    const socket = sockjs.createServer({
      // Use provided up-to-date sockjs-client
      sockjs_url: '/__webpack_dev_server__/sockjs.bundle.js',
      // Limit useless logs
      log: (severity, line) => {
        if (severity === 'error') {
          server.log.error(line);
        } else {
          server.log.debug(line);
        }
      },
    });

    socket.on('connection', connection => {
      if (!connection) {
        return;
      }

      console.log(chalk.bgBlue.bold.white('dashboard server connected!'));
      if (!server.checkHost(connection.headers)) {
        server.sockWrite([connection], 'error', 'Invalid Host header');
        connection.close();
        return;
      }

      connection.on('close', () => {
        console.log(chalk.bgBlue.bold.white('dashboard server disconnected!'));
      });

      connection.on('data', data => {
        const FINISH_NEED_RELOAD = 0;

        const deleteFile = (filePath, fileName) => {
          fs.access(filePath, fs.W_OK, err => {
            if (err) {
              return;
            }

            rimraf(filePath, err => {
              if (err) {
                console.log(chalk.bgRed.white(`failed to delete ${filePath}`));
                return;
              }
              connection.write(
                JSON.stringify({
                  type: FINISH_NEED_RELOAD,
                }),
              );
              console.log(chalk.redBright(`pages${fileName} has been deleted`));
            });
          });
        };

        if (data.startsWith('UMI_ROUTE_DEL_')) {
          const routeName = data.substring(14);
          const routeDirPath = join(process.cwd(), 'pages', routeName);
          [``, `.js`, `.css`].forEach(fileSuffix =>
            deleteFile(
              `${routeDirPath}${fileSuffix}`,
              `${routeName}${fileSuffix}`,
            ),
          );
        } else if (data.startsWith('UMI_ROUTE_ADD_')) {
          const routeName = data.substring(14);
          exec(`umi g page ${routeName}`, () => {
            console.log(chalk.green(`${routeName} route has been added`));
            connection.write(
              JSON.stringify({
                type: FINISH_NEED_RELOAD,
              }),
            );
          });
        }
      });
    });

    socket.installHandlers(server.listeningApp, {
      prefix: '/sockjs-dashboard',
    });
  });
};
