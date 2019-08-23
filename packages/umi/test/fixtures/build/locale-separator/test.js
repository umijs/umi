export default async function({ page, host }) {
  await page.goto(`${host}/`, {
    waitUntil: 'networkidle2',
  });
  const text = await page.evaluate(
    () => ({
      innerHTML: document.querySelector('span').innerHTML,
      locale: document.getElementById('locale').innerText,
      g_lang: window.g_lang,
      g_langSeparator: window.g_langSeparator,
    })
  );

  expect(text.innerHTML).toEqual('测试中文 antd');
  expect(text.g_lang).toEqual('zh_CN');
  expect(text.g_langSeparator).toEqual('_');

  await Promise.all([
    page.click('button[id=btn_en]'),
    page.waitForNavigation()
  ]);
  const text_en = await page.evaluate(
    () => ({
      innerHTML: document.querySelector('span').innerHTML,
      locale: document.innerHTML,
      g_lang: window.g_lang,
      g_langSeparator: window.g_langSeparator,
    })
  );

  expect(text_en.innerHTML).toEqual('test en antd');
  expect(text_en.g_lang).toEqual('en_US');
  expect(text_en.g_langSeparator).toEqual('_');


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
  expect(text_zh.g_lang).toEqual('zh_CN');
  expect(text_zh.g_langSeparator).toEqual('_');

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
  expect(text_sk.g_langSeparator).toEqual('_');
}
