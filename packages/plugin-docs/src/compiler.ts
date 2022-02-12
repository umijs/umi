export async function compile(opts: { content: string }) {
  const mdx = await (eval('import("@mdx-js/mdx")') as Promise<
    typeof import('@mdx-js/mdx')
  >);
  const compiler = mdx.createProcessor({
    jsx: true,
    remarkPlugins: [],
    rehypePlugins: [(await eval('import("rehype-slug")')).default],
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
