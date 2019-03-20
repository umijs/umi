
export default async function ({ page, host }) {
  await page.goto(
    `http://localhost:${servers['tree-shaking-with-cjs'].port}/`,
    {
      waitUntil: 'networkidle2',
    },
  );
  const title = await page.evaluate(
    () => document.querySelector('h1').innerHTML,
  );
  expect(title).toEqual('Index Page foo');
}
