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
      a: { importedModules: ['b', 'c'] },
      b: { importedModules: [] },
    },
  });
  expect(simplify(mg.toJSON())).toEqual({
    fileModules: ['b', 'a'],
    depModules: ['c'],
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
    fileModules: { a: { importModules: ['b', 'c'] }, b: { importModules: [] } },
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
      a: { importModules: ['c', 'd', 'e'] },
      d: { importModules: [] },
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
