import { join, basename } from 'path';
import { winPath } from 'umi-utils';
import replaceChunkMaps from './replaceChunkMaps';

const fs = require('fs');

describe('replaceChunkMaps', () => {
  let result = {};
  let spy;
  let spy2;
  let spy3;

  beforeAll(() => {
    spy = jest.spyOn(fs, 'writeFileSync').mockImplementation((filePath, data) => {
      result[basename(filePath)] = data;
    });
    spy2 = jest.spyOn(fs, 'readFileSync').mockImplementation(
      () => `
      serverRender = async ctx => {
        const htmlTemplateMap = {
          '/': _react.default.createElement("html", null, _react.default.createElement("head", null,_react.default.createElement("link", {
            rel: "stylesheet",
            href: "antd.css"
          }), _react.default.createElement("link", {
            rel: "stylesheet",
            href: "/umiPublic/__UMI_SERVER__.css"
          }), _react.default.createElement("script", {
            src: "/umiPublic/__UMI_SERVER__.js"
          }))),
        };
        return {
          htmlElement: htmlTemplateMap[pathname],
          rootContainer
        };
      }; // using project react-dom version
      // https://github.com/facebook/react/issues/13991


      exports.ReactDOMServer = ReactDOMServer = __webpack_require__(/*! react-dom/server */ "react-dom/server");
      `,
    );
    spy3 = jest.spyOn(fs, 'existsSync').mockImplementation(() => true);
  });
  beforeEach(() => {
    result = {};
  });
  afterEach(() => {
    result = {};
  });
  afterAll(() => {
    spy.mockRestore();
    spy2.mockRestore();
    spy3.mockRestore();
  });

  it('common umi.js, umi.css', () => {
    const service = {
      paths: {
        absOutputPath: join(winPath(__dirname), 'fixtures/chunkMaps'),
      },
      config: {
        ssr: true,
      },
      routes: [
        {
          path: '/',
          routes: [],
        },
      ],
    };
    const clientStat = {
      compilation: {
        chunkGroups: [
          {
            name: 'umi',
            chunks: [
              {
                files: ['umi.baa67d11.css', 'umi.6791e2ab.js'],
              },
            ],
          },
        ],
      },
    };
    replaceChunkMaps(service, clientStat);
    expect(result['umi.server.js']).toMatchSnapshot();
  });

  it('common umi.js without umi.css', () => {
    const service = {
      paths: {
        absOutputPath: join(winPath(__dirname), 'fixtures/chunkMaps'),
      },
      config: {
        ssr: true,
      },
      routes: [
        {
          path: '/',
          routes: [],
        },
      ],
    };
    const clientStat = {
      compilation: {
        chunkGroups: [
          {
            name: 'umi',
            chunks: [
              {
                files: ['umi.6791e2ab.js'],
              },
            ],
          },
        ],
      },
    };
    replaceChunkMaps(service, clientStat);
    expect(result['umi.server.js']).toMatchSnapshot();
  });
});
