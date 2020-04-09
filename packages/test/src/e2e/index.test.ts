const os = require('os');
test('with img', async () => {
  await page.goto(
    'https://umijs.org/docs/how-umi-works#configurational-routing-and-contractual-routing',
  );

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
