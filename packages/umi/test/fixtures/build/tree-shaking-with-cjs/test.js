
// 这个用例下需要有个 package.json，不然会走到 packages/umi/package.json
// 由于配了 sideEffects，所以 .umi/initHistory.js 被 tree shaking 掉
export default async function ({ page, host }) {
  await page.goto(
    `${host}/`,
    {
      waitUntil: 'networkidle2',
    },
  );
  const title = await page.evaluate(
    () => document.querySelector('h1').innerHTML,
  );
  expect(title).toEqual('Index Page foo');
}
