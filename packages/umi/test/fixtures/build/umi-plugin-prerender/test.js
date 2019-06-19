export default async function ({ page, host }) {
  // page /
  await page.goto(`${host}/`, { waitUntil: 'networkidle2' });
  const text = await page.evaluate(
    () => document.querySelector('h2').innerHTML,
  );
  const title = await page.evaluate(
    () => document.querySelector('title').innerHTML,
  );
  const data = await page.evaluate(
    () => document.querySelector('h3').innerHTML,
  );
  expect(text).toEqual('Page index');
  expect(title).toEqual('Home');
  expect(data).toEqual('http://127.0.0.1:8000');

  // page /users
  await page.goto(`${host}/users`, {
    waitUntil: 'networkidle2',
  });

  // title
  const userText = await page.evaluate(
    () => document.querySelector('h2').innerHTML,
  );
  const userTitle = await page.evaluate(
    () => document.querySelector('title').innerHTML,
  );
  expect(userText).toEqual('users');
  expect(userTitle).toEqual('Users');
}
