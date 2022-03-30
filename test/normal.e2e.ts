import { join } from 'path';
import { createUmi } from 'test-utils';

const fixtures = join(__dirname, 'fixtures');

jest.setTimeout(35 * 1000);

test('normal e2e', async () => {
  const { build, has, getIndex } = createUmi({
    name: 'normal',
    cwd: fixtures,
  });

  const { stdout } = await build();
  expect(stdout).toMatch('Build index.html');
  expect(has('dist/index.html')).toBe(true);

  const logs = [];
  const onConsole = (msg) => {
    logs.push(msg.text());
  };

  try {
    page.on('console', onConsole);
    await page.goto(getIndex());

    await expect(page).toMatchText('#demoApp', ' Demos In This App ');

    // 样式判断
    const element = await page.$('.container___B5qAY');
    expect(element).toMatchComputedStyle('width', '1024px');

    // 日志检查
    expect(logs.some((msg) => msg.match('hello e2e'))).toBe(true);

    // 点击文档页
    await page.click('a#docs');
    await expect(page).toHaveFocus('#docs');

    await expect(page).toMatchText('div.doc', 'This is Docs Page!');
  } finally {
    page.off('console', onConsole);
  }
});
