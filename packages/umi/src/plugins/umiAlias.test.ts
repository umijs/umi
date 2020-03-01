import { join } from 'path';
import { Service } from '../ServiceWithBuiltIn';

test('normal', async () => {
  const service = new Service({
    cwd: join(__dirname, 'fixtures', 'normal'),
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
