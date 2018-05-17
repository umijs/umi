import { join } from 'path';
import dvaPlugin, { getModel } from './index';

const RENDER = 'testrender';
const base = join(__dirname, 'fixtures', 'getModel');

const api = {
  service: {
    config: {
      singular: false,
    },
    paths: {
      absTmpDirPath: base,
    },
  },
  utils: {
    winPath(p) {
      return p;
    },
  },
  placeholder: {
    RENDER,
  },
};

function normalizeModels(models, base) {
  return models.map(model => model.replace(base, '$CWD$'));
}

describe('umi-plugin-dva', () => {
  it('getModel with model.js', () => {
    const dir = join(base, 'model');
    const models = normalizeModels(getModel(dir, api), dir);
    expect(models).toEqual(['$CWD$/model.js']);
  });

  it('getModel with models directory', () => {
    const dir = join(base, 'models');
    const models = normalizeModels(getModel(dir, api), dir);
    expect(models).toEqual([
      '$CWD$/models/a.js',
      '$CWD$/models/a.jsx',
      '$CWD$/models/a.ts',
      '$CWD$/models/a.tsx',
    ]);
  });

  it('getModel with model directory and singular', () => {
    const dir = join(base, 'models-with-singular');
    const models = normalizeModels(
      getModel(dir, {
        ...api,
        service: { config: { singular: true } },
      }),
      dir,
    );
    expect(models).toEqual(['$CWD$/model/a.js']);
  });

  it('getModel ignore d.ts', () => {
    const dir = join(base, 'ignore-d-ts');
    const models = normalizeModels(getModel(dir, api), dir);
    expect(models).toEqual(['$CWD$/models/a.ts']);
  });

  it('getModel ignore test files', () => {
    const dir = join(base, 'ignore-test-files');
    const models = normalizeModels(getModel(dir, api), dir);
    expect(models).toEqual(['$CWD$/models/a.ts']);
  });

  it('apply modifyDvaRender', () => {
    api.service.applyPlugins = (name, params) => {
      if (name === 'modifyDvaRender') {
        return 'new dva render';
      }
    };
    api.register = (name, handler) => {
      if (name === 'modifyEntryFile') {
        const ret = handler({
          memo: `i am test content with ${RENDER}, hahaha`,
        });
        expect(ret).toEqual(expect.stringContaining('new dva render'));
      }
    };
    dvaPlugin(api);
  });
});
