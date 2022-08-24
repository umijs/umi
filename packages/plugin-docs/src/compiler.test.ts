import { compile } from './compiler';

test('normal', async () => {
  const { result } = await compile({ content: '# Hello', fileName: '' });
  expect(result).toContain('{"Hello"}</_components.h1>');
});

test('contain a tag', async () => {
  const { result } = await compile({ content: '## Hello', fileName: '' });
  expect(result).toContain(
    '<_components.h2 id="hello"><_components.a aria-hidden="true" tabIndex="-1" href="#hello"><_components.span className="icon icon-link" /></_components.a>{"Hello"}</_components.h2>',
  );
});

test('compile error', async () => {
  const { result } = await compile({ content: '{ a: 1}', fileName: '' });
  expect(result).toBe('');
});

test('compile error production', async () => {
  try {
    process.env.NODE_ENV = 'production';
    await compile({ content: '{ a: 1}', fileName: '' });
  } catch (error) {
    expect(String(error)).toBe('Error: compile error');
  }
});
