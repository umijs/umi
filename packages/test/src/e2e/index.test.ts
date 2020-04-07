test('with img', async () => {
  await page.goto('https://umijs.org/docs/how-umi-works');

  await page.setFamily();
  await waitTime(1000);
  const image = await page.fullPageScreenshot();

  expect(image).toMatchImageSnapshot({
    dumpDiffToConsole: true,
    failureThreshold: 0.2,
    blur: 10,
  });
});
