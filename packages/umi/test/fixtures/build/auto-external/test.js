
export default async function ({ page, host }) {
  await page.goto(`${host}/`, {
    waitUntil: 'networkidle2',
  });

  const script1Src = await page.evaluate(
    () =>
    document.head.querySelectorAll('script')[1].src
  );
  const script2Src = await page.evaluate(
    () =>
    document.head.querySelectorAll('script')[2].src
  );
  const script1SrcExp = new RegExp(`^${host}\\/externals\\/react@(([0-9]+)\\.([0-9]+)\\.([0-9]+)(?:-([0-9A-Za-z-]+(?:\\.[0-9A-Za-z-]+)*))?(?:\\+[0-9A-Za-z-]+)?)\\/umd\\/react\\.profiling\\.min\\.js$`);
  const script2SrcExp = new RegExp(`^${host}\\/externals\\/react@(([0-9]+)\\.([0-9]+)\\.([0-9]+)(?:-([0-9A-Za-z-]+(?:\\.[0-9A-Za-z-]+)*))?(?:\\+[0-9A-Za-z-]+)?)\\/umd\\/react\\.production\\.min\\.js$`);

  expect(script1Src).toMatch(script1SrcExp);
  expect(script2Src).toMatch(script2SrcExp);

  const title = await page.evaluate(() => document.querySelector('.ant-card-head-title').innerHTML);
  expect(title).toEqual('卡片标题');
};
