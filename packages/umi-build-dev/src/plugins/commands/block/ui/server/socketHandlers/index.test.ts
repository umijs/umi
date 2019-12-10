const fs = require('fs');

describe('block interface socketHandlers test', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = {
      ...OLD_ENV,
    };
    delete process.env.BIGFISH_COMPAT;
  });

  afterEach(() => {
    process.env = OLD_ENV;
  });

  describe('org.umi.block.checkIfCanAdd', () => {
    it('约定式路由报错', () => {
      const checkIfCanAdd = require('./org.umi.block.checkIfCanAdd').default;
      const params = {
        success: jest.fn(),
        failure: jest.fn(),
        lang: 'zh-CN',
        payload: {},
        api: {
          config: {
            plugins: [
              'umi-plugin-react',
              {
                react: true,
              },
            ],
          },
        },
      };
      checkIfCanAdd(params);
      expect(params.failure.mock.calls[0][0].message).toMatch(/不支持约定式路由/);

      const params2 = {
        success: jest.fn(),
        failure: jest.fn(),
        lang: 'zh-CN',
        payload: {},
        api: {
          config: {
            routes: [],
            plugins: [
              'umi-plugin-react',
              {
                react: true,
              },
            ],
          },
        },
      };

      checkIfCanAdd(params2);
      expect(params2.failure.mock.calls[0][0].message).toMatch(/不支持约定式路由/);
    });

    it('没有 package.json', () => {
      const existsSyncMock = jest.spyOn(fs, 'existsSync').mockImplementation(res => false);
      const checkIfCanAdd = require('./org.umi.block.checkIfCanAdd').default;
      const params = {
        success: jest.fn(),
        failure: jest.fn(),
        lang: 'zh-CN',
        payload: {},
        api: {
          cwd: '/test/',
          config: {
            routes: [{ path: '/', component: './Index' }],
            plugins: [
              'umi-plugin-react',
              {
                react: true,
              },
            ],
          },
        },
      };
      checkIfCanAdd(params);
      expect(existsSyncMock).toHaveBeenCalledWith('/test/package.json');
      expect(params.failure.mock.calls[0][0].message).toMatch(/package\.json/);
    });

    it('dva', () => {
      jest.spyOn(fs, 'existsSync').mockImplementation(res => true);
      const checkIfCanAdd = require('./org.umi.block.checkIfCanAdd').default;
      const params = {
        success: jest.fn(),
        failure: jest.fn(),
        lang: 'zh-CN',
        payload: {
          item: {
            features: ['dva'],
          },
        },
        api: {
          cwd: '/test/',
          config: {
            routes: [{ path: '/', component: './Index' }],
            plugins: [
              [
                'umi-plugin-react',
                {
                  react: true,
                },
              ],
            ],
          },
        },
      };
      checkIfCanAdd(params);
      expect(params.failure.mock.calls[0][0].message).toMatch(/dva/);

      const params2 = {
        success: jest.fn(),
        failure: jest.fn(),
        lang: 'zh-CN',
        payload: {
          item: {
            features: ['dva'],
          },
        },
        api: {
          cwd: '/test/',
          config: {
            routes: [{ path: '/', component: './Index' }],
            plugins: [
              [
                'umi-plugin-react',
                {
                  react: true,
                  dva: true,
                },
              ],
            ],
          },
        },
      };
      checkIfCanAdd(params2);
      expect(params2.failure).not.toHaveBeenCalled();
      expect(params2.success).toHaveBeenCalledWith({ data: true, success: true });
    });

    it('i18n', () => {
      jest.spyOn(fs, 'existsSync').mockImplementation(res => true);
      const checkIfCanAdd = require('./org.umi.block.checkIfCanAdd').default;
      const params = {
        success: jest.fn(),
        failure: jest.fn(),
        lang: 'zh-CN',
        payload: {
          item: {
            features: ['i18n'],
          },
        },
        api: {
          cwd: '/test/',
          config: {
            routes: [{ path: '/', component: './Index' }],
            plugins: [
              [
                'umi-plugin-react',
                {
                  react: true,
                },
              ],
            ],
          },
        },
      };
      checkIfCanAdd(params);
      expect(params.failure.mock.calls[0][0].message).toMatch(/i18n/);

      const params2 = {
        success: jest.fn(),
        failure: jest.fn(),
        lang: 'zh-CN',
        payload: {
          item: {
            features: ['i18n'],
          },
        },
        api: {
          cwd: '/test/',
          config: {
            routes: [{ path: '/', component: './Index' }],
            plugins: [
              [
                'umi-plugin-react',
                {
                  react: true,
                  locale: true,
                },
              ],
            ],
          },
        },
      };
      checkIfCanAdd(params2);
      expect(params2.failure).not.toHaveBeenCalled();
      expect(params2.success).toHaveBeenCalledWith({ data: true, success: true });
    });

    it('Bigfish', () => {
      jest.spyOn(fs, 'existsSync').mockImplementation(res => true);
      process.env.BIGFISH_COMPAT = 'true';
      const checkIfCanAdd = require('./org.umi.block.checkIfCanAdd').default;
      const params = {
        success: jest.fn(),
        failure: jest.fn(),
        lang: 'zh-CN',
        payload: {
          item: {
            features: ['dva', 'i18n'],
          },
        },
        api: {
          cwd: '/test/',
          config: {
            routes: [{ path: '/', component: './Index' }],
          },
        },
      };
      checkIfCanAdd(params);
      expect(params.failure.mock.calls[0][0].message).toMatch(/locale/);

      const params2 = {
        success: jest.fn(),
        failure: jest.fn(),
        lang: 'zh-CN',
        payload: {
          item: {
            features: ['dva', 'i18n'],
          },
        },
        api: {
          cwd: '/test/',
          config: {
            dva: false,
            routes: [{ path: '/', component: './Index' }],
          },
        },
      };
      checkIfCanAdd(params2);
      expect(params2.failure.mock.calls[0][0].message).toMatch(/dva/);

      const params3 = {
        success: jest.fn(),
        failure: jest.fn(),
        lang: 'zh-CN',
        payload: {
          item: {
            features: ['dva', 'i18n'],
          },
        },
        api: {
          cwd: '/test/',
          config: {
            routes: [{ path: '/', component: './Index' }],
            dva: true,
            locale: true,
          },
        },
      };
      checkIfCanAdd(params3);
      expect(params3.failure).not.toHaveBeenCalled();
      expect(params3.success).toHaveBeenCalledWith({ data: true, success: true });
    });
  });
});
