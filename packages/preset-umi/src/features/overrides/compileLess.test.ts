import { execa } from '@umijs/utils';
import { join } from 'path';

test('normal', async () => {
  try {
    const result = await execa.execa(
      'tsx',
      [join(__dirname, './compileLess.testScript.ts')],
      {
        stdio: 'inherit',
      },
    );
    expect(result.exitCode).toEqual(0);
  } catch {
    throw new Error('compileLess.testScript.ts failed');
  }
});
