import { join } from 'path';
import { resolveFromContexts } from './resolveUtils';

const FIXTURE_BASE = join(__dirname, '../../fixtures/resolvesContexts');

test('resolve axios like', async () => {
  const path = await resolveFromContexts(
    [join(FIXTURE_BASE, 'axios-like')],
    'axios',
  );
  expect(path).toMatch(/browser-default.js$/);
});

test('resolve broadcast-channel like', async () => {
  const path = await resolveFromContexts(
    [join(FIXTURE_BASE, 'broadcast-channel-like')],
    'broadcast-channel',
  );
  expect(path).toMatch(/browser-index.js$/);
});

test('resolve broadcast-channel no-exports', async () => {
  const path = await resolveFromContexts(
    [join(FIXTURE_BASE, 'broadcast-channel-no-exports')],
    'broadcast-channel',
  );
  expect(path).toMatch(/legacy-browser-index.js$/);
});

test('resolve qrcode like', async () => {
  const path = await resolveFromContexts(
    [join(FIXTURE_BASE, 'qrcode-like')],
    'qrcode',
  );
  expect(path).toMatch(/browser.js$/);
});

test('resolve module entry before main with browser remapping', async () => {
  const path = await resolveFromContexts(
    [join(FIXTURE_BASE, 'styled-components-like')],
    'styled-components',
  );
  expect(path).toMatch(/styled-components\.browser\.esm\.js$/);
});

test('resolve browser remapping after package exports', async () => {
  const path = await resolveFromContexts(
    [join(FIXTURE_BASE, 'browser-object-exports')],
    'browser-object-exports',
  );
  expect(path).toMatch(/browser\.js$/);
});

test.each(['browser-ignored', 'browser-ignored/server.js'])(
  'resolve %s as ignored by browser',
  async (request) => {
    const path = await resolveFromContexts(
      [join(FIXTURE_BASE, 'browser-ignored')],
      request,
    );
    expect(path).toBe(false);
  },
);
