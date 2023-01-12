import { aliasUtils } from '@umijs/utils';

export function getAliasedPathWithLoopDetect({
  value,
  alias,
}: {
  value: string;
  alias: Record<string, string>;
}): string {
  let needUnAlias = value;
  for (let i = 0; i < 10; i++) {
    let unAliased = aliasUtils.getAliasValue({ imported: needUnAlias, alias });
    if (unAliased) {
      needUnAlias = unAliased;
    } else {
      return needUnAlias;
    }
  }

  throw Error(
    `endless loop detected in resolve alias for '${value}', please check your alias config.`,
  );
}
