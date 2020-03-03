import { join } from 'path';
import { getPkg } from '@umijs/utils';
import { Service } from '../ServiceWithBuiltIn';

test('normal', async () => {
  const cwd = join(__dirname, 'fixtures', 'normal');
  const service = new Service({
    cwd,
    pkg: getPkg(cwd),
  });
  const config = await service.run({
    name: 'webpack',
    args: {
      print: false,
    },
  });
  // @ts-ignore
  expect(config.resolve.alias.umi).toEqual(process.env.UMI_DIR);
});
