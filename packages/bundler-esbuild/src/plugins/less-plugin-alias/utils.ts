import { Alias } from './types';

function hoistAlias(alias: Alias[]) {
  function getFinalReplacement(
    oAlias: Alias[],
    replacement: string,
    index: number,
  ): string {
    //过滤重复配置，防止死循环
    const newAlias = oAlias.slice();
    newAlias.splice(index, 1);

    //遍历找到需要深层替换的配置
    for (let i = 0; i < newAlias.length; i++) {
      if ((newAlias[i].find as RegExp).test(replacement)) {
        replacement = replacement.replace(
          newAlias[i].find,
          newAlias[i].replacement,
        );
        return getFinalReplacement(newAlias, replacement, i);
      }
    }
    return replacement;
  }

  alias.forEach((rule: Alias, index: number, alias: Alias[]) => {
    rule.replacement = getFinalReplacement(alias, rule.replacement, index);
  });
  return alias;
}

export function parseAlias(alias: Record<string, string>): Alias[] {
  const wholeAlias: Alias[] = [
    // to support less-loader ~ for local deps, refer: https://github.com/vitejs/vite/issues/2185
    { find: /^~/, replacement: '' },
  ];

  const userAlias = Object.entries<string>(alias).map(([name, target]) => ({
    find: new RegExp(`^~?${name.replace(/(?<!\$)$/, '(?=/|$)')}`),
    replacement: target,
  }));

  wholeAlias.unshift(...userAlias);

  return hoistAlias(wholeAlias);
}
