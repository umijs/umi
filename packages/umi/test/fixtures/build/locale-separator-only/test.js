export default async function({ page, host }) {
  await page.goto(`${host}/`, {
    waitUntil: 'networkidle2',
  });
  const text = await page.evaluate(
    () => ({
      innerHTML: document.querySelector('span').innerHTML,
      locale: document.getElementById('locale').innerText,
      g_lang: window.g_lang,
      awefwaefae: window.aweffawefewf,
      g_langSeparator: window.g_langSeparator,
    })
  );
  console.log('texttexttexttext', text);
  expect(text.innerHTML).toEqual('测试中文 antd');
  expect(text.g_lang).toEqual('zh_CN');
  expect(text.g_langSeparator).toEqual('_');


  await page.click('button[id=btn_en]')
  const text_en = await page.evaluate(
    () => ({
      innerHTML: document.querySelector('span').innerHTML,
      locale: document.innerHTML,
      g_lang: window.g_lang,
      g_langSeparator: window.g_langSeparator,
    })
  );
  console.log('text_en', text_en);
  expect(text_en.innerHTML).toEqual('test en antd');
  expect(text_en.g_lang).toEqual('en_US');
  expect(text_en.g_langSeparator).toEqual('_');
}
