test('with img', async () => {
  await page.goto('https://umijs.org/');

  await page.setFamily();
  await waitTime(1000);
  const image = await page.screenshot();

  expect(image).toMatchImageSnapshot({
    dumpDiffToConsole: true,
    failureThreshold: 0.2,
  });
});
