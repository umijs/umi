import { join } from 'path';
import replaceChunkMaps from '../src/plugins/commands/replaceChunkMaps';
const fs = require('fs');

describe('replaceChunkMaps', () => {
  let result = '';
  let spy;

  beforeAll(() => {
    spy = jest.spyOn(fs, 'writeFileSync').mockImplementation((filePath, data) => {
      result = data;
    });
  });
  beforeEach(() => {
    result = '';
  });
  afterEach(() => {
    result = '';
  });
  afterAll(() => {
    spy.mockRestore();
  });

  it('common umi.js, umi.css', () => {
    const service = {
      paths: {
        absOutputPath: join(__dirname, 'fixtures/chunkMaps'),
      },
      config: {
        ssr: true,
      },
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
    expect(result).toMatch(/\/umiPublic\/umi\.baa67d11\.css/);
    expect(result).toMatch(/\/umiPublic\/umi\.6791e2ab\.js/);
  });
});
