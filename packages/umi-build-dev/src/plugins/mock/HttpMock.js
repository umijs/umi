import { join } from 'path';
import { existsSync } from 'fs';
import chalk from 'chalk';
import assert from 'assert';
import bodyParser from 'body-parser';

class HttpMock {
  constructor({ cwd, devServer, api }) {
    this.devServer = devServer;
    this.api = api;
    this.absMockPath = join(cwd, 'mock');
    this.configPath = join(cwd, '.umirc.mock.js');
    this.applyMock();
  }

  applyMock() {
    try {
      this.realApplyMock();
    } catch (e) {
      console.error(chalk.red(`mock failed: ${e.message}`));
    }
  }

  realApplyMock() {
    const config = this.getConfig();
    this.api.debug(`config: ${JSON.stringify(config)}`);
    const { devServer } = this;
    const { app } = devServer;

    devServer.use(bodyParser.json({ limit: '5mb', strict: false }));
    devServer.use(
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

    // 调整 stack，把 historyApiFallback 放到最后
    let lastIndex = null;
    app._router.stack.forEach((item, index) => {
      if (item.name === 'webpackDevMiddleware') {
        lastIndex = index;
      }
    });
    // const mockAPILength = app._router.stack.length - 1 - lastIndex;
    if (lastIndex && lastIndex > 0) {
      const newStack = app._router.stack;
      newStack.push(newStack[lastIndex - 1]);
      newStack.push(newStack[lastIndex]);
      newStack.splice(lastIndex - 1, 2);
      app._router.stack = newStack;
    }
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
      path = splited[1];
    }
    return { method, path };
  }

  getConfig() {
    if (existsSync(this.configPath)) {
      this.api.registerBabel([this.configPath, this.absMockPath]);
      return require(this.configPath); // eslint-disable-line
    } else {
      return {};
    }
  }
}

export default HttpMock;
