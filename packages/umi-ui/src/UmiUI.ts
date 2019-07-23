import assert from 'assert';
import chalk from 'chalk';
import { join } from 'path';
import Config from './Config';
import getClientScript from './getClientScript';

export default class UmiUI {
  servicesByKey: any;

  server: any;

  socketServer: any;

  config: Config;

  constructor() {
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
      console.log(`attach service for ${key}`);
      try {
        const Service = require('umi-build-dev/lib/Service').default;
        const service = new Service({
          cwd: project.path,
        });
        console.log(`attach service for ${key} after new and before init()`);
        service.init();
        console.log(`attach service for ${key} SUCCESS`);
        this.servicesByKey[key] = service;
      } catch (e) {
        console.error(chalk.red(`attach service for ${key} FAILED`));
        console.error(e);
      }
    }

    this.config.setCurrentProject(key);
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

  handleCoreData({ type, payload }, { log, send }) {
    switch (type) {
      case '@@project/getExtraAssets':
        send({
          type: `${type}/success`,
          payload: this.getExtraAssets(),
        });
        break;
      case '@@project/list':
        send({
          type: `${type}/success`,
          payload: {
            data: this.config.data,
          },
        });
        break;
      case '@@project/add':
        // TODO: 检验是否 umi 项目，不是则抛错给客户端
        this.config.addProject(payload.path, payload.name);
        send({
          type: `${type}/success`,
        });
        break;
      case '@@project/delete':
        this.config.deleteProject(payload.key);
        send({
          type: `${type}/success`,
        });
        break;
      case '@@project/open':
        this.activeProject(payload.key);
        send({
          type: `${type}/success`,
        });
        break;
      case '@@project/edit':
        // 只支持改名
        this.config.editProject(payload.key, {
          name: payload.name,
        });
        send({
          type: `${type}/success`,
        });
        break;
      case '@@project/setCurrentProject':
        this.config.setCurrentProject(payload.key);
        send({
          type: `${type}/success`,
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
      const serveStatic = require('serve-static');
      const app = express();
      app.use(serveStatic(join(__dirname, '../client/dist')));

      const sockjs = require('sockjs');
      const ss = sockjs.createServer();
      ss.on('connection', conn => {
        function send(action) {
          console.log('send', JSON.stringify(action));
          conn.write(JSON.stringify(action));
        }
        function log(message) {
          conn.write(
            JSON.stringify({
              type: '@@core/log',
              payload: message,
            }),
          );
        }

        conn.on('close', () => {});
        conn.on('data', message => {
          try {
            const { type, payload } = JSON.parse(message);
            console.log('>> GET Socket Message:', message);
            if (type.startsWith('@@')) {
              this.handleCoreData({ type, payload }, { log, send });
            } else if (this.config.data.currentProject) {
              const service = this.servicesByKey[this.config.data.currentProject];
              service.applyPlugins('onUISocket', {
                args: {
                  action: { type, payload },
                  send,
                  log,
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
