import * as t from '@umijs/bundler-utils/compiled/babel/types';

const DEFAULT = 'default';

export function parseSpecifiers(specifiers: any[]) {
  return specifiers.reduce(
    (memo, s) => {
      if (t.isImportDefaultSpecifier(s)) {
        memo.properties.push(t.objectProperty(t.identifier(DEFAULT), s.local));
      } else if (t.isExportDefaultSpecifier(s)) {
        memo.properties.push(
          t.objectProperty(t.identifier(DEFAULT), s.exported),
        );
      } else if (t.isExportSpecifier(s)) {
        if (t.isIdentifier(s.exported, { name: DEFAULT })) {
          memo.defaultIdentifier = s.local.name;
          memo.properties.push(t.objectProperty(s.local, s.local));
        } else {
          memo.properties.push(t.objectProperty(s.local, s.exported));
        }
      } else if (t.isImportNamespaceSpecifier(s)) {
        memo.namespaceIdentifier = s.local;
      } else {
        memo.properties.push(t.objectProperty(s.imported, s.local));
      }
      return memo;
    },
    { properties: [], namespaceIdentifier: null, defaultIdentifier: null },
  );
}
