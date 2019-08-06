import assert from 'assert';
import chalk from 'chalk';
import emptyDir from 'empty-dir';
import clearModule from 'clear-module';
import { join } from 'path';
import launchEditor from 'react-dev-utils/launchEditor';
import { existsSync } from 'fs';
import got from 'got';
import Config from './Config';
import getClientScript from './getClientScript';
import listDirectory from './listDirectory';
import installCreator from './installCreator';
import { installDeps } from './npmClient';

const debug = require('debug')('umiui:UmiUI');

export default class UmiUI {
  cwd: string;

  servicesByKey: any;

  server: any;

  socketServer: any;

  logs: any;

  config: Config;

  constructor() {
    this.cwd = process.cwd();
    this.servicesByKey = {};
    this.server = null;
    this.socketServer = null;
    this.config = new Config();
    this.logs = [];

    if (process.env.CURRENT_PROJECT) {
      this.config.addProjectAndSetCurrent(process.env.CURRENT_PROJECT);
    }
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

  async createProject(opts = {}, { onSuccess, onFailure, onProgress }) {
    const { type, npmClient, baseDir, name, args } = opts;
    let key;

    const setProgress = args => {
      assert(key, `key is not initialized.`);
      this.config.setCreatingProgress(key, args);
      onProgress(this.config.data.projectsByKey[key].creatingProgress);
    };

    try {
      // 步骤：
      //
      // 1. 校验
      //      a) 比如检查目标目录是否为空或不存在
      // 2. 添加项目状态到本地存储，后面每一步都更新状态到存储
      // 3. 安装 create-umi 或更新他
      // 4. create-umi 创建
      //    如果是 ant-design-pro，还需要拆几步出来，比如 git clone
      // 5. 安装依赖
      //
      // 项目步骤：
      // 1. 校验参数
      // 2. 安装/更新 create-umi
      // 3. 使用 create-umi 初始化项目
      // 4. 安装依赖
      //
      // 结束后打开项目。
      assert(baseDir, `baseDir must be supplied`);
      assert(name, `name must be supplied`);
      assert(type, `type must be supplied`);
      const targetDir = join(baseDir, name);

      // 1
      assert(
        !existsSync(targetDir) || emptyDir.sync(targetDir),
        `target dir ${targetDir} exists and not empty`,
      );

      // 2
      key = this.config.addProject(targetDir, name);
      setProgress({
        // 表示第几个 step，从 0 开始
        step: 1,
        // 0: 未开始
        // 1: 执行中
        // 2: 执行完成
        // 3: 执行失败
        stepStatus: 0,
        steps: ['校验参数', '安装或更新 create-umi', '初始化项目', '安装依赖'],
      });

      // 3
      setProgress({
        step: 1,
        stepStatus: 1,
      });
      const creatorPath = await installCreator({});
      setProgress({
        stepStatus: 2,
      });

      // 4
      setProgress({
        step: 2,
        stepStatus: 1,
      });
      clearModule(creatorPath);
      await require(creatorPath).run({
        cwd: targetDir,
        type,
        args,
      });
      setProgress({
        stepStatus: 2,
      });

      // 5
      setProgress({
        step: 3,
        stepStatus: 1,
      });
      await installDeps(npmClient, targetDir);
      setProgress({
        stepStatus: 2,
      });
      this.config.setCreatingProgressDone(key);

      onSuccess();
    } catch (e) {
      if (key) {
        this.config.setCreatingProgress(key, {
          stepStatus: 3,
        });
      }
      onFailure(e);
    }
  }

  reloadProject(key: string) {}

  handleCoreData({ type, payload }, { log, send, success, failure, progress }) {
    switch (type) {
      case '@@project/getExtraAssets':
        success(this.getExtraAssets());
        break;
      case '@@project/list':
        log('info', 'list project');
        success({
          data: this.config.data,
        });
        break;
      case '@@project/add':
        // TODO: 检验是否 umi 项目，不是则抛错给客户端
        log('info', `add project ${payload.path} with name ${payload.name}`);
        this.config.addProject(payload.path, payload.name);
        success();
        break;
      case '@@project/delete':
        log('info', `delete project`);
        this.config.deleteProject(payload.key);
        success();
        break;
      case '@@project/open':
        log('info', `open project`);
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
        log('info', `open project in editor`);
        this.openProjectInEditor(payload.key);
        success();
        break;
      case '@@project/edit':
        log('info', `edit project`);
        // 只支持改名
        this.config.editProject(payload.key, {
          name: payload.name,
        });
        success();
        break;
      case '@@project/setCurrentProject':
        log('info', `set current project`);
        this.config.setCurrentProject(payload.key);
        success();
        break;
      case '@@project/create':
        log('info', `create project`);
        this.createProject(payload, {
          onSuccess: success,
          onFailure(e) {
            failure({
              message: e.message,
            });
          },
          onProgress: progress,
        });
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
      case '@@log/getHistory':
        success({
          data: this.logs,
        });
        break;
      default:
        log('error', chalk.red(`Unhandled message type ${type}`));
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
      if (process.env.LOCAL_DEBUG) {
        app.use((req, res) => {
          if (['/'].includes(req.path)) {
            got(`http://localhost:8002${req.path}`)
              .then(({ body }) => {
                res.set('Content-Type', 'text/html');
                res.send(body);
              })
              .catch(e => {
                console.error(e);
              });
          }
        });
      } else {
        app.use(serveStatic(join(__dirname, '../client/dist')));
      }

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
        function progress(type, payload) {
          send({ type: `${type}/progress`, payload });
        }
        const log = (type, message) => {
          const payload = {
            date: +new Date(),
            type,
            message,
          };
          console[type === 'error' ? 'error' : 'log'](`${chalk.gray(`[${type}]`)} ${message}`);
          this.logs.push(payload);
          send({
            type: '@@log/message',
            payload,
          });
        };
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
                  progress: progress.bind(this, type),
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
                  progress: progress.bind(this, type),
                },
              });
            }
            // eslint-disable-next-line no-empty
          } catch (e) {
            console.error(chalk.red(e.stack));
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
