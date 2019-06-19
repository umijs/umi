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

  it('replace umi.js, umi.css', () => {
    const service = {
      paths: {
        absOutputPath: join(__dirname, 'fixtures/chunkMaps'),
      },
      config: {
        ssr: true,
        manifest: {},
      },
    };
    replaceChunkMaps(service);
    expect(result).toMatch(/\/umiPublic\/umi\.fa5ee7b5\.css/);
    expect(result).toMatch(/\/umiPublic\/umi\.42682148\.js/);
  });
});
