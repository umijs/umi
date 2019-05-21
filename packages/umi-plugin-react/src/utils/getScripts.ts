const isEmpty = require('lodash/isEmpty');

interface IScript extends Partial<HTMLScriptElement> {
  content?: string;
}

export type ScriptConfig = Array<IScript | string>;

// 方便测试
export default (option: ScriptConfig) => {
  if (Array.isArray(option) && option.length > 0) {
    return option
      .filter(script => !isEmpty(script))
      .map(aScript => {
        if (typeof aScript === 'string') {
          return /^(http:|https:)?\/\//.test(aScript) ? { src: aScript } : { content: aScript };
        }
        // [{ content: '', async: true, crossOrigin: true }]
        return aScript;
      });
  }
  return [];
};
