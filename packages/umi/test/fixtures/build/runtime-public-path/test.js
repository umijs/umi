
export default async function ({ page, host }) {
  await page.goto(`${host}/`, {
    waitUntil: 'networkidle2',
  });
  const title = await page.evaluate(
    () => document.querySelector('h1').innerHTML,
  );
  expect(title).toEqual('Index Page');
  const publicPath = await page.evaluate(() => window.publicPath);
  expect(publicPath).toEqual('/');
}
