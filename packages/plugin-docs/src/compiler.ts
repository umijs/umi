// @ts-ignore
import mdx from '@mdx-js/mdx';

export async function compile(opts: { content: string }) {
  let result = await mdx(opts.content, {
    remarkPlugins: [],
    rehypePlugins: [],
    compilers: [],
  });
  result = `
import React from 'react';
${result}`;
  result = result.replace('/* @jsxRuntime classic */', '');
  result = result.replace('/* @jsx mdx */', '');
  const title = result.match(/<h1>{`(.*?)`}<\/h1>/)[1];
  result = `${result}\nMDXContent.title = '${title}';`;
  return {
    result,
    meta: {
      title,
    },
  };
}
