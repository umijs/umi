import { insertRouteContent } from './writeNewRoute';

describe('insertRouteContent', () => {
  it.only('routes is a array', () => {
    expect(
      insertRouteContent(
        `import test from './test';
// test comment
export default {
  routes: [
    {
      path: '/',
      component: './test'
    }
  ]
};
`,
        'demo',
      ),
    ).toEqual(`import test from './test';
// test comment
export default {
  routes: [
    {
      path: '/demo',
      component: './demo'
    },
    {
      path: '/',
      component: './test'
    }
  ]
};
`);
  });

  it('routes is a not array', () => {
    expect(
      insertRouteContent(
        `import routes from './routes';
export default {
  routes: routes
};
`,
        'demo',
      ),
    ).toEqual(`import routes from './routes';
export default {
  routes: [
    {
      path: '/demo',
      component: './demo'
    },
    ...routes
  ]
};
`);
  });

  it('routes is a expression', () => {
    expect(
      insertRouteContent(
        `import routes from './routes';
export default {
  routes: routes.map(item => item)
};
`,
        'demo',
      ),
    ).toEqual(`import routes from './routes';
export default {
  routes: [
    {
      path: '/demo',
      component: './demo'
    },
    ...routes.map(item => item)
  ]
};
`);
  });
});
