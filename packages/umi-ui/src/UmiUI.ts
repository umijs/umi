import assert from 'assert';
import chalk from 'chalk';
import { join } from 'path';
import launchEditor from 'react-dev-utils/launchEditor';
import Config from './Config';
import getClientScript from './getClientScript';
import listDirectory from './listDirectory';

const debug = require('debug')('umiui:UmiUI');

export default class UmiUI {
  cwd: string;

  servicesByKey: any;

  server: any;

  socketServer: any;

  config: Config;

  constructor() {
    this.cwd = process.cwd();
    this.servicesByKey = {};
    this.server = null;
    this.socketServer = null;
    this.config = new Config();
  }

  activeProject(key: string, service?: any) {
    const project = this.config.data.projectsByKey[key];
    assert(project, `project of key ${key} not exists`);

    if (service) {
      this.servicesByKey[key] = service;
    } else if (!this.servicesByKey[key]) {
      // Attach Service
      debug(`Attach service for ${key}`);
      const Service = require('umi-build-dev/lib/Service').default;
      const service = new Service({
        cwd: project.path,
      });
      debug(`Attach service for ${key} after new and before init()`);
      service.init();
      debug(`Attach service for ${key} ${chalk.green('SUCCESS')}`);
      this.servicesByKey[key] = service;
    }

    this.config.setCurrentProject(key);
  }

  openProjectInEditor(key: string) {
    const project = this.config.data.projectsByKey[key];
    assert(project, `project of key ${key} not exists`);
    launchEditor(project.path, 1);
  }

  getExtraAssets() {
    const service = this.servicesByKey[this.config.data.currentProject];
    const uiPlugins = service.applyPlugins('addUIPlugin', {
      initialValue: [],
    });
    const script = getClientScript(uiPlugins);
    return {
      script,
    };
  }

  reloadProject(key: string) {}

  handleCoreData({ type, payload }, { log, send, success, failure }) {
    switch (type) {
      case '@@project/getExtraAssets':
        success(this.getExtraAssets());
        break;
      case '@@project/list':
        success({
          data: this.config.data,
        });
        break;
      case '@@project/add':
        // TODO: 检验是否 umi 项目，不是则抛错给客户端
        this.config.addProject(payload.path, payload.name);
        success();
        break;
      case '@@project/delete':
        this.config.deleteProject(payload.key);
        success();
        break;
      case '@@project/open':
        try {
          this.activeProject(payload.key);
          success();
        } catch (e) {
          console.error(chalk.red(`Error: Attach service for ${payload.key} FAILED`));
          console.error(e);
          failure({
            message: e.message,
          });
        }
        break;
      case '@@project/openInEditor':
        this.openProjectInEditor(payload.key);
        success();
        break;
      case '@@project/edit':
        // 只支持改名
        this.config.editProject(payload.key, {
          name: payload.name,
        });
        success();
        break;
      case '@@project/setCurrentProject':
        this.config.setCurrentProject(payload.key);
        success();
        break;
      case '@@fs/getCwd':
        success({
          cwd: this.cwd,
        });
        break;
      case '@@fs/listDirectory':
        success({
          data: listDirectory(payload.dirPath, {
            directoryOnly: true,
          }),
        });
        break;
      default:
        console.error(chalk.red(`Unhandled message type ${type}`));
        break;
    }
  }

  async start() {
    return new Promise((resolve, reject) => {
      const express = require('express');
      const compression = require('compression');
      const serveStatic = require('serve-static');
      const app = express();
      app.use(compression());
      app.use(serveStatic(join(__dirname, '../client/dist')));

      const sockjs = require('sockjs');
      const ss = sockjs.createServer();
      ss.on('connection', conn => {
        function send(action) {
          const message = JSON.stringify(action);
          console.log(chalk.green.bold('>>>>'), formatLogMessage(message));
          conn.write(message);
        }
        function success(type, payload) {
          send({ type: `${type}/success`, payload });
        }
        function failure(type, payload) {
          send({ type: `${type}/failure`, payload });
        }
        function log(message) {
          conn.write(
            JSON.stringify({
              type: '@@core/log',
              payload: message,
            }),
          );
        }
        function formatLogMessage(message) {
          let ret =
            message.length > 500 ? `${message.slice(0, 500)} ${chalk.gray('...')}` : message;
          ret = ret.replace(/{"type":"(.+?)"/, `{"type":"${chalk.magenta.bold('$1')}"`);
          return ret;
        }

        conn.on('close', () => {});
        conn.on('data', message => {
          try {
            const { type, payload } = JSON.parse(message);
            console.log(chalk.blue.bold('<<<<'), formatLogMessage(message));
            if (type.startsWith('@@')) {
              this.handleCoreData(
                { type, payload },
                {
                  log,
                  send,
                  success: success.bind(this, type),
                  failure: failure.bind(this, type),
                },
              );
            } else if (this.config.data.currentProject) {
              const service = this.servicesByKey[this.config.data.currentProject];
              service.applyPlugins('onUISocket', {
                args: {
                  action: { type, payload },
                  log,
                  send,
                  success: success.bind(this, type),
                  failure: failure.bind(this, type),
                },
              });
            }
            // eslint-disable-next-line no-empty
          } catch (e) {
            console.error(chalk.red(e));
          }
        });
      });

      // TODO: 端口冲突时自动换个可用的
      const port = process.env.PORT || 8001;
      const server = app.listen(port, err => {
        if (err) {
          reject(err);
        } else {
          console.log(`umi ui listening on port ${port}`);
          console.log(`http://localhost:${port}/`);
          resolve();
        }
      });
      ss.installHandlers(server, {
        prefix: '/umiui',
      });
      this.socketServer = ss;
      this.server = server;
    });
  }
}
