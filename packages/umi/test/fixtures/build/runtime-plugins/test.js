
export default async function ({ page, host }) {
  await page.goto(`${host}/`, {
    waitUntil: 'networkidle2',
  });

  const title = await page.evaluate(
    () => document.querySelector('h1').innerHTML,
  );
  expect(title).toEqual('Page index');

  const rootContainer = await page.evaluate(
    () => document.querySelector('h2').innerHTML,
  );
  expect(rootContainer).toEqual('rootContainer');

  const render = await page.evaluate(
    () => document.querySelector('h3').innerHTML,
  );
  expect(render).toEqual('render');

  const patchRoutes = await page.evaluate(
    () => window.g_patch_routes,
  );
  expect(patchRoutes.length).toEqual(1);
  expect(patchRoutes[0].path).toEqual('/');
};
