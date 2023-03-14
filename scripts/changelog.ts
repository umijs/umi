import { Builder, By, Key } from 'selenium-webdriver';
import 'zx/globals';
import { getReleaseNotes } from './utils/getReleaseNotes';

(async () => {
  const { releaseNotes } = await getReleaseNotes('4.0.54');
  console.log(releaseNotes);
  let featLogs = [],
    fixLogs = [],
    depLogs = [],
    changeLogs = [],
    releaseNotesList = [];
  releaseNotes.split('\n').forEach((item) => {
    if (item.indexOf('* doc') > -1 && item.indexOf('* chore') > -1) {
      return;
    } else if (item.indexOf('* feat') > -1) {
      featLogs.push(item.replace(/\* feat(\(.+\)){0,1}:/, '新增'));
    } else if (item.indexOf('* fix') > -1) {
      fixLogs.push(item.replace(/\* fix(\(.+\)){0,1}:/, '修复'));
    } else if (item.indexOf('* dep') > -1) {
      depLogs.push(item.replace(/\* dep(\(.+\)){0,1}:/, '依赖'));
    } else {
      releaseNotesList.push(item);
    }
  });
  changeLogs = [...featLogs, ...fixLogs, ...depLogs];

  const prompt = '* ' + changeLogs.join('\n') + '\n请将以上内容翻译成中文';
  console.log(prompt);

  // const aiAnswer = await getGptResponse(prompt);
  // console.log('ai666');
  // console.log(aiAnswer);
  await setGithubReleaseNote(prompt);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});

const setGithubReleaseNote = async (notes: string) => {
  // 获取 Github 账密配置
  const GITHUB_ACCOUNT = '.github_account';
  const ACCOUNT_INFO = fs
    .readFileSync(path.join(__dirname, '../', GITHUB_ACCOUNT), 'utf-8')
    .trim();
  const USERNAME = ACCOUNT_INFO.split('\n')?.[0].replace('USERNAME=', '');
  const PASSWORD = ACCOUNT_INFO.split('\n')?.[1].replace('PASSWORD=', '');

  let driver = await new Builder().forBrowser('chrome').build();
  try {
    // 打开 github Release 发布页
    await driver.get('https://github.com/MaxCDon/umi/releases/new');
    // 通过id选择器定位账号输入框
    const usernameInput = driver.findElement(By.id('login_field'));
    // 输入网址并回车搜索
    await usernameInput.sendKeys(USERNAME);
    // 通过id选择器定位密码输入框
    const passwordInput = driver.findElement(By.id('password'));
    // 输入网址并回车搜索
    await passwordInput.sendKeys(PASSWORD, Key.ENTER);

    // 通过id选择器定位 Tag 列表选择器
    const tagListSelect = driver.findElement(By.id('tag-list'));
    await tagListSelect.click();

    // 使用显性等待，超时时间为10秒
    // await driver.wait(
    //   until.elementLocated(By.xpath('//*[@tabindex="0"]')),
    //   10000,
    // );

    // 隐式等待设置10秒超时时间
    // await driver.manage().setTimeouts({ implicit: 10000 });
    await driver.sleep(3000);

    // 通过 xPath 组合选择器定位最新 Tag 项
    const tagListIndex0 = driver.findElement(
      By.xpath('//label[@data-index="0" and @class="SelectMenu-item" ]'),
    );
    await tagListIndex0.click();

    // 获取最新 Tag 名称
    const selectTagSpan = driver.findElement(
      By.xpath('//div[@id="tag-list"]//span[@data-menu-button]'),
    );
    const latestTagName = await selectTagSpan.getText();

    // 通过id选择器定位日志名称输入框
    const releaseNameInput = driver.findElement(By.id('release_name'));
    // 输入名称
    await releaseNameInput.sendKeys(latestTagName);

    // 通过id选择器定位日志内容输入框
    const releaseBodyTextarea = driver.findElement(By.id('release_body'));
    // 输入日志
    await releaseBodyTextarea.sendKeys(notes);
  } catch {
    await driver.quit();
  }
};
