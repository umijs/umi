export default async function ({ page, host }) {
  await page.goto(`${host}/`, { waitUntil: 'networkidle2' });


  await page.goto(`${host}/manifest.json`, {
    waitUntil: 'networkidle2',
  });
}
