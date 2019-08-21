import assert from 'assert';
import chalk from 'chalk';
import emptyDir from 'empty-dir';
import clearModule from 'clear-module';
import { join, resolve } from 'path';
import launchEditor from 'react-dev-utils/launchEditor';
import openBrowser from 'react-dev-utils/openBrowser';
import { existsSync, readFileSync, statSync } from 'fs';
import { execSync } from 'child_process';
import got from 'got';
import rimraf from 'rimraf';
import portfinder from 'portfinder';
import resolveFrom from 'resolve-from';
import Config from './Config';
import getClientScript from './getClientScript';
import listDirectory from './listDirectory';
import installCreator from './installCreator';
import { installDeps } from './npmClient';
import ActiveProjectError from './ActiveProjectError';
import {
  BackToHomeAction,
  InstallDependencyAction,
  OpenConfigFileAction,
  OpenProjectAction,
  ReInstallDependencyAction,
} from './Actions';
import { isDepLost, isUmiProject } from './checkProject';

const debug = require('debug')('umiui:UmiUI');

export default class UmiUI {
  cwd: string;

  servicesByKey: any;

  server: any;

  socketServer: any;

  logs: any;

  config: Config;

  send: any;

  developMode: boolean = false;

  constructor() {
    this.cwd = process.cwd();
    this.servicesByKey = {};
    this.server = null;
    this.socketServer = null;
    this.config = new Config({
      onSave: data => {
        if (this.send) {
          this.send({
            type: '@@project/list/progress',
            payload: data,
          });
        }
      },
    });
    this.logs = [];
    this.developMode = !!process.env.DEVELOP_MODE;

    if (process.env.CURRENT_PROJECT) {
      this.config.addProjectAndSetCurrent(process.env.CURRENT_PROJECT);
    }
  }

  activeProject(key: string, service?: any, opts?: any) {
    const { lang } = opts || {};
    const project = this.config.data.projectsByKey[key];
    assert(project, `project of key ${key} not exists`);

    // Check exists.
    if (!existsSync(project.path)) {
      throw new ActiveProjectError({
        message: {
          'zh-CN': `项目 ${project.path} 路径不存在。`,
          'en-US': `Project ${project.path} not exists.`,
        },
        lang,
        actions: [
          BackToHomeAction,
          InstallDependencyAction,
          ReInstallDependencyAction,
          OpenConfigFileAction,
        ],
      });
    }

    // Check umi valid.
    if (!isUmiProject(project.path)) {
      throw new ActiveProjectError({
        message: {
          'zh-CN': `项目 ${project.path} 不是 Umi 项目。`,
          'en-US': `Project ${project.path} is not a valid Umi project.`,
        },
        lang,
        actions: [BackToHomeAction],
      });
    }

    if (!this.developMode && service) {
      this.servicesByKey[key] = service;
    } else if (!this.servicesByKey[key]) {
      // Attach Service
      debug(`Attach service for ${key}`);
      // Use local service and detect version compatibility
      const serviceModule = process.env.BIGFISH_COMPAT
        ? '@alipay/bigfish/_Service'
        : 'umi/_Service';
      const binModule = process.env.BIGFISH_COMPAT ? '@alipay/bigfish/bin/bigfish' : 'umi/bin/umi';
      const cwd = project.path;
      const localService = resolveFrom.silent(cwd, serviceModule);
      const localBin = resolveFrom.silent(cwd, binModule);
      // TODO: 上线前删除 false 判断
      if (false && localBin && !localService) {
        // 有 Bin 但没 Service，说明版本不够
        throw new ActiveProjectError({
          message: process.env.BIGFISH_COMPAT
            ? `Bigfish 版本过低，请升级到 @alipay/bigfish@2.20 或以上。`
            : {
                'zh-CN': `Umi 版本过低，请升级到 umi@2.9 或以上。`,
                'en-US': `Umi version is too low, please upgrade to umi@2.9 or above.`,
              },
          lang,
          actions: [BackToHomeAction, OpenProjectAction],
        });
      }

      try {
        const servicePath = localService || 'umi-build-dev/lib/Service';
        debug(`Service path: ${servicePath}`);
        const Service = require(servicePath).default;
        const service = new Service({
          cwd: project.path,
        });
        debug(`Attach service for ${key} after new and before init()`);
        service.init();
        debug(`Attach service for ${key} ${chalk.green('SUCCESS')}`);
        this.servicesByKey[key] = service;
      } catch (e) {
        console.error('service eee', e);
        if (isDepLost(e)) {
          throw new ActiveProjectError({
            message: {
              'zh-CN': `依赖文件没找到。`,
              'en-US': 'Dependency file not found.',
            },
            lang,
            actions: [ReInstallDependencyAction, BackToHomeAction],
          });
        } else {
          throw new ActiveProjectError({
            message: {
              'zh-CN': '其他错误',
              'en-US': 'Other Errors',
            },
            lang,
            actions: [BackToHomeAction],
          });
        }
      }
    }

    this.config.setCurrentProject(key);
  }

  openProjectInEditor(key: string) {
    if (key.startsWith('/') && existsSync(key)) {
      launchEditor(key, 1);
    } else {
      const project = this.config.data.projectsByKey[key];
      assert(project, `project of key ${key} not exists`);
      launchEditor(project.path, 1);
    }
  }

  openConfigFileInEditor(projectPath: string) {
    let configFile;
    const configFiles = ['.umirc.js', '.umirc.ts', 'config/config.js', 'config/config.ts'];
    for (const file of configFiles) {
      if (existsSync(join(projectPath, file))) {
        configFile = join(projectPath, file);
        break;
      }
    }

    assert(configFile, `configFile not exists`);
    launchEditor(configFile, 1);
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

  async installDeps(npmClient, projectPath, { onProgress, onSuccess }) {
    await installDeps(npmClient, projectPath, {
      onData(data) {
        onProgress({
          install: data,
        });
      },
    });
    onSuccess();
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

      // get create key
      onSuccess({
        key,
      });

      // catch exit
      process.on('SIGINT', () => {
        if (key) {
          try {
            this.config.setCreatingProgress(key, {
              stepStatus: 3,
              failure: {
                message: 'exit UmiUi server',
              },
            });
          } catch (e) {}
        }
        process.exit();
      });

      setProgress({
        // 表示第几个 step，从 0 开始
        step: 1,
        // 0: 未开始
        // 1: 执行中
        // 2: 执行完成
        // 3: 执行失败
        stepStatus: 0,
        steps: ['校验参数', '安装或更新', '初始化项目文件', '安装依赖'],
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
      await installDeps(npmClient, targetDir, {});
      setProgress({
        stepStatus: 2,
      });
      setProgress({
        success: true,
      });
      // this.config.setCreatingProgressDone(key);
      // onSuccess();
    } catch (e) {
      if (key) {
        this.config.setCreatingProgress(key, {
          stepStatus: 3,
          failure: e,
        });
      }
      onFailure(e);
    } finally {
      process.removeListener('SIGINT', () => {
        console.log('success remove sigint');
      });
    }
  }

  checkDirValid({ dir }, { onSuccess, onFailure }) {
    try {
      // 入参校验
      assert(dir, `payload.dir must be supplied`);

      if (!existsSync(dir)) {
        return onSuccess();
      }

      // 非目录判断和权限校验
      const stat = statSync(dir);
      assert(stat.isDirectory(), `target directory must be a directory`);

      // 费空目录判断
      assert(emptyDir.sync(dir), `target directory must be empty`);
    } catch (e) {
      onFailure(e);
    }
  }

  getNpmClients() {
    const ret = [];

    try {
      execSync('tnpm --version', { stdio: 'ignore' });
      ret.push('tnpm');
    } catch (e) {}
    try {
      execSync('cnpm --version', { stdio: 'ignore' });
      ret.push('cnpm');
    } catch (e) {}
    try {
      execSync('npm --version', { stdio: 'ignore' });
      ret.push('npm');
    } catch (e) {}
    try {
      execSync('ayarn --version', { stdio: 'ignore' });
      ret.push('ayarn');
    } catch (e) {}
    try {
      execSync('yarn --version', { stdio: 'ignore' });
      ret.push('yarn');
    } catch (e) {}
    try {
      execSync('pnpm --version', { stdio: 'ignore' });
      ret.push('pnpm');
    } catch (e) {}

    return ret;
  }

  reloadProject(key: string) {}

  handleCoreData({ type, payload, lang }, { log, send, success, failure, progress }) {
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
        try {
          assert(
            existsSync(payload.path),
            `Add project failed, since path ${payload.path} don't exists.`,
          );
          log('info', `add project ${payload.path} with name ${payload.name}`);
          this.config.addProject(payload.path, payload.name);
          success();
        } catch (e) {
          console.error(chalk.red(`Error: Add project FAILED`));
          console.error(e);
          failure({
            message: e.message,
          });
        }
        break;
      case '@@project/delete':
        log('info', `delete project`);
        this.config.deleteProject(payload.key);
        success();
        break;
      case '@@project/open':
        log('info', `open project`);
        try {
          this.activeProject(payload.key, null, {
            lang,
          });
          success();
        } catch (e) {
          console.error(chalk.red(`Error: Attach Project of key ${payload.key} FAILED`));
          console.error(e);
          failure({
            message: e.message,
            stack: e.stack,
            actions: e.actions,
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
      case '@@project/checkDirValid':
        this.checkDirValid(payload, {
          onSuccess: success,
          onFailure(e) {
            failure({
              message: e.message,
            });
          },
        });
        break;
      case '@@project/createTemplateList':
        success({
          data: [
            {
              title: 'Ant Design Pro',
              description: 'A layout-only ant-design-pro boilerplate, use together with umi block',
              url: 'https://preview.pro.ant.design/',
            },
            {
              title: 'Basic Template',
              description: 'A simple boilerplate, support typescript.',
            },
          ],
        });
        break;
      case '@@project/getNpmClients':
        success({
          data: this.getNpmClients(),
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
      case '@@log/clear':
        this.logs = [];
        success();
        break;
      case '@@actions/installDependencies':
        this.installDeps(payload.npmClient, payload.projectPath, {
          onProgress: progress,
          onSuccess: success,
        });
        break;
      case '@@actions/reInstallDependencies':
        rimraf.sync(join(payload.projectPath, 'node_modules'));
        this.installDeps(payload.npmClient, payload.projectPath, {
          onProgress: progress,
          onSuccess: success,
        });
        break;
      case '@@actions/openConfigFile':
        this.openConfigFileInEditor(payload.projectPath);
        success();
        break;
      case '@@actions/openProjectInEditor':
        this.openProjectInEditor(payload.projectPath);
        success();
        break;
      case '@@app/notify':
        try {
          const notifier = require('node-notifier');
          const buildInImages = {
            error: resolve(__dirname, 'assets', 'error.png'),
            info: resolve(__dirname, 'assets', 'info.png'),
            success: resolve(__dirname, 'assets', 'success.png'),
            warning: resolve(__dirname, 'assets', 'warning.png'),
          };
          const { type, ...restPayload } = payload;
          const noticeConfig = {
            ...restPayload,
            contentImage: buildInImages[type] || buildInImages.info,
            icon: resolve(__dirname, 'assets', 'umi.png'),
            sound: true,
          };
          notifier.notify(noticeConfig);
          success();
        } catch (e) {
          console.error(chalk.red(`Error: Notify for ${e.message} FAILED`));
          failure(e);
        }
        break;
      default:
        log('error', chalk.red(`Unhandled message type ${type}`));
        break;
    }
  }

  async start() {
    return new Promise(async (resolve, reject) => {
      const express = require('express');
      const compression = require('compression');
      const serveStatic = require('serve-static');
      const app = express();
      app.use(compression());

      // Index Page
      let content = null;
      app.use((req, res) => {
        if (['/'].includes(req.path)) {
          if (process.env.LOCAL_DEBUG) {
            got(`http://localhost:8002${req.path}`)
              .then(({ body }) => {
                res.set('Content-Type', 'text/html');
                res.send(normalizeHtml(body));
              })
              .catch(e => {
                console.error(e);
              });
          } else {
            if (!content) {
              content = readFileSync(join(__dirname, '../client/dist/index.html'), 'utf-8');
            }
            res.send(normalizeHtml(content));
          }
        }
      });

      // Serve Static (Production Only)
      if (!process.env.LOCAL_DEBUG) {
        app.use(serveStatic(join(__dirname, '../client/dist')));
      }

      // 添加埋点脚本
      function normalizeHtml(html) {
        const ga = `
<!-- Global site tag (gtag.js) - Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=UA-145890626-1"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'UA-145890626-1');
</script>
        `;
        const deer = `
<script>
  !function(t,e,a,r,c){t.TracertCmdCache=t.TracertCmdCache||[],t[c]=window[c]||
  {_isRenderInit:!0,call:function(){t.TracertCmdCache.push(arguments)},
  start:function(t){this.call('start',t)}},t[c].l=new Date;
  var n=e.createElement(a),s=e.getElementsByTagName(a)[0];
  n.async=!0,n.src=r,s.parentNode.insertBefore(n,s);
  n.onerror=function(){console.warn(decodeURI('Tracert%20%E8%84%9A%E6%9C%AC%E6%9C%AA%E6%88%90%E5%8A%9F%E5%8A%A0%E8%BD%BD,%20%E8%AF%B7%E6%A3%80%E6%9F%A5%E7%BD%91%E7%BB%9C%E4%BB%A5%E5%8F%8A%20A%20%E4%BD%8D%E6%98%AF%E5%90%A6%E5%9C%A8%E4%B9%9D%E8%89%B2%E9%B9%BF%E5%BB%BA%E7%AB%8B%E6%B4%9E%E5%AF%9F'));
  var fallback=function(){console.warn(decodeURI('Tracert%20%E5%91%BD%E4%BB%A4%E6%89%A7%E8%A1%8C%E5%A4%B1%E8%B4%A5%EF%BC%8C%E8%AF%B7%E6%A3%80%E6%9F%A5%20JS%20%E6%98%AF%E5%90%A6%E6%AD%A3%E7%A1%AE%E5%BC%95%E5%85%A5'))};
  for(var fnlist=["call","start","config","logPv","info","err","click","expo","pageName","pageState","time","timeEnd","parse","checkExpo","stringify","report","set","before"],i=0;i<fnlist.length;i++){t[c][fnlist[i]]=fallback}};
  }(window,document,'script','https://ur.alipay.com/tracert_a1613.js','Tracert');
  Tracert.start({
  });
</script>
        `;
        if (process.env.BIGFISH_COMPAT) {
          html = html.replace('<body>', '<body>\n<script>window.g_bigfish = {};</script>');
        }
        if (!process.env.LOCAL_DEBUG) {
          const baconScript = process.env.BIGFISH_COMPAT ? deer : ga;
          html = html.replace('</head>', `${baconScript}\n</head>`);
        }
        return html;
      }

      const sockjs = require('sockjs');
      const ss = sockjs.createServer();

      const conns = {};
      function send(action) {
        const message = JSON.stringify(action);
        console.log(chalk.green.bold('>>>>'), formatLogMessage(message));
        Object.keys(conns).forEach(id => {
          conns[id].write(message);
        });
      }

      function formatLogMessage(message) {
        let ret = message.length > 500 ? `${message.slice(0, 500)} ${chalk.gray('...')}` : message;
        ret = ret.replace(/{"type":"(.+?)"/, `{"type":"${chalk.magenta.bold('$1')}"`);
        return ret;
      }

      ss.on('connection', conn => {
        conns[conn.id] = conn;
        console.log(`😀 ${chalk.green('建立连接')}: ${conn.id}`);
        function success(type, payload) {
          send({ type: `${type}/success`, payload });
        }
        function failure(type, payload) {
          send({ type: `${type}/failure`, payload });
        }
        function progress(type, payload) {
          send({ type: `${type}/progress`, payload });
        }

        this.send = send;

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

        conn.on('close', () => {
          console.log(`😭 ${chalk.red('断开连接')}: ${conn.id}`);
          delete conns[conn.id];
        });
        conn.on('data', message => {
          try {
            const { type, payload, lang } = JSON.parse(message);
            console.log(chalk.blue.bold('<<<<'), formatLogMessage(message));
            if (type.startsWith('@@')) {
              this.handleCoreData(
                { type, payload, lang },
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
                  action: { type, payload, lang },
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

      portfinder.basePort = 3000;
      portfinder.highestPort = 3333;
      const port = process.env.PORT || (await portfinder.getPortPromise());
      const server = app.listen(port, process.env.HOST || '127.0.0.1', err => {
        if (err) {
          reject(err);
        } else {
          const url = `http://localhost:${port}/`;
          console.log(`umi ui listening on port ${port}`);
          console.log(url);
          openBrowser(url);
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
