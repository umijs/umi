test('with img', async () => {
  await page.goto(
    'https://gw.alipayobjects.com/zos/antfincdn/EovdDmPhoT/index-test-ts-with-img-1-snap.png',
  );

  await waitTime(1000);
  const image = await page.fullPageScreenshot();

  expect(image).toMatchImageSnapshot({
    dumpDiffToConsole: true,
    failureThreshold: 0.2,
    blur: 10,
  });
});

test('home page should has img', async () => {
  await page.goto('https://umijs.org');
  await page.setFamily();
  const text = await page.$eval(
    '.__dumi-default-navbar-logo',
    (e) => e.textContent,
  );
  expect(text).toEqual('UmiJS');
});
