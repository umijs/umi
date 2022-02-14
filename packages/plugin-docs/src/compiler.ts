// @ts-ignore
import { createProcessor } from '../compiled/@mdx-js/mdx';
// @ts-ignore
import rehypeSlug from '../compiled/rehype-slug';

export async function compile(opts: { content: string }) {
  const compiler = createProcessor({
    jsx: true,
    remarkPlugins: [],
    rehypePlugins: [rehypeSlug],
  });
  let result = String(await compiler.process(opts.content));
  result = result.replace(
    'function MDXContent(props = {}) {',
    `
import { useEffect } from 'react';

function MDXContent(props = {}) {

  useEffect(() => {
    if (window.location.hash.length !== 0) {
      const hash = window.location.hash;
      window.location.hash = '';
      window.location.hash = hash;
    }
  }, []);

`,
  );
  return { result };
}
