import { join } from 'path';
import { winPath } from 'umi-utils';
import dvaPlugin, { getGlobalModels, getModel } from './index';

const fixtures = join(__dirname, 'fixtures');
const base = join(fixtures, 'getModel');

const api = {
  paths: {
    absTmpDirPath: base,
  },
  config: {
    singular: false,
  },
  winPath,
};

function normalizeModels(models, base) {
  return models.map(model => model.replace(winPath(base), '$CWD$'));
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
        config: { singular: true },
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

  xit('apply modifyDvaRender', () => {
    api.applyPlugins = name => {
      if (name === 'modifyDvaRender') {
        return 'new dva render';
      }
    };
    api.register = (name, handler) => {
      if (name === 'modifyEntryFile') {
        const ret = handler({
          memo: `i am test content with <%= RENDER %>, hahaha`,
        });
        expect(ret).toEqual(expect.stringContaining('new dva render'));
      }
    };
    dvaPlugin(api);
  });

  it('getGlobalModels with shouldImportDynamic=true', () => {
    const absSrcPath = join(fixtures, 'normal');
    const models = getGlobalModels(
      {
        paths: {
          absSrcPath,
        },
        config: {},
        winPath,
      },
      /* shouldImportDynamic */ true,
    );
    expect(normalizeModels(models, absSrcPath)).toEqual(['$CWD$/models/global.js']);
  });

  it('getGlobalModels with shouldImportDynamic=false', () => {
    const cwd = join(fixtures, 'normal');
    const service = {
      paths: {
        absSrcPath: cwd,
        cwd,
        absPagesPath: join(cwd, 'pages'),
      },
      config: {},
      routes: [
        { path: '/', component: './pages/index.js' },
        { path: '/c', component: './pages/c/index.js' },
      ],
      winPath,
    };
    let models = null;

    models = getGlobalModels(
      {
        ...service,
        routes: [{ path: '/', component: './pages/index.js' }],
      },
      /* shouldImportDynamic */ false,
    );
    expect(normalizeModels(models, cwd)).toEqual([
      '$CWD$/models/global.js',
      '$CWD$/pages/models/a.js',
    ]);

    // don't crash if have no component property
    models = getGlobalModels(
      {
        ...service,
        routes: [{ path: '/' }],
      },
      /* shouldImportDynamic */ false,
    );
    expect(normalizeModels(models, cwd)).toEqual(['$CWD$/models/global.js']);

    models = getGlobalModels(
      {
        ...service,
        routes: [{ path: '/b', component: './pages/b/index.js' }],
      },
      /* shouldImportDynamic */ false,
    );
    expect(normalizeModels(models, cwd)).toEqual([
      '$CWD$/models/global.js',
      '$CWD$/pages/b/models/b.js',
      '$CWD$/pages/models/a.js',
    ]);

    models = getGlobalModels(
      {
        ...service,
        routes: [{ path: '/c', component: './pages/c/index.js' }],
      },
      /* shouldImportDynamic */ false,
    );
    expect(normalizeModels(models, cwd)).toEqual([
      '$CWD$/models/global.js',
      '$CWD$/pages/c/models/c.js',
      '$CWD$/pages/models/a.js',
    ]);

    models = getGlobalModels(
      {
        ...service,
        routes: [{ path: '/d', component: './pages/c/d/index.js' }],
      },
      /* shouldImportDynamic */ false,
    );
    expect(normalizeModels(models, cwd)).toEqual([
      '$CWD$/models/global.js',
      '$CWD$/pages/c/d/models/d.js',
      '$CWD$/pages/c/models/c.js',
      '$CWD$/pages/models/a.js',
    ]);
  });
});
