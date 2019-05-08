export default async function({ page, host }) {
  await page.goto(`${host}/`, {
    waitUntil: 'networkidle2',
  });
  const text = await page.evaluate(
    () => document.querySelector('span').innerHTML,
  );
  expect(text).toEqual('测试中文 antd');
}
