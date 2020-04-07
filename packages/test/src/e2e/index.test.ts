test('with img', async () => {
  await page.goto('https://umijs.org/');
  await waitTime(2000);

  const image = await page.fullPageScreenshot();
  expect(image).toMatchImageSnapshot();
});
