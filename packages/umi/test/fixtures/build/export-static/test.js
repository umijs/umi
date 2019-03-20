
export default async function ({ page, host }) {
  await page.goto(`${host}/`, {
    waitUntil: 'networkidle2',
  });
  const t1 = await page.evaluate(() => document.querySelector('h1').innerHTML);
  expect(t1).toEqual('Index Page');

  await page.evaluate(() => document.querySelector('button').click());
  const t2 = await page.evaluate(() => document.querySelector('h1').innerHTML);
  expect(t2).toEqual('List Page');

  await page.evaluate(() => document.querySelector('button').click());
  const t3 = await page.evaluate(() => document.querySelector('h1').innerHTML);
  expect(t3).toEqual('Index Page');

  await page.goto(`${host}/list/`, {
    waitUntil: 'networkidle2',
  });
  const t4 = await page.evaluate(() => document.querySelector('h1').innerHTML);
  expect(t4).toEqual('List Page');
};
