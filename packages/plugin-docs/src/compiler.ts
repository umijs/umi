import rehypePrettyCode from 'rehype-pretty-code';
import { logger } from 'umi/plugin-utils';
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
  // 允许高亮代码行
  // 对于高亮的代码行，设置为 highlighted 样式表类
  onVisitHighlightedLine(node: any) {
    node.properties.className.push('highlighted');
  },
  // 允许高亮代码文字
  // 对于高亮的代码文字，设置为 word 样式表类
  onVisitHighlightedWord(node: any) {
    node.properties.className = ['word'];
  },
};

export async function compile(opts: { content: string; fileName: string }) {
  const compiler = createProcessor({
    jsx: true,
    remarkPlugins: [remarkGfm],
    rehypePlugins: [rehypeSlug, [rehypePrettyCode, rehypePrettyCodeOptions]],
  });
  try {
    let result = String(await compiler.process(opts.content));
    result = result.replace(
      'function MDXContent(props = {}) {',
      `
import { useEffect } from 'react';

function MDXContent(props = {}) {

  useEffect(() => {
    if (window.location.hash.length !== 0) {
      const hash = window.location.hash;
      document.getElementById(hash.slice(1))?.scrollIntoView();
    } else {
      window.scrollTo(0, 0);
    }
    document.getElementById('active-nav-item')?.scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    });
  }, []);

`,
    );
    return { result };
  } catch (e: any) {
    logger.error(e.reason);
    logger.error(`Above error occurred in ${opts.fileName} at line ${e.line}`);
    logger.error(
      opts.content
        .split('\n')
        .filter((_, i) => i == e.line - 1)
        .join('\n'),
    );
    logger.error(' '.repeat(e.column - 1) + '^');
    return { result: '' };
  }
}
