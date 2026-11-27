import { mkdtempSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { watch } from '../../commands/dev/watch';
import overrides from './overrides';

jest.mock('../../commands/dev/watch', () => ({
  ...jest.requireActual('../../commands/dev/watch'),
  watch: jest.fn(),
}));

test('regenerates CSS for imported Less changes and updates the watched imports', async () => {
  const cwd = mkdtempSync(join(tmpdir(), 'umi-less-overrides-'));
  const entry = join(cwd, 'overrides.less');
  const menu = join(cwd, 'menu.less');
  const theme = join(cwd, 'theme.less');
  const watcher = { add: jest.fn(), unwatch: jest.fn() };
  const watchMock = jest.mocked(watch);
  watchMock.mockReturnValue(watcher as any);
  try {
    const api = {
      name: 'dev',
      appData: { overridesCSS: [entry] },
      paths: { absTmpPath: cwd },
      config: {},
      logger: { error: jest.fn() },
      onGenerateFiles: jest.fn(),
      addEntryImports: jest.fn(),
      writeTmpFile: jest.fn(),
    };
    overrides(api as any);
    const generate = api.onGenerateFiles.mock.calls[0][0];
    writeFileSync(entry, "@import './menu.less';");
    writeFileSync(menu, '.menu { color: red; }');
    await generate();
    expect(watcher.add).toHaveBeenCalledWith([menu]);
    const { onChange } = watchMock.mock.calls[0][0];
    writeFileSync(menu, '.menu { color: blue; }');
    await onChange('change', menu);
    expect(api.writeTmpFile).toHaveBeenLastCalledWith(
      expect.objectContaining({
        content: expect.stringContaining('color: blue'),
      }),
    );
    writeFileSync(theme, '.theme { color: green; }');
    writeFileSync(entry, "@import './theme.less';");
    await generate();
    expect(watcher.unwatch).toHaveBeenCalledWith([menu]);
    expect(watcher.add).toHaveBeenCalledWith([theme]);
  } finally {
    rmSync(cwd, { recursive: true, force: true });
  }
});
