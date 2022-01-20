import { compile } from './compiler';

test('normal', async () => {
  const { result } = await compile({ content: '# Hello' });
  console.log(result);
  expect(result).toContain('<h1>{`Hello`}</h1>');
  expect(result).toContain("MDXContent.title = 'Hello';");
});
