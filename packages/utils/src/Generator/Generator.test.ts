import { readFileSync } from 'fs';
import { join } from 'path';
import { rimraf } from '../index';
import Generator from './Generator';

const fixtures = join(__dirname, 'fixtures');

test('normal', async () => {
  const cwd = join(fixtures, 'normal');
  const dist = join(cwd, 'dist');
  rimraf.sync(dist);
  const target = join(dist, 'a.js');
  class NormalGenerator extends Generator {
    prompting() {
      return [] as any;
    }

    async writing(): Promise<any> {
      this.copyTpl({
        context: {
          foo: 'bar',
        },
        target,
        templatePath: join(cwd, 'a.js.tpl'),
      });
      this.copyDirectory({
        context: {
          foo: 'bar',
        },
        path: join(cwd, './dir'),
        target: join(dist, './dir'),
      });
    }
  }
  const g = new NormalGenerator({
    args: { _: [], $0: '' },
    baseDir: cwd,
  });
  await g.run();
  expect(readFileSync(target, 'utf-8').trim()).toEqual(`alert('bar');`);
  expect(readFileSync(join(dist, './dir', 'a.js'), 'utf-8').trim()).toEqual(
    `alert('bar');`,
  );
  expect(readFileSync(join(dist, './dir', 'b.js'), 'utf-8').trim()).toEqual(
    `alert('abc');`,
  );
});
