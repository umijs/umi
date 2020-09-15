import { importsToStr } from './umi';

test('importsToStr', () => {
  expect(
    importsToStr([{ source: 'foo' }, { source: 'bar', specifier: 'bar' }]),
  ).toEqual([`import 'foo';`, `import bar from 'bar';`]);
});
