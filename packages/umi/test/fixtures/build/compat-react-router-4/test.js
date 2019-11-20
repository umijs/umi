
export default async function ({ page, host }) {
  await page.goto(`${host}/`, {
    waitUntil: 'networkidle2',
  });
  await page.waitForSelector('h1');
  const listText = await page.evaluate(() => document.querySelector('h1').innerHTML);
  expect(listText).toEqual('/');
  // redirect /list
  await page.click('button');
  const indexText = await page.evaluate(() => document.querySelector('h1').innerHTML);
  expect(indexText).toEqual('/list');
};
