import rehypePrettyCode from 'rehype-pretty-code';
// @ts-ignore
import { createProcessor } from '../compiled/@mdx-js/mdx';
// @ts-ignore
import rehypeSlug from '../compiled/rehype-slug';
// @ts-ignore
import remarkGfm from '../compiled/remark-gfm';

// https://rehype-pretty-code.netlify.app
const rehypePrettyCodeOptions = {
  theme: 'dark-plus',
  onVisitLine(node: any) {
    // Prevent lines from collapsing in `display: grid` mode, and
    // allow empty lines to be copy/pasted
    if (node.children.length === 0) {
      node.children = [{ type: 'text', value: ' ' }];
    }
  },
  onVisitHighlightedLine(node: any) {
    node.properties.className.push('highlighted');
  },
};

export async function compile(opts: { content: string }) {
  const compiler = createProcessor({
    jsx: true,
    remarkPlugins: [remarkGfm],
    rehypePlugins: [rehypeSlug, [rehypePrettyCode, rehypePrettyCodeOptions]],
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
