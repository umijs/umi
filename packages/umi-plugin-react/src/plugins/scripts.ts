import { IApi } from 'umi-types';
import getScripts, { ScriptConfig } from '../utils/getScripts';

export default function(api: IApi, option: ScriptConfig) {
  api.onOptionChange(newOption => {
    option = newOption;
    api.rebuildHTML();
    api.refreshBrowser();
  });

  api.addHTMLScript(() => {
    return getScripts(option);
  });
}
