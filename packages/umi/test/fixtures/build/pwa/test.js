const rawManifestJSON = require('./manifest.json');

export default async function ({ page, host }) {
  await page.goto(`${host}/`, { waitUntil: 'networkidle2' });

  // inject <link rel="manifest"> to <head>
  const manifestHref = await page.evaluate(
    () => document.head.querySelector('link[rel="manifest"]').href,
  );
  expect(manifestHref).toEqual(`${host}/manifest.json`);

  // inject async pwacompat.js to <head>
  const isAsync = await page.evaluate(
    () =>
      document.head.querySelector('script[src$="pwacompat.min.js"]').async,
  );
  expect(isAsync).toEqual(true);

  // inject 2 <link rel="icon">
  const linkIconNum = await page.evaluate(
    () => document.head.querySelectorAll('link[rel="icon"]').length,
  );
  expect(linkIconNum).toEqual(2);

  // inject <meta name="theme-color">
  const themeColor = await page.evaluate(
    () => document.head.querySelector('meta[name="theme-color"]').content,
  );
  expect(themeColor).toEqual('#1abc9c');

  // page /manifest.json
  page.on('response', async response => {
    const manifest = await response.json();
    expect(manifest.name).toEqual(rawManifestJSON.name);
    expect(manifest.short_name).toEqual(rawManifestJSON.short_name);
    expect(manifest.icons.length).toEqual(rawManifestJSON.icons.length);
  });

  await page.goto(`${host}/manifest.json`, {
    waitUntil: 'networkidle2',
  });
}
