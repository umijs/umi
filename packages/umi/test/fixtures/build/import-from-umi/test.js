
export default async function ({ page, host }) {
  await page.goto(`${host}/`, {
    waitUntil: 'networkidle2',
  });

  const t1 = await page.evaluate(
    () => document.querySelector('h1').innerHTML,
  );
  expect(t1).toEqual('count: 0');

  await page.evaluate(() => document.querySelector('button').click());

  const t2 = await page.evaluate(
    () => document.querySelector('h1').innerHTML,
  );
  expect(t2).toEqual('count: 1');
};
