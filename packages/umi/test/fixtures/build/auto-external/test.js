import assert from 'assert';

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

  expect(script1Src).toMatch(/https:\/\/gw.alipayobjects.com\/os\/lib\/react/);
  expect(script1Src).toMatch(/react\.profiling\.min\.js/);
  expect(script2Src).toMatch(/react\.production\.min\.js/);

};
