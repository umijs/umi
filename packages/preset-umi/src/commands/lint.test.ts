import lint from './lint';
import { runUtlint } from './lint/utlint';

jest.mock('./lint/utlint', () => ({ runUtlint: jest.fn() }));
jest.mock('@umijs/lint', () => ({ __esModule: true, default: jest.fn() }));

const legacyLint = require('@umijs/lint').default;
const originalArgv = process.argv;
let run: () => void;

beforeEach(() => {
  jest.clearAllMocks();
  lint({
    cwd: '/project',
    registerCommand: (command) => {
      run = () => command.fn({ args: { _: [], $0: 'umi' } });
    },
  } as import('../types').IApi);
});

afterEach(() => {
  process.argv = originalArgv;
});

async function runLint(...args: string[]) {
  process.argv = ['node', 'umi', 'lint', ...args];
  await run();
}

test('keeps the existing default lint behavior', async () => {
  await runLint();
  expect(legacyLint).toHaveBeenCalledWith(
    { cwd: '/project' },
    expect.objectContaining({
      _: ['{src,test}/**/*.{js,jsx,ts,tsx,less,css}'],
    }),
  );
  expect(runUtlint).not.toHaveBeenCalled();
});

test('keeps existing engine flags and lint-staged filenames', async () => {
  await runLint('--eslint-only', '--fix', '/project/src/a.ts');
  expect(legacyLint).toHaveBeenCalledWith(
    { cwd: '/project' },
    expect.objectContaining({
      _: ['/project/src/a.ts'],
      eslintOnly: true,
      fix: true,
    }),
  );
});

test.each([
  [['--utlint'], []],
  [['--utlint=true'], []],
  [['--utlint', 'true'], []],
  [
    ['--utlint', '--fix', '--config', 'custom config.ts', 'src/a.ts'],
    ['--fix', '--config', 'custom config.ts', 'src/a.ts'],
  ],
  [
    ['--utlint', 'migrate', 'eslint', '--from', '.eslintrc.js', '--print'],
    ['migrate', 'eslint', '--from', '.eslintrc.js', '--print'],
  ],
  [
    ['--utlint', '--', '--utlint'],
    ['--', '--utlint'],
  ],
])('runs utoo-lint independently for %j', async (input, forwarded) => {
  await runLint(...input);
  expect(runUtlint).toHaveBeenCalledWith('/project', forwarded);
  expect(legacyLint).not.toHaveBeenCalled();
});

test.each(['--eslint-only', '--stylelint-only', '--cssinjs'])(
  'rejects conflicting option %s',
  async (option) => {
    await expect(runLint('--utlint', option)).rejects.toThrow(
      '--utlint cannot be combined',
    );
    expect(runUtlint).not.toHaveBeenCalled();
    expect(legacyLint).not.toHaveBeenCalled();
  },
);

test('does not opt in when the flag is disabled', async () => {
  await runLint('--utlint=false');
  expect(legacyLint).toHaveBeenCalled();
  expect(runUtlint).not.toHaveBeenCalled();
});

test('waits for utoo-lint and propagates startup failures', async () => {
  jest.mocked(runUtlint).mockRejectedValueOnce(new Error('failed to start'));
  await expect(runLint('--utlint')).rejects.toThrow('failed to start');
});
