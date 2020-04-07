test('with img', async () => {
  await page.goto('https://umijs.org/docs/how-umi-works');

  await page.setFamily();
  await waitTime(1000);
  const image = await page.fullPageScreenshot();

  expect(image).toMatchImageSnapshot({
    dumpDiffToConsole: true,
    failureThreshold: 0.2,
    blur: 5,
  });
});

test('home page should has img', async () => {
  await page.goto('https://umijs.org');
  await page.setFamily();
  const iconText = await page.$('.__dumi-default-navbar-logo');
  const text = await page.$eval(
    '.__dumi-default-navbar-logo',
    (e) => e.textContent,
  );
  expect(text).toEqual('UmiJS');
  const image = await iconText?.screenshot();
  expect(image).toMatchImageSnapshot({
    dumpDiffToConsole: true,
    failureThreshold: 0.2,
    blur: 5,
  });
});
