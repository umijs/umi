export default async function({ page, host }) {
  await page.goto(`${host}/`, {
    waitUntil: 'networkidle2',
  });
  const text = await page.evaluate(
    () => document.querySelector('span').innerHTML,
  );
  expect(text).toEqual('测试中文 antd');


  await Promise.all([
    page.click('button[id=btn_en]'),
    page.waitForNavigation()
  ]);
  const text_en = await page.evaluate(
    () => ({
      innerHTML: document.querySelector('span').innerHTML,
      g_lang: window.g_lang,
      g_langSeparator: window.g_langSeparator,
    })
  );
  expect(text_en.innerHTML).toEqual('test en antd');
  expect(text_en.g_lang).toEqual('en-US');
  expect(text_en.g_langSeparator).toEqual('-');

  await Promise.all([
    page.click('button[id=btn_zh]'),
    page.waitForNavigation()
  ]);
  const text_zh = await page.evaluate(
    () => ({
      innerHTML: document.querySelector('span').innerHTML,
      g_lang: window.g_lang,
      g_langSeparator: window.g_langSeparator,
    })
  );
  expect(text_zh.innerHTML).toEqual('测试中文 antd');
  expect(text_zh.g_lang).toEqual('zh-CN');
  expect(text_zh.g_langSeparator).toEqual('-');

  await Promise.all([
    page.click('button[id=btn_sk]'),
    page.waitForNavigation()
  ]);
  const text_sk = await page.evaluate(
    () => ({
      innerHTML: document.querySelector('span').innerHTML,
      g_lang: window.g_lang,
      g_langSeparator: window.g_langSeparator,
    })
  );
  expect(text_sk.innerHTML).toEqual('test sk antd');
  expect(text_sk.g_lang).toEqual('sk');
  expect(text_sk.g_langSeparator).toEqual('-');
}
