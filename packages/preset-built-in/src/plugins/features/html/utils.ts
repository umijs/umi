import { IScriptConfig, IStyleConfig } from '@umijs/types';
import { lodash } from '@umijs/utils';

export interface IHTMLTag {
  [key: string]: string;
}

const EXP_URL = /^(http:|https:)?\/\//;

export function deepUniq<T>(collection: T[]): T[] {
  return lodash.uniqWith(collection, lodash.isEqual);
}

/**
 * 格式化 script => object
 * @param option Array<string | IScript>
 */
export const getScripts = (option: IScriptConfig): IScriptConfig => {
  if (Array.isArray(option) && option.length > 0) {
    const scripts = option
      .filter((script) => !lodash.isEmpty(script))
      .map((aScript) => {
        if (typeof aScript === 'string') {
          return EXP_URL.test(aScript)
            ? { src: aScript }
            : { content: aScript };
        }
        // [{ content: '', async: true, crossOrigin: true }]
        return aScript;
      });
    return deepUniq(scripts);
  }
  return [];
};

/**
 * 格式化 styles => [linkObject, styleObject]
 * @param option Array<string | ILink>
 */
export const getStyles = (option: IStyleConfig): [IHTMLTag[], IHTMLTag[]] => {
  const linkArr: IHTMLTag[] = [];
  const styleObj: IHTMLTag[] = [];
  if (Array.isArray(option) && option.length > 0) {
    option.forEach((style) => {
      if (typeof style === 'string') {
        if (EXP_URL.test(style)) {
          // is <link />
          linkArr.push({
            charset: 'utf-8',
            rel: 'stylesheet',
            type: 'text/css',
            href: style,
          });
        } else {
          styleObj.push({
            content: style,
          });
        }
      }
      if (typeof style === 'object') {
        // is style object
        styleObj.push((style as unknown) as IHTMLTag);
      }
    });
  }
  return [deepUniq(linkArr), deepUniq(styleObj)];
};
