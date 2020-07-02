test('with img', async () => {
  await page.goto('https://umijs.org/zh-CN/docs');
  async function removeBanners(page: any) {
    await page.evaluate(() => {
      (
        document.querySelectorAll('.__dumi-default-layout-footer-meta') || []
      ).forEach((el) => el.remove());
    });
  }
  await removeBanners(page);
  const image = await page.screenshot({
    fullPage: true,
  });
  expect(image).toMatchImageSnapshot({
    dumpDiffToConsole: true,
    failureThreshold: 0.2,
    blur: 5,
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

test('home page test', async () => {
  await page.goto('https://umijs.org');
  await page.setFamily();
  const text = await page.getText();
  expect(text).toMatchSnapshot();
});
