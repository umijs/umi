import { compile } from './compiler';

test('normal', async () => {
  const { result } = await compile({ content: '# Hello' });
  console.log(result);
  expect(result).toContain('{`Hello`}</h1>');
});
