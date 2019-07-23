import { join } from 'path';
import { writeFileSync } from 'fs';
import Config from './Config';

const dbPath = join(__dirname, 'fixtures/Config/normal.json');
let config;

beforeAll(() => {
  config = new Config({
    dbPath,
  });
});

afterAll(() => {
  writeFileSync(dbPath, '{}', 'utf-8');
});

test('addProject', () => {
  expect(config.data).toEqual({ projectsByKey: {} });
  config.addProject('/tmp/foo', 'bar');
  expect(config.data).toEqual({
    projectsByKey: {
      '43def0': {
        path: '/tmp/foo',
        name: 'bar',
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
      },
    },
    currentProject: '43def0',
  });
});

test('addProject without name', () => {
  config.addProject('/tmp/bar');
  expect(config.data).toEqual({
    projectsByKey: {
      '43def0': {
        path: '/tmp/foo',
        name: 'foo',
      },
      '9c7eb9': {
        path: '/tmp/bar',
        name: 'bar',
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
