import 'zx/globals';
import { getGptResponse } from './utils/getGptResponse';
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
      featLogs.push(item.replace('* feat:', '* 新增'));
    } else if (item.indexOf('* fix') > -1) {
      fixLogs.push(item.replace('* fix', '* 修复'));
    } else if (item.indexOf('* dep') > -1) {
      depLogs.push(item.replace('* dep:', '* 依赖'));
    } else {
      releaseNotesList.push(item);
    }
  });
  changeLogs = [...featLogs, ...fixLogs, ...depLogs];

  const prompt = changeLogs.join('\n') + '\n请将以上内容翻译成中文';

  const aiAnswer = await getGptResponse(prompt);
  console.log('ai666');
  console.log(aiAnswer);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
