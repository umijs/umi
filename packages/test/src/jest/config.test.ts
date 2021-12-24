import { createJestConfig } from './config';

test('basic', () => {
  expect(createJestConfig({}, {}).moduleFileExtensions).toContain('jsx');
});

test('e2e', () => {
  expect(
    createJestConfig(
      {},
      {
        hasE2e: true,
      },
    ).testMatch,
  ).toContain('**/?*.(spec|test|e2e).(j|t)s?(x)');
});

test('useEsbuild', () => {
  expect(
    JSON.stringify(
      createJestConfig(
        {},
        {
          useEsbuild: true,
        },
      ).transform,
    ),
  ).toMatch(/esbuild-jest/);
});
