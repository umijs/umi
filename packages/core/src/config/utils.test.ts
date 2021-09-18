import { addExt } from './utils';

test('addExt', () => {
  expect(addExt({ file: 'foo.ts', ext: '.test' })).toEqual(`foo.test.ts`);
});
