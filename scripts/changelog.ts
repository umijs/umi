// @ts-nocheck
// FIXME: correct type definition when enable auto changelog
import { Builder, By, Key } from 'selenium-webdriver';
import 'zx/globals';
import { getLatestTag, getReleaseNotes } from './utils/github';
import { getGptResponse } from './utils/openai';

(async () => {
  // 获取命令参数 自定义 Tag 名称
  let customizeTag = argv?.tag || '';
  // 设置需查询的 Tag
  let selectTag = customizeTag;

  // 如果命令参数自定义 Tag 不存在，则获取最新的 Git Tag
  if (!customizeTag) {
    const { latestTag } = await getLatestTag();
    selectTag = latestTag;
  }

  // 获取 GitHub 自动生成的 Release Notes
  const { releaseNotes } = await getReleaseNotes(selectTag);

  // 格式化 Release Notes
  let featLogs = [],
    fixLogs = [],
    depLogs = [],
    changeLogs = [],
    releaseNotesList = [];
  releaseNotes.split('\n').forEach((item) => {
    // 删除 doc & chore 日志
    if (item.indexOf('* doc') > -1 || item.indexOf('* chore') > -1) {
      return;
    } else if (item.indexOf('* feat') > -1) {
      // 文案转换 feat: -> 新增
      featLogs.push(item.replace(/\* feat(\(.+\)){0,1}:/, '新增'));
    } else if (item.indexOf('* fix') > -1) {
      // 文案转换 fix: -> 修复
      fixLogs.push(item.replace(/\* fix(\(.+\)){0,1}:/, '修复'));
    } else if (item.indexOf('* dep') > -1) {
      // 文案转换 dep: -> 依赖
      depLogs.push(item.replace(/\* dep(\(.+\)){0,1}:/, '依赖'));
    } else {
      releaseNotesList.push(item);
    }
  });

  // 将 commit message 通过 ChatGpt 翻译成中文
  changeLogs = [...featLogs, ...fixLogs, ...depLogs];
  let logTypes = [],
    logContents = [],
    logUsers = [];

  let re = /(新增|修复|依赖)(.*)(by .*)/;
  changeLogs.forEach((item) => {
    const matchList = item.match(re);
    logTypes.push(matchList[1]);
    logContents.push(matchList[2]);
    logUsers.push(matchList[3]);
  });

  // 调用 ChatGpt 获取返回结果
  const prompt =
    logContents.join('\n') +
    '\n请将以上内容翻译成中文, 保留换行，不要去重，仅返回翻译后内容';
  const gptResponse = await getGptResponse(prompt);

  if (gptResponse) {
    const translateLogContents = gptResponse.split('\n');
    for (let i = 0; i < changeLogs.length; i++) {
      changeLogs[i] =
        logTypes[i] + ' ' + translateLogContents[i] + ' ' + logUsers[i];
    }
  }

  if (changeLogs?.length) {
    changeLogs[0] = '* ' + changeLogs[0];
  }

  // 合并 ReleaseNotes
  releaseNotesList.splice(1, 0, ...changeLogs);
  const formatReleaseNotes = releaseNotesList
    .join('\n')
    .replace('**Full', '\n**Full');

  // 打开浏览器，填入 GitHub ReleaseNotes 信息
  await setGitHubReleaseNote(formatReleaseNotes, customizeTag);
})().catch((e) => {
  console.error(e);
});

const setGitHubReleaseNote = async (notes: string, customizeTag: string) => {
  // 获取 GitHub 账密配置
  const GITHUB_ACCOUNT = '.github_account';
  const ACCOUNT_INFO = fs
    .readFileSync(path.join(__dirname, '../', GITHUB_ACCOUNT), 'utf-8')
    .trim();
  const USERNAME = ACCOUNT_INFO.split('\n')?.[0].replace('USERNAME=', '');
  const PASSWORD = ACCOUNT_INFO.split('\n')?.[1].replace('PASSWORD=', '');

  try {
    let driver = await new Builder().forBrowser('chrome').build();
    // 打开 GitHub Release 发布页
    await driver.get('https://github.com/umijs/umi/releases/new');
    // 通过 id 选择器定位账号输入框
    const usernameInput = driver.findElement(By.id('login_field'));
    // 输入网址并回车搜索
    await usernameInput.sendKeys(USERNAME);
    // 通过 id 选择器定位密码输入框
    const passwordInput = driver.findElement(By.id('password'));
    // 输入网址并回车搜索
    await passwordInput.sendKeys(PASSWORD, Key.ENTER);

    // 通过 id 选择器定位 Tag 列表选择器
    const tagListSelect = driver.findElement(By.id('tag-list'));
    await tagListSelect.click();

    // 隐式等待设置 2 秒超时时间
    await driver.sleep(2000);

    if (customizeTag) {
      // 自定义 Tag
      // 通过 xPath 组合选择器定位 newTag 输入框
      const newTagInput = driver.findElement(
        By.xpath('//input[@aria-label="Find or create a new tag"]'),
      );
      newTagInput.sendKeys(customizeTag, Key.ENTER);
    } else {
      // 未自定义 Tag
      // 通过 xPath 组合选择器定位最新 Tag 项
      const tagListIndex0 = driver.findElement(
        By.xpath('//label[@data-index="0" and @class="SelectMenu-item" ]'),
      );
      await tagListIndex0.click();
    }

    // 获取最新 Tag 名称
    const selectTagSpan = driver.findElement(
      By.xpath('//div[@id="tag-list"]//span[@data-menu-button]'),
    );
    const latestTagName = await selectTagSpan.getText();

    // 通过 id 选择器定位日志名称输入框
    const releaseNameInput = driver.findElement(By.id('release_name'));
    // 输入名称
    await releaseNameInput.sendKeys(latestTagName);

    // 通过 id 选择器定位日志内容输入框
    const releaseBodyTextarea = driver.findElement(By.id('release_body'));
    // 输入日志
    await releaseBodyTextarea.sendKeys(notes);
  } catch (e) {
    console.error(
      '请检查是否安装 selenium-webdriver 插件：http://chromedriver.storage.googleapis.com/index.html',
    );
    throw e;
  }
};
