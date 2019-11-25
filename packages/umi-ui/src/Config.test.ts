import { join } from 'path';
import { writeFileSync } from 'fs';
import Config from './Config';

const dbPath = join(__dirname, 'fixtures/Config/normal.json');
const illegalDbPath = join(__dirname, 'fixtures/Config/illegal.json');
let config;
let illegalConfig;

let spy;

beforeAll(() => {
  config = new Config({
    dbPath,
  });
  illegalConfig = new Config({
    dbPath: illegalDbPath,
  });
});
beforeEach(() => {
  const mockDate = new Date('2019-05-14T11:01:58.135Z');
  spy = jest.spyOn(global, 'Date').mockImplementation(() => mockDate);
});

afterEach(() => {
  spy.mockRestore();
});

afterAll(done => {
  writeFileSync(dbPath, '{}', 'utf-8');
  writeFileSync(illegalDbPath, 'error illegal', 'utf-8');
  done();
});

test('parse illegalConfig', () => {
  expect(illegalConfig.data).toEqual({ projectsByKey: {} });
});

test('addProject', () => {
  expect(config.data).toEqual({ projectsByKey: {} });
  config.addProject({
    npmClient: 'npm',
    name: 'bar',
    path: '/tmp/foo',
  });
  expect(config.data).toEqual({
    projectsByKey: {
      '43def0': {
        path: '/tmp/foo',
        name: 'bar',
        created_at: 1557831718135,
        npmClient: 'npm',
      },
    },
  });
});

test('editProject', () => {
  config.editProject('43def0', {
    name: 'foo',
  });
  expect(config.data).toEqual({
    projectsByKey: {
      '43def0': {
        path: '/tmp/foo',
        name: 'foo',
        created_at: 1557831718135,
        npmClient: 'npm',
      },
    },
  });
});

test('setCurrentProject', () => {
  config.setCurrentProject('43def0');
  expect(config.data).toEqual({
    projectsByKey: {
      '43def0': {
        path: '/tmp/foo',
        name: 'foo',
        created_at: 1557831718135,
        npmClient: 'npm',
      },
    },
    currentProject: '43def0',
  });
});

test('addProject without name', () => {
  config.addProject({
    path: '/tmp/bar',
  });
  expect(config.data).toEqual({
    projectsByKey: {
      '43def0': {
        path: '/tmp/foo',
        name: 'foo',
        created_at: 1557831718135,
        npmClient: 'npm',
      },
      '9c7eb9': {
        path: '/tmp/bar',
        name: 'bar',
        created_at: 1557831718135,
      },
    },
    currentProject: '43def0',
  });
});

test('deleteProject', () => {
  config.deleteProject('9c7eb9');
  expect(config.data).toEqual({
    projectsByKey: {
      '43def0': {
        path: '/tmp/foo',
        name: 'foo',
        created_at: 1557831718135,
        npmClient: 'npm',
      },
    },
    currentProject: '43def0',
  });
});

test('set creating progress', () => {
  config.setCreatingProgress('43def0', {
    a: 1,
    b: 1,
  });
  expect(config.data).toEqual({
    projectsByKey: {
      '43def0': {
        path: '/tmp/foo',
        name: 'foo',
        created_at: 1557831718135,
        npmClient: 'npm',
        creatingProgress: {
          a: 1,
          b: 1,
        },
      },
    },
    currentProject: '43def0',
  });
});

test('set creating progress done', () => {
  config.setCreatingProgressDone('43def0');
  expect(config.data).toEqual({
    projectsByKey: {
      '43def0': {
        path: '/tmp/foo',
        name: 'foo',
        created_at: 1557831718135,
        npmClient: 'npm',
      },
    },
    currentProject: '43def0',
  });
});

test('deleteProject for currentProject', () => {
  config.deleteProject('43def0');
  expect(config.data).toEqual({
    projectsByKey: {},
  });
});
