const fs = require('fs');

describe('block interface socketHandlers test', () => {
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
      existsSyncMock.mockRestore();
    });

    it('dva', () => {
      const existsSyncMock = jest.spyOn(fs, 'existsSync').mockImplementation(res => true);
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
      expect(params.failure.mock.calls[0][0].message).toMatch(/umi-plugin-react 插件并开启 dva/);

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
      existsSyncMock.mockRestore();
    });

    it('i18n', () => {
      const existsSyncMock = jest.spyOn(fs, 'existsSync').mockImplementation(res => true);
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
      expect(params.failure.mock.calls[0][0].message).toMatch(/umi-plugin-react 插件并开启 locale/);

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
      existsSyncMock.mockRestore();
    });

    it('Bigfish', () => {
      const existsSyncMock = jest.spyOn(fs, 'existsSync').mockImplementation(res => true);
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
      expect(params.failure.mock.calls[0][0].message).toMatch(/请开启 locale 配置/);

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
      expect(params2.failure.mock.calls[0][0].message).toMatch(/请开启 dva 配置/);

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

      const params4 = {
        success: jest.fn(),
        failure: jest.fn(),
        lang: 'en-US',
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
      checkIfCanAdd(params4);
      expect(params4.failure.mock.calls[0][0].message).toMatch(/请开启 dva 配置/);
      process.env.BIGFISH_COMPAT = null;
      existsSyncMock.mockRestore();
    });
  });
});
