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
