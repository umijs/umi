
export default async function ({ page, host }) {
  let title;
  await page.goto(`${host}/#/login`, {
    waitUntil: 'networkidle2',
  });
  title = await page.evaluate(
    () => document.querySelector('h1').innerHTML,
  );
  expect(title).toEqual('Page login');

  await page.goto(`${host}/#/logiN`, {
    waitUntil: 'networkidle2',
  });
  title = await page.evaluate(
    () => document.querySelector('h1').innerHTML,
  );
  expect(title).toEqual('404');
}
