// @ts-ignore
import mdx from '@mdx-js/mdx';
import remarkSlug from 'remark-slug';

export async function compile(opts: { content: string }) {
  let result = await mdx(opts.content, {
    remarkPlugins: [remarkSlug],
    rehypePlugins: [],
    compilers: [],
  });
  result = `
import React, { useEffect } from 'react';
${result}`;
  result = result.replace('/* @jsxRuntime classic */', '');
  result = result.replace('/* @jsx mdx */', '');

  result = result.replace(
    'return <MDXLayout',
    `

  useEffect(() => {
    if (window.location.hash.length !== 0) {
      const hash = window.location.hash;
      window.location.hash = '';
      window.location.hash = hash;
    }
  }, []);

return <MDXLayout`,
  );

  return { result };
}
