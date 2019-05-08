
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
  expect(script1Src).toEqual('https://unpkg.com/react@16.8.6/umd/react.profiling.min.js');
  expect(script2Src).toEqual('https://unpkg.com/react@16.8.6/umd/react.production.min.js');

  const title = await page.evaluate(() => document.querySelector('.ant-card-head-title').innerHTML);
  expect(title).toEqual('卡片标题');
};
