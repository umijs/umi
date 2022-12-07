import { ModuleGraph } from './moduleGraph';

function simplify(obj: any) {
  return {
    fileModules: Object.keys(obj.fileModules),
    depModules: Object.keys(obj.depModules),
  };
}

test('normal', () => {
  const mg = new ModuleGraph();
  mg.onFileChange({
    file: 'a',
    deps: [
      { file: 'b', isDependency: false },
      { file: 'c', isDependency: true },
    ],
  });
  expect(simplify(mg.toJSON())).toEqual({
    fileModules: ['a', 'b'],
    depModules: ['c'],
  });
  mg.onFileChange({
    file: 'b',
    deps: [{ file: 'd', isDependency: true }],
  });
  expect(simplify(mg.toJSON())).toEqual({
    fileModules: ['a', 'b'],
    depModules: ['c', 'd'],
  });
  mg.onFileChange({
    file: 'a',
    deps: [{ file: 'c', isDependency: true }],
  });
  expect(simplify(mg.toJSON())).toEqual({
    fileModules: ['a'],
    depModules: ['c'],
  });
});

test('duplicate deps', () => {
  const mg = new ModuleGraph();
  mg.onFileChange({
    file: 'a',
    deps: [
      { file: 'b', isDependency: false },
      { file: 'c', isDependency: true },
    ],
  });
  mg.onFileChange({
    file: 'a',
    deps: [
      { file: 'b', isDependency: false },
      { file: 'd', isDependency: true },
    ],
  });
  expect(simplify(mg.toJSON())).toEqual({
    fileModules: ['a', 'b'],
    depModules: ['d'],
  });
});

test('restore', () => {
  const mg = new ModuleGraph();
  const depSnapshotModules = { c: { version: '0.2.0' } };
  mg.restore({
    roots: ['a'],
    depModules: {
      c: { version: '0.1.0' },
    },
    depSnapshotModules,
    fileModules: {
      a: { importedModules: ['b', 'c'], isRoot: true },
      b: { importedModules: [] },
    },
  });
  expect(mg.toJSON()).toEqual({
    roots: ['a'],
    fileModules: {
      b: { importedModules: [] },
      a: { importedModules: ['b', 'c'], isRoot: true },
    },
    depModules: { c: { version: '0.1.0' } },
    depSnapshotModules: { c: { version: '0.2.0' } },
  });
  expect(mg.depSnapshotModules).toEqual(depSnapshotModules);
});

test('updateModules + toJSON', () => {
  const mg = new ModuleGraph();
  mg.onFileChange({
    file: 'a',
    deps: [
      { file: 'b', isDependency: false },
      { file: 'c', isDependency: true, version: '0.1.0' },
    ],
  });
  expect(mg.toJSON()).toEqual({
    roots: ['a'],
    fileModules: {
      a: { importedModules: ['b', 'c'], isRoot: true },
      b: { importedModules: [] },
    },
    depModules: { c: { version: '0.1.0' } },
    depSnapshotModules: {},
  });
  mg.onFileChange({
    file: 'a',
    deps: [
      { file: 'd', isDependency: false },
      { file: 'c', isDependency: true, version: '0.2.0' },
      { file: 'e', isDependency: true, version: '0.1.0' },
    ],
  });
  expect(mg.toJSON()).toEqual({
    roots: ['a'],
    fileModules: {
      a: { importedModules: ['c', 'd', 'e'], isRoot: true },
      d: { importedModules: [] },
    },
    depModules: { c: { version: '0.2.0' }, e: { version: '0.1.0' } },
    depSnapshotModules: {},
  });
});

test('snapshot + hasDepChanged', () => {
  const mg = new ModuleGraph();
  mg.snapshotDeps();
  mg.onFileChange({
    file: 'a',
    deps: [
      { file: 'b', isDependency: false },
      { file: 'c', isDependency: true, version: '0.1.0' },
    ],
  });
  expect(mg.hasDepChanged()).toEqual(true);
  mg.snapshotDeps();
  mg.onFileChange({
    file: 'a',
    deps: [
      { file: 'b', isDependency: false },
      { file: 'c', isDependency: true, version: '0.2.0' },
    ],
  });
  expect(mg.hasDepChanged()).toEqual(true);
  mg.snapshotDeps();
  mg.onFileChange({
    file: 'a',
    deps: [
      { file: 'b', isDependency: false },
      { file: 'c', isDependency: true, version: '0.2.0' },
    ],
  });
  expect(mg.hasDepChanged()).toEqual(false);
  mg.snapshotDeps();
  mg.onFileChange({
    file: 'a',
    deps: [{ file: 'b', isDependency: false }],
  });
  expect(mg.hasDepChanged()).toEqual(true);
});

test('different modules have same deps', () => {
  const mg = new ModuleGraph();
  mg.onFileChange({
    file: 'a',
    deps: [{ file: 'c', isDependency: true, version: '0.2.0' }],
  });
  mg.onFileChange({
    file: 'b',
    deps: [{ file: 'c', isDependency: true, version: '0.2.0' }],
  });

  const restored = new ModuleGraph();
  restored.restore(mg.toJSON());
  const bMod = restored.fileToModules.get('b');

  expect(bMod!.importedModules.size).toEqual(1);
});

test('circular deps restore', () => {
  const mg = new ModuleGraph();
  mg.onFileChange({
    file: 'a',
    deps: [{ file: 'b', isDependency: false }],
  });
  mg.onFileChange({
    file: 'b',
    deps: [{ file: 'c', isDependency: false }],
  });
  mg.onFileChange({
    file: 'c',
    deps: [{ file: 'a', isDependency: false }],
  });

  const restored = new ModuleGraph();
  restored.restore(mg.toJSON());
});

test('deps with importer', () => {
  const mg = new ModuleGraph();
  mg.onFileChange({
    file: 'a',
    deps: [{ file: 'b', isDependency: true, version: '0.0.1' }],
  });

  mg.snapshotDeps();

  expect(mg.depSnapshotModules).toEqual({
    b: { file: 'b', version: '0.0.1', importer: 'a' },
  });
});

test('deps compare ignore importer', () => {
  const mg = new ModuleGraph();
  mg.onFileChange({
    file: 'a',
    deps: [{ file: 'b', isDependency: true, version: '0.0.1' }],
  });

  mg.snapshotDeps();

  mg.onFileChange({
    file: 'a',
    deps: [],
  });
  mg.onFileChange({
    file: 'c',
    deps: [{ file: 'b', isDependency: true, version: '0.0.1' }],
  });

  expect(mg.hasDepChanged()).toEqual(false);
});

test('deps compare ignore importer when no importer', () => {
  const mg = new ModuleGraph();
  mg.onFileChange({
    file: 'a',
    deps: [{ file: 'b', isDependency: true, version: '0.0.1' }],
  });

  mg.depSnapshotModules = {
    b: { file: 'b', version: '0.0.1' },
  };

  expect(mg.hasDepChanged()).toEqual(false);
});
