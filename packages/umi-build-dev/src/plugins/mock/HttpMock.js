import { join } from 'path';
import { existsSync } from 'fs';
import chalk from 'chalk';
import assert from 'assert';
import bodyParser from 'body-parser';
import chokidar from 'chokidar';
import glob from 'glob';

function MOCK_START(req, res, next) {
  next();
}

function MOCK_END(req, res, next) {
  next();
}

class HttpMock {
  constructor({ cwd, app, api }) {
    this.app = app;
    this.api = api;
    this.absMockPath = join(cwd, 'mock');
    this.configPath = join(cwd, '.umirc.mock.js');
    this.api.registerBabel([this.configPath, this.absMockPath]);
    this.applyMock();
    this.watch();
  }

  applyMock(isWatch) {
    try {
      this.realApplyMock(isWatch);
    } catch (e) {
      console.error(chalk.red(`mock failed: ${e.message}`));
    }
  }

  watch() {
    if (process.env.WATCH_FILES === 'none') return;
    const {
      api: {
        utils: { debug },
      },
    } = this;
    const watcher = chokidar.watch([this.configPath, this.absMockPath], {
      ignoreInitial: true,
    });
    watcher.on('all', (event, file) => {
      debug(`[${event}] ${file}`);
      this.applyMock(/* isWatch */ true);
    });
  }

  /**
   * Delete from MOCK_START to MOCK_END
   */
  deleteRoutes() {
    const {
      app,
      api: {
        utils: { debug },
      },
    } = this;
    let startIndex = null;
    let endIndex = null;
    app._router.stack.forEach((item, index) => {
      if (item.name === 'MOCK_START') startIndex = index;
      if (item.name === 'MOCK_END') endIndex = index;
    });
    if (startIndex !== null && endIndex !== null) {
      app._router.stack.splice(startIndex, endIndex - startIndex + 1);
    }
    debug(
      `routes after changed: ${app._router.stack
        .map(item => item.name || 'undefined name')
        .join(', ')}`,
    );
  }

  realApplyMock(isWatch) {
    const { debug } = this.api.utils;
    const config = this.getConfig();
    debug(`config: ${JSON.stringify(config)}`);
    const { app } = this;

    let startIndex = null;
    let endIndex = null;
    let routesLength = null;

    if (isWatch) {
      app._router.stack.forEach((item, index) => {
        if (item.name === 'MOCK_START') startIndex = index;
        if (item.name === 'MOCK_END') endIndex = index;
      });
      if (startIndex !== null && endIndex !== null) {
        app._router.stack.splice(startIndex, endIndex - startIndex + 1);
      }
      routesLength = app._router.stack.length;
    }

    app.use(MOCK_START);
    app.use(bodyParser.json({ limit: '5mb', strict: false }));
    app.use(
      bodyParser.urlencoded({
        extended: true,
        limit: '5mb',
      }),
    );

    Object.keys(config).forEach(key => {
      const keyParsed = this.parseKey(key);
      assert(!!app[keyParsed.method], `method of ${key} is not valid`);
      assert(
        typeof config[key] === 'function' || typeof config[key] === 'object',
        `mock value of ${key} should be function or object, but got ${typeof config[
          key
        ]}`,
      );
      app[keyParsed.method](
        keyParsed.path,
        this.createMockHandler(keyParsed.method, keyParsed.path, config[key]),
      );
    });
    app.use(MOCK_END);

    if (isWatch) {
      const newRoutes = app._router.stack.splice(
        routesLength,
        app._router.stack.length - routesLength,
      );
      app._router.stack.splice(startIndex, 0, ...newRoutes);
    }

    // 调整 stack，把 UMI_PLUGIN_404 放到最后
    debug(
      `routes after resort: ${app._router.stack
        .map(item => item.name || 'undefined name')
        .join(', ')}`,
    );
  }

  createMockHandler(method, path, value) {
    return function mockHandler(...args) {
      const res = args[1];
      if (typeof value === 'function') {
        value(...args);
      } else {
        res.json(value);
      }
    };
  }

  parseKey(key) {
    let method = 'get';
    let path = key;
    if (key.indexOf(' ') > -1) {
      const splited = key.split(' ');
      method = splited[0].toLowerCase();
      path = splited[1]; // eslint-disable-line
    }
    return { method, path };
  }

  disableRequireCache() {
    Object.keys(require.cache).forEach(file => {
      if (file === this.configPath || file.indexOf(this.absMockPath) > -1) {
        delete require.cache[file];
      }
    });
  }

  getConfig() {
    const { debug } = this.api.utils;

    if (existsSync(this.configPath)) {
      this.disableRequireCache();
      return require(this.configPath); // eslint-disable-line
    } else if (existsSync(this.absMockPath)) {
      this.disableRequireCache();
      const mockFiles = glob.sync('**/*.js', {
        cwd: this.absMockPath,
      });
      debug(`mockFiles: ${JSON.stringify(mockFiles)}`);
      return mockFiles.reduce((memo, mockFile) => {
        memo = {
          ...memo,
          ...require(join(this.absMockPath, mockFile)),
        };
        return memo;
      }, {});
    } else {
      return {};
    }
  }
}

export default HttpMock;
