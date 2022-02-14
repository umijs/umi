import { compile } from './compiler';

test('normal', async () => {
  const { result } = await compile({ content: '# Hello' });
  expect(result).toContain('{"Hello"}</_components.h1>');
});
