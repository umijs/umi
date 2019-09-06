import assert from 'assert';
import chalk from 'chalk';
import emptyDir from 'empty-dir';
import clearModule from 'clear-module';
import { join, resolve } from 'path';
import launchEditor from 'launch-editor';
import openBrowser from 'react-dev-utils/openBrowser';
import { existsSync, readFileSync, statSync } from 'fs';
import { execSync } from 'child_process';
import got from 'got';
import { pick } from 'lodash';
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
  OpenConfigFileAction,
  OpenProjectAction,
  ReInstallDependencyAction,
} from './Actions';
import {
  isBigfishProject,
  isDepLost,
  isPluginLost,
  isUmiProject,
  isUsingBigfish,
  isUsingUmi,
} from './checkProject';

import getScripts from './scripts';
import isDepFileExists from './utils/isDepFileExists';

const debug = require('debug')('umiui:UmiUI');
process.env.UMI_UI = 'true';

export default class UmiUI {
  cwd: string;

  servicesByKey: any;

  server: any;

  socketServer: any;

  logs: any;

  config: Config;

  send: any;

  developMode: boolean = false;

  npmClients: string[] = [];

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

    process.nextTick(() => {
      this.initNpmClients();
    });
  }

  activeProject(key: string, service?: any, opts?: any) {
    const { lang } = opts || {};
    const project = this.config.data.projectsByKey[key];
    assert(project, `project of key ${key} not exists`);

    // Check exists.
    if (!existsSync(project.path)) {
      throw new ActiveProjectError({
        title: {
          'zh-CN': `项目 ${project.path} 路径不存在。`,
          'en-US': `Project ${project.path} not exists.`,
        },
        lang,
        actions: [BackToHomeAction],
      });
    }

    // Check umi valid.
    if (!isUmiProject(project.path)) {
      throw new ActiveProjectError({
        title: {
          'zh-CN': `项目 ${project.path} 不是 Umi 项目。`,
          'en-US': `Project ${project.path} is not a valid Umi project.`,
        },
        lang,
        actions: [BackToHomeAction],
      });
    }

    if (process.env.BIGFISH_COMPAT && isUsingUmi(project.path)) {
      throw new ActiveProjectError({
        title: {
          'zh-CN': `项目 ${project.path} 是 Umi 项目，不能使用 Bigfish 打开。`,
          'en-US': `Project ${project.path} is Umi Project, don't open it with Bigfish.`,
        },
        lang,
        actions: [BackToHomeAction],
      });
    }

    if (!process.env.BIGFISH_COMPAT && isUsingBigfish(project.path)) {
      throw new ActiveProjectError({
        title: {
          'zh-CN': `项目 ${project.path} 是 Bigfish 项目，不能使用 Umi 打开。`,
          'en-US': `Project ${project.path} is Bigfish Project, don't open it with Umi.`,
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
        ? '@alipay/bigfish/_Service.js'
        : 'umi/_Service.js';
      const binModule = process.env.BIGFISH_COMPAT
        ? '@alipay/bigfish/bin/bigfish.js'
        : 'umi/bin/umi.js';
      const pkgModule = process.env.BIGFISH_COMPAT
        ? '@alipay/bigfish/package.json'
        : 'umi/package.json';
      const cwd = project.path;
      const localService = isDepFileExists(cwd, serviceModule);
      const localBin = isDepFileExists(cwd, binModule);
      if (process.env.UI_CHECK_LOCAL !== 'none' && localBin && !localService) {
        // 有 Bin 但没 Service，说明版本不够
        const { version } = JSON.parse(readFileSync(join(cwd, 'node_modules', pkgModule), 'utf-8'));
        throw new ActiveProjectError({
          title: process.env.BIGFISH_COMPAT
            ? `本地项目的 Bigfish 版本（${version}）过低，请升级到 @alipay/bigfish@2.20 或以上，<a target="_blank" href="https://yuque.antfin-inc.com/bigfish/doc/uzfwoc#ff1deb63">查看详情</a>。`
            : {
                'zh-CN': `本地项目的 Umi 版本（${version}）过低，请升级到 umi@2.9 或以上，<a target="_blank" href="https://umijs.org/zh/guide/faq.html#umi-%E7%89%88%E6%9C%AC%E8%BF%87%E4%BD%8E%EF%BC%8C%E8%AF%B7%E5%8D%87%E7%BA%A7%E5%88%B0%E6%9C%80%E6%96%B0">查看详情</a>。`,
                'en-US': `Umi version (${version}) of the project is too low, please upgrade to umi@2.9 or above, <a target="_blank" href="https://umijs.org/guide/faq.html#umi-version-is-too-low-please-upgrade-to-umi-2-9-or-above">view details</a>.`,
              },
          lang,
          actions: [ReInstallDependencyAction, OpenProjectAction, BackToHomeAction],
        });
      }

      try {
        const servicePath = process.env.LOCAL_DEBUG
          ? 'umi-build-dev/lib/Service'
          : resolveFrom.silent(cwd, serviceModule) || 'umi-build-dev/lib/Service';
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
        if (isDepLost(e) || isPluginLost(e)) {
          throw new ActiveProjectError({
            title: {
              'zh-CN': `依赖文件没找到。`,
              'en-US': 'Dependency file not found.',
            },
            message: e.message,
            stack: e.stack,
            lang,
            actions: [ReInstallDependencyAction, BackToHomeAction],
          });
        } else {
          throw new ActiveProjectError({
            title: {
              'zh-CN': '其他错误',
              'en-US': 'Other Errors',
            },
            message: e.message,
            stack: e.stack,
            lang,
            // exception tag
            exception: true,
            actions: [BackToHomeAction],
          });
        }
      }
    }

    this.config.setCurrentProject(key);
    this.config.editProject(key, {
      opened_at: +new Date(),
    });
  }

  openProjectInEditor(
    key: string,
    callback: { failure?: (any) => void; success?: () => void } = {},
    lang: string = 'zh-CN',
  ) {
    let launchPath = key;
    if (!(key.startsWith('/') && existsSync(key))) {
      const project = this.config.data.projectsByKey[key];
      assert(project, `project of key ${key} not exists`);
      launchPath = project.path;
    }
    if (!existsSync(launchPath)) {
      if (callback.failure) {
        const msg = {
          'zh-CN': `打开编辑器失败 ${launchPath}，项目不存在`,
          'en-US': `Open Editor Failure, ${launchPath}, project does not exist`,
        };
        console.error(chalk.red(msg[lang]));
        callback.failure({
          message: msg[lang],
        });
      }
      if (callback.success) {
        callback.success();
      }
    } else {
      launchEditor(launchPath, (fileName, errorMsg) => {
        // log error if any
        if (!errorMsg) return;
        let msg = {
          'zh-CN': `打开编辑器失败 ${launchPath}`,
          'en-US': `Open Editor Failure, ${launchPath}`,
        };
        if (errorMsg === 'spawn code ENOENT.') {
          msg = {
            'zh-CN': `打开编辑器失败，需要全局安装'code'，你可以打开VS Code，然后运行Shell Command: Install 'code' command in Path`,
            'en-US': `Open Editor Failure, need install 'code' command in Path. you can open VS Code, and run >Shell Command: Install 'code' command in Path`,
          };
        }
        if (callback.failure) {
          console.error(chalk.red(msg[lang]));
          callback.failure({
            message: msg[lang],
          });
        }
        if (callback.success) {
          callback.success();
        }
      });
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
    launchEditor(configFile);
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

  async installDeps(npmClient, projectPath, { onProgress, onSuccess, taobaoSpeedUp }) {
    await installDeps(npmClient, projectPath, {
      taobaoSpeedUp,
      onData(data) {
        onProgress({
          install: data,
        });
      },
    });
    onSuccess();
  }

  async createProject(opts = {}, { onSuccess, onFailure, onProgress, lang }) {
    let key = opts.key;
    let retryFrom = opts.retryFrom;

    let createOpts = opts;
    if (key) {
      assert('retryFrom' in opts, `key 和 retryFrom 必须同时提供。`);
      // eslint-disable-next-line prefer-destructuring
      createOpts = this.config.data.projectsByKey[key].createOpts;
    }

    const setProgress = args => {
      assert(key, `key is not initialized.`);
      this.config.setCreatingProgress(key, args);
    };

    const sigintHandler = () => {
      if (key) {
        this.config.setCreatingProgress(key, {
          stepStatus: 3,
          failure: {
            message: 'exit UmiUi server',
          },
        });
      }
      process.exit();
    };

    try {
      assert(createOpts.baseDir, `baseDir must be supplied`);
      assert(createOpts.name, `name must be supplied`);
      assert(createOpts.type, `type must be supplied`);
      const targetDir = join(createOpts.baseDir, createOpts.name);

      if (!retryFrom) {
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

        // 0
        assert(
          !existsSync(targetDir) || emptyDir.sync(targetDir),
          `target dir ${targetDir} exists and not empty`,
        );

        // 1
        key = this.config.addProject({
          path: targetDir,
          name: createOpts.name,
          npmClient: createOpts.npmClient,
          createOpts,
        });

        // get create key
        onSuccess({
          key,
        });

        setProgress({
          // 表示第几个 step，从 0 开始
          step: 1,
          // 0: 未开始
          // 1: 执行中
          // 2: 执行完成
          // 3: 执行失败
          stepStatus: 0,
          steps: {
            'zh-CN': ['校验参数', '安装或更新 create-umi', '初始化项目', '安装依赖'],
            'en-US': [
              'Validate Params',
              'Install or Update create-umi',
              'Initialize Project',
              'Install Dependency',
            ],
          },
        });
      }

      // catch exit
      process.on('SIGINT', sigintHandler);

      // 1
      let creatorPath;
      // step 2 依赖 step 1
      if (retryFrom === 2) {
        retryFrom = 1;
      }
      if (!retryFrom || retryFrom <= 1) {
        setProgress({
          step: 1,
          stepStatus: 1,
        });
        creatorPath = await installCreator({
          // npmClient: createOpts.npmClient,
          onData(data) {
            onProgress({
              install: data,
            });
          },
        });
        setProgress({
          stepStatus: 2,
        });
      }

      // 2
      if (!retryFrom || retryFrom <= 2) {
        setProgress({
          step: 2,
          stepStatus: 1,
        });
        clearModule(creatorPath);
        await require(creatorPath).run({
          cwd: targetDir,
          type: createOpts.type,
          args: createOpts.args,
        });
        setProgress({
          stepStatus: 2,
        });
      }

      // 3
      if (!retryFrom || retryFrom <= 3) {
        setProgress({
          step: 3,
          stepStatus: 1,
        });
        // 重装 node_modules 时先清空，否则可能会失败
        if (retryFrom === 3) {
          rimraf.sync(join(targetDir, 'node_modules'));
        }
        await installDeps(createOpts.npmClient, targetDir, {
          taobaoSpeedUp: this.hasTaobaoSpeedUp(),
          onData(data) {
            onProgress({
              install: data,
            });
          },
        });
        setProgress({
          stepStatus: 2,
        });
        setProgress({
          success: true,
        });
      }
    } catch (e) {
      if (key) {
        this.config.setCreatingProgress(key, {
          stepStatus: 3,
          failure: e,
        });
      }
      onFailure(e);
    } finally {
      process.removeListener('SIGINT', sigintHandler);
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

  initNpmClients() {
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

    this.npmClients = ret;
  }

  getNpmClients() {
    return this.npmClients;
  }

  reloadProject(key: string) {}

  handleCoreData({ type, payload, lang }, { log, send, success, failure, progress }) {
    switch (type) {
      case '@@project/getExtraAssets':
        success(this.getExtraAssets());
        break;
      case '@@project/list':
        success({
          data: this.config.data,
        });
        break;
      case '@@project/detail':
        success({
          data: this.config.data.projectsByKey[payload.key],
        });
        break;
      case '@@project/add':
        // TODO: 检验是否 umi 项目，不是则抛错给客户端
        try {
          assert(
            existsSync(payload.path),
            `Add project failed, since path ${payload.path} don't exists.`,
          );
          log('info', `Add project ${payload.path} with name ${payload.name}`);
          this.config.addProject({
            path: payload.path,
            name: payload.name,
          });
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
        if (this.config.data.projectsByKey[payload.key]) {
          log('info', `Delete project: ${this.getProjectName(payload.key)}`);
          this.config.deleteProject(payload.key);
          success();
        }
        break;
      case '@@project/open':
        try {
          log('info', `Open project: ${this.getProjectName(payload.key)}`);
          this.activeProject(payload.key, null, {
            lang,
          });
          success();
        } catch (e) {
          console.error(chalk.red(`Error: Attach Project of key ${payload.key} FAILED`));
          console.error(e);
          failure(pick(e, ['title', 'message', 'stack', 'actions', 'exception']));
        }
        break;
      case '@@project/openInEditor':
        log('info', `Open in editor: ${this.getProjectName(payload.key)}`);
        this.openProjectInEditor(
          payload.key,
          {
            success,
            failure,
          },
          lang,
        );
        break;
      case '@@project/edit':
        log('info', `Edit project: ${this.getProjectName(payload.key)}`);
        this.config.editProject(payload.key, {
          name: payload.name,
        });
        success();
        break;
      case '@@project/setCurrentProject':
        this.config.setCurrentProject(payload.key);
        success();
        break;
      case '@@project/create':
        log('info', `Create project: ${this.getProjectName(payload.key)}`);
        this.createProject(payload, {
          onSuccess: success,
          onFailure(e) {
            failure({
              message: e.message,
            });
          },
          onProgress: progress,
          lang,
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
      case '@@fs/listDirectory': {
        try {
          const data = listDirectory(payload.dirPath, {
            directoryOnly: true,
          });
          success({
            data,
          });
        } catch (e) {
          failure({
            message: e.message,
          });
        }
        break;
      }
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
        this.config.setProjectNpmClient({ key: payload.key, npmClient: payload.npmClient });
        this.installDeps(payload.npmClient, payload.projectPath, {
          taobaoSpeedUp: this.hasTaobaoSpeedUp(),
          onProgress: progress,
          onSuccess: success,
        });
        break;
      case '@@actions/reInstallDependencies':
        this.config.setProjectNpmClient({ key: payload.key, npmClient: payload.npmClient });
        rimraf.sync(join(payload.projectPath, 'node_modules'));
        this.installDeps(payload.npmClient, payload.projectPath, {
          taobaoSpeedUp: this.hasTaobaoSpeedUp(),
          onProgress: progress,
          onSuccess: success,
        });
        break;
      case '@@actions/openConfigFile':
        this.openConfigFileInEditor(payload.projectPath);
        success();
        break;
      case '@@actions/openProjectInEditor':
        this.openProjectInEditor(
          payload.projectPath,
          {
            success,
            failure,
          },
          lang,
        );
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
      console.log(`🚀 Starting Umi UI using umi@${process.env.UMI_VERSION}...`);

      const express = require('express');
      const compression = require('compression');
      const app = express();
      app.use(compression());

      // Index Page
      let content = null;

      // Serve Static (Production Only)
      if (!process.env.LOCAL_DEBUG) {
        app.use(
          express.static(join(__dirname, '../client/dist'), {
            index: false,
          }),
        );
      }

      app.use('/*', (req, res) => {
        getScripts().then(scripts => {
          if (process.env.LOCAL_DEBUG) {
            got(`http://localhost:8002${req.path}`)
              .then(({ body }) => {
                res.set('Content-Type', 'text/html');
                res.send(normalizeHtml(body, scripts));
              })
              .catch(e => {
                console.error(e);
              });
          } else {
            if (!content) {
              content = readFileSync(join(__dirname, '../client/dist/index.html'), 'utf-8');
            }
            res.send(normalizeHtml(content, scripts));
          }
        });
      });

      // 添加埋点脚本
      function normalizeHtml(html, scripts) {
        const { bigfishScripts, umiScripts } = scripts;
        // basementMonitor
        html = html.replace(
          '<head>',
          '<head><meta name="bm_app_id" content="5d68ffc1d46d8743e5445b68">',
        );
        html = html.replace(
          '<body>',
          `<body>\n<script>window.g_umi = { version: "${process.env.UMI_VERSION || ''}"};</script>`,
        );
        if (process.env.BIGFISH_COMPAT) {
          html = html.replace(
            '<body>',
            `<body>\n<script>window.g_bigfish = { version: "${process.env.BIGFISH_VERSION ||
              ''}" };</script>`,
          );
        }
        if (!process.env.LOCAL_DEBUG) {
          const headScript = process.env.BIGFISH_COMPAT
            ? bigfishScripts.head.join('\n')
            : umiScripts.head.join('\n');
          html = html.replace('</head>', `${headScript}</head>`);

          const footScript = process.env.BIGFISH_COMPAT
            ? bigfishScripts.foot.join('\n')
            : umiScripts.foot.join('\n');
          html = html.replace('</body>', `${footScript}</body>`);
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
        console.log(`🔗 ${chalk.green('Connected to')}: ${conn.id}`);
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
          console.log(`😿 ${chalk.red('Disconnected to')}: ${conn.id}`);
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
          console.log(`🧨  Ready on ${url}`);
          openBrowser(url);
          resolve();
        }
      });
      ss.installHandlers(server, {
        prefix: '/umiui',
        log: () => {},
      });
      this.socketServer = ss;
      this.server = server;
    });
  }

  /**
   * 返回 projcet name，如果 project 不存在，则返回 key
   * @param key project key
   */
  getProjectName(key: string): string {
    if (!key) {
      return '';
    }
    const project = this.config.data.projectsByKey[key];
    if (!project) {
      return key;
    }
    return project.name;
  }

  /**
   * 是否使用淘宝加速
   * @param key project key
   */
  hasTaobaoSpeedUp(): boolean {
    // 一期默认开启，二期走全局配置。
    return true;
  }
}
