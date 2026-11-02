import { readFileSync } from 'fs';
import { join } from 'path';
import React, { useContext } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ts from 'typescript';
import { Mustache } from 'umi/plugin-utils';

const AppContext = React.createContext<{ basename?: string }>({});

function renderMicroApp(
  basename?: string,
  base = '/static/',
  routeMode = 'prepend',
) {
  const template = readFileSync(
    join(
      __dirname,
      '../../libs/qiankun/master/getMicroAppRouteComponent.tsx.tpl',
    ),
    'utf8',
  );
  const source = Mustache.render(template, {});
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      jsx: ts.JsxEmit.React,
      esModuleInterop: true,
    },
  });
  const exports: any = {};
  const imports = {
    react: React,
    umi: {
      useMatch: () => ({ pathnameBase: '/child' }),
      useAppData: () => useContext(AppContext),
    },
    './MicroApp': {
      MicroApp: (props) => React.createElement('span', null, props.base),
    },
    './constants': require('../../libs/qiankun/master/constants'),
  };
  new Function('require', 'exports', outputText)(
    (name) => imports[name],
    exports,
  );
  const Component = exports.getMicroAppRouteComponent({
    appName: 'nested',
    base,
    routePath: '/child/*',
    routeMode,
    masterHistoryType: 'browser',
  });
  return renderToStaticMarkup(
    React.createElement(
      AppContext.Provider,
      { value: { basename } },
      React.createElement(Component),
    ),
  );
}

test('nested micro-apps inherit their parent runtime basename', () => {
  expect(renderMicroApp('/shell/parent/')).toBe(
    '<span>/shell/parent/child</span>',
  );
});

test('a root runtime basename overrides the static base', () => {
  expect(renderMicroApp('/')).toBe('<span>/child</span>');
  expect(renderMicroApp('')).toBe('<span>/child</span>');
});

test('static base remains the fallback without a runtime basename', () => {
  expect(renderMicroApp()).toBe('<span>/static/child</span>');
  expect(renderMicroApp(undefined, '/')).toBe('<span>/child</span>');
});

test('match mode inherits the runtime base without appending the route', () => {
  expect(renderMicroApp('/shell/parent/', '/static/', 'match')).toBe(
    '<span>/shell/parent</span>',
  );
});
