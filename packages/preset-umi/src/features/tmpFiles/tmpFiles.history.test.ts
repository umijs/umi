import { fsExtra, Mustache } from '@umijs/utils';
import { TEMPLATES_DIR } from '../../constants';
import { join } from 'path';

const mockHistory = {
  push: jest.fn(),
  replace: jest.fn(),
  location: { pathname: '' },
};

jest.mock(
  './mock-history',
  () => {
    return {
      __esModule: true,
      createBrowserHistory() {
        return mockHistory;
      },
    };
  },
  {
    virtual: true,
  },
);

beforeEach(() => {
  jest.clearAllMocks();
});

beforeAll(() => {
  const content = Mustache.render(
    fsExtra.readFileSync(join(TEMPLATES_DIR, 'history.tpl'), 'utf-8'),
    {
      historyPath: './mock-history',
    },
  );

  fsExtra.writeFileSync(join(__dirname, 'history.ts'), content);
});

afterAll(() => {
  fsExtra.unlinkSync(join(__dirname, 'history.ts'));
});

test('push with abs pathname', () => {
  const mod = require('./history');
  mod.createHistory({ type: 'browser', basename: '/' });
  mod.history.push('/ab/solute');

  expect(mockHistory.push).toBeCalledWith('/ab/solute', undefined);
});

test('push with relative pathname', () => {
  const mod = require('./history');
  mod.createHistory({ type: 'browser', basename: '/' });
  mockHistory.location = {
    pathname: '/a/b/c/d',
  };
  mod.history.push('../rel');

  expect(mockHistory.push).toBeCalledWith('/a/b/rel', undefined);
});

test('push with relative pathname under base', () => {
  const mod = require('./history');
  mod.createHistory({ type: 'browser', basename: '/base' });
  mockHistory.location = {
    pathname: '/base/a/b/c/d',
  };
  mod.history.push('../rel');

  expect(mockHistory.push).toBeCalledWith('/base/a/b/rel', undefined);
});

test('push relative pathname with query under base', () => {
  const mod = require('./history');
  mod.createHistory({ type: 'browser', basename: '/base' });
  mockHistory.location = {
    pathname: '/base/a/b/c/d',
  };
  mod.history.push('../rel?id=1');

  expect(mockHistory.push).toBeCalledWith('/base/a/b/rel?id=1', undefined);
});

test('push relative pathname with hash under base', () => {
  const mod = require('./history');
  mod.createHistory({ type: 'browser', basename: '/base' });
  mockHistory.location = {
    pathname: '/base/a/b/c/d',
  };
  mod.history.push('../rel#hash');

  expect(mockHistory.push).toBeCalledWith('/base/a/b/rel#hash', undefined);
});

test('push relative pathname with hash and query under base', () => {
  const mod = require('./history');
  mod.createHistory({ type: 'browser', basename: '/base' });
  mockHistory.location = {
    pathname: '/base/a/b/c/d',
  };
  mod.history.push('../rel?id=1#hash');

  expect(mockHistory.push).toBeCalledWith('/base/a/b/rel?id=1#hash', undefined);
});

test('push relative pathname with hash and query under base index', () => {
  const mod = require('./history');
  mod.createHistory({ type: 'browser', basename: '/base' });
  mockHistory.location = {
    pathname: '/base',
  };
  mod.history.push('./rel?id=1#hash');

  expect(mockHistory.push).toBeCalledWith('/base/rel?id=1#hash', undefined);
});

test('push deep up relative pathname with hash and query under base', () => {
  const mod = require('./history');
  mod.createHistory({ type: 'browser', basename: '/base' });
  mockHistory.location = {
    pathname: '/base/a/b/c/d',
  };
  mod.history.push('../../../../../rel?id=1#hash');

  expect(mockHistory.push).toBeCalledWith('/base/rel?id=1#hash', undefined);
});

test('push to object contains rel pathname, hash and query under base', () => {
  const mod = require('./history');
  mod.createHistory({ type: 'browser', basename: '/base' });
  mockHistory.location = {
    pathname: '/base/a/b/c/d',
  };
  mod.history.push({
    pathname: '../rel?id=1#hash',
    search: '?a=1',
    hash: '#hash',
  });

  expect(mockHistory.push).toBeCalledWith(
    { pathname: '/base/a/b/rel?id=1#hash', search: '?a=1', hash: '#hash' },
    undefined,
  );
});

test('replace relative pathname with hash and query under base', () => {
  const mod = require('./history');
  mod.createHistory({ type: 'browser', basename: '/base' });
  mockHistory.location = {
    pathname: '/base/a/b/c',
  };
  mod.history.replace({
    pathname: '../rel?id=1#hash',
    search: '?a=1',
    hash: '#hash',
  });

  expect(mockHistory.replace).toBeCalledWith(
    { pathname: '/base/a/rel?id=1#hash', search: '?a=1', hash: '#hash' },
    undefined,
  );
});
