import { transform } from './jsTransformer';

test('@alipay/bigfish/util > @alipay/bigfish/utils', () => {
  expect(
    transform({
      code: `import foo from '@alipay/bigfish/util/foo';`,
      filePath: '',
    }).code,
  ).toEqual(`import foo from "@alipay/bigfish/utils/foo";`);
});

test('Helmet from @alipay/bigfish', () => {
  expect(
    transform({
      code: `import 'a1';import { Helmet } from '@alipay/bigfish';import 'a2';import 'a3';`,
      filePath: '',
    }).code,
  ).toEqual(
    `import 'a1';import 'a2';import 'a3';import { Helmet } from "@alipay/bigfish/utils/react-helmet";`,
  );
});

test('useRouteMatch > useMatch', () => {
  expect(
    transform({
      code: `import { useRouteMatch } from '@alipay/bigfish';`,
      filePath: '',
    }).code,
  ).toEqual(`import { useMatch as useRouteMatch } from '@alipay/bigfish';`);
});

test('Redirect > Navigate', () => {
  expect(
    transform({
      code: `import { Redirect } from '@alipay/bigfish';<Redirect to="foo" />;`,
      filePath: '',
    }).code,
  ).toEqual(
    `import { Navigate as Redirect } from '@alipay/bigfish';<Redirect to="foo" />;`,
  );
});

test('dynamic', () => {
  expect(
    transform({
      code: `import { dynamic } from '@alipay/bigfish';const AsyncComponent = dynamic({ loader: import('./AsyncComponent') });`,
      filePath: '',
    }).code,
  ).toEqual(
    `const AsyncComponent = loadable(() => import('./AsyncComponent'));import loadable from "@loadable/component";`,
  );
});

test('children', () => {
  transform({
    code: `<test>{ children }</test>`,
    filePath: 'foo.tsx',
  });
});

test('props.children', () => {
  transform({
    code: `<test>{ props.children }</test>`,
    filePath: 'foo.tsx',
  });
});

test('invalid matchPath', () => {
  transform({
    code: `matchPath('/abc', { path: '*' })`,
    filePath: '',
  });
});

test('route props', () => {
  expect(
    transform({
      code: `
function foo(props) {
  props.history,props.location,props.match,props.routes,props.route,props.location;
}
    `.trim(),
      filePath: '',
    }).code,
  ).toEqual(
    `
function foo(props) {const { route } = useAppData();const { routes } = useRouteData();const match = useMatch();const location = useLocation();
  history, location, match, routes, route, location;
}import { history, useLocation, useMatch, useRouteData, useAppData } from "@alipay/bigfish";
  `.trim(),
  );
});

test('route props with assign', () => {
  expect(
    transform({
      code: `
function foo(props) {
  const { history, match, location, routes, route } = props;
}
    `.trim(),
      filePath: '',
    }).code,
  ).toEqual(
    `
function foo(props) {const match = useMatch();const location = useLocation();const { routes } = useRouteData();const { route } = useAppData();

}import { useAppData, useRouteData, useLocation, useMatch, history } from "@alipay/bigfish";
  `.trim(),
  );
});

test('@alipay/bigfish/icons', () => {
  const context: any = {
    deps: { includes: {} },
  };
  expect(
    transform({
      code: `import { Foo, ApiFilled, Bar } from '@alipay/bigfish/icons';`,
      filePath: 'foo.tsx',
      context,
    }).code,
  ).toEqual(
    `import { ApiFilled } from "@ant-design/icons";import { ReactComponent as Bar } from "@/assets/Bar";import { ReactComponent as Foo } from "@/assets/Foo";`,
  );
  expect(context.deps.includes).toEqual({ '@ant-design/icons': '^4.0.0' });
});

test('history.goBack > history.back', () => {
  expect(
    transform({
      code: `history.goBack();`,
      filePath: '',
    }).code,
  ).toEqual(`history.back();`);
});

test('@@/plugin-qiankun/masterOptions -> @@/plugin-qiankun-master/masterOptions', () => {
  expect(
    transform({
      code: `import a from '@@/plugin-qiankun/masterOptions';`,
      filePath: '',
    }).code,
  ).toEqual(`import a from "@@/plugin-qiankun-master/masterOptions";`);
});

test('history.push query > search', () => {
  expect(
    transform({
      code: `history.push({ pathname: '/foo', query: { a: 1 } });`,
      filePath: '',
    }).code,
  ).toEqual(
    `history.push({ pathname: '/foo', search: qs.stringify({ a: 1 }) });import * as qs from "@alipay/bigfish/utils/query-string";`,
  );
});

test('location query assign', () => {
  expect(
    transform({
      code: `const { query } = location;`,
      filePath: '',
    }).code,
  ).toEqual(
    `const query = qs_l_q.parse(location.search);import * as qs_l_q from "@alipay/bigfish/utils/query-string";`,
  );
});

test('location query assign with other properties', () => {
  expect(
    transform({
      code: `const { query, foo } = location;`,
      filePath: '',
    }).code,
  ).toEqual(
    `const { foo } = location;const query = qs_l_q.parse(location.search);import * as qs_l_q from "@alipay/bigfish/utils/query-string";`,
  );
});

test('ImportNamespaceSpecifier > ImportDefaultSpecifier for css modules', () => {
  expect(
    transform({
      code: `import * as styles from './index.module.less';`,
      filePath: '',
    }).code,
  ).toEqual(`import styles from './index.module.less';`);
});
