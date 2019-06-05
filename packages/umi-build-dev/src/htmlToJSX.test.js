import htmlToJSX from './htmlToJSX';

test('close tag', () => {
  expect(htmlToJSX(`<link href="/umi.js">`)).toEqual(`<link href="/umi.js" />`);
});

test('close tag', () => {
  expect(htmlToJSX(`<link href="/umi.js" />`)).toEqual(`<link href="/umi.js" />`);
});
