import type { IConfigProcessor } from '.';
import type { Alias } from '../../../compiled/vite';

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

/**
 * transform umi alias to vite alias
 */
export default (function alias(userConfig) {
  const config: ReturnType<IConfigProcessor> = {
    resolve: {
      alias: [
        // to support less-loader ~ for local deps, refer: https://github.com/vitejs/vite/issues/2185
        { find: /^~/, replacement: '' },
      ],
    },
  };

  // alias: { foo:  bar } foo => bar, foo/hoo => bar/foo
  // alias: { foo$: bar } foo => bar, foo/hoo => foo/hoo
  if (userConfig.alias) {
    const userAlias = Object.entries<string>(userConfig.alias).map(
      ([name, target]) => ({
        // supports webpack suffix $ and less-loader prefix ~
        // example:
        //   - dep => ^~?dep(?=\/|$)
        //   - dep$ => ^~?dep$
        find: new RegExp(`^~?${name.replace(/(?<!\$)$/, '(?=/|$)')}`),
        replacement: target,
      }),
    );
    const wholeAlias: Alias[] = config.resolve!.alias as Alias[];

    wholeAlias.unshift(...userAlias);
    config.resolve!.alias = hoistAlias(wholeAlias);
  }

  return config;
} as IConfigProcessor);
