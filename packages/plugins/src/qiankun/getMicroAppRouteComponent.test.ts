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
  baseOverride?: string,
  routeProps?: { base: string },
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
  const route = {
    microApp: 'nested',
    path: '/child/*',
    mode: routeMode,
    microAppProps: routeProps,
    element: undefined,
  };
  const common = { exports: {} as any };
  const commonSource = readFileSync(
    join(__dirname, '../../libs/qiankun/master/common.ts'),
    'utf8',
  );
  const compiled = ts.transpileModule(commonSource, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true },
  });
  new Function('require', 'exports', compiled.outputText)(
    (name) =>
      name === './getMicroAppRouteComponent' ? exports : imports[name],
    common.exports,
  );
  common.exports.patchMicroAppRoute(route, {
    base,
    baseOverride,
    routeBindingAlias: 'microApp',
    masterHistoryType: 'browser',
  });
  return renderToStaticMarkup(
    React.createElement(
      AppContext.Provider,
      { value: { basename } },
      route.element,
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

test('match mode honors an explicit master base over the runtime basename', () => {
  expect(
    renderMicroApp('/shell/', '/shell/', 'match', '/shell/workspace/'),
  ).toBe('<span>/shell/workspace</span>');
  expect(renderMicroApp('/shell/', '/shell/', 'match', '')).toBe(
    '<span></span>',
  );
});

test('route props can override the explicit master base', () => {
  expect(
    renderMicroApp('/shell/', '/shell/', 'match', '/shell/workspace/', {
      base: '/custom',
    }),
  ).toBe('<span>/custom</span>');
});
