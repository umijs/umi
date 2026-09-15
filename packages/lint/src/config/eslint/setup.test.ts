const patchPath =
  '../../../compiled/@rushstack/eslint-patch/lib/modern-module-resolution.js';
const original = process.env.UMI_UTLINT_MIGRATE;

afterEach(() => {
  if (original === undefined) delete process.env.UMI_UTLINT_MIGRATE;
  else process.env.UMI_UTLINT_MIGRATE = original;
  jest.resetModules();
  jest.dontMock(patchPath);
});

test.each([undefined, '0', '1'])(
  'only skips the ESLint patch in the explicit migration environment: %s',
  (value) => {
    if (value === undefined) delete process.env.UMI_UTLINT_MIGRATE;
    else process.env.UMI_UTLINT_MIGRATE = value;
    const loadPatch = jest.fn(() => ({}));
    jest.doMock(patchPath, loadPatch);
    jest.isolateModules(() => require('./setup'));
    expect(loadPatch).toHaveBeenCalledTimes(value === '1' ? 0 : 1);
  },
);
