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
  //   result = `
  // import React, { useEffect } from 'react';
  // ${result}`;
  //   result = result.replace('/* @jsxRuntime classic */', '');
  //   result = result.replace('/* @jsx mdx */', '');
  //
  //   result = result.replace(
  //     'return <MDXLayout',
  //     `
  //
  //   useEffect(() => {
  //     if (window.location.hash.length !== 0) {
  //       const hash = window.location.hash;
  //       window.location.hash = '';
  //       window.location.hash = hash;
  //     }
  //   }, []);
  //
  // return <MDXLayout`,
  //   );
  return { result };
}
