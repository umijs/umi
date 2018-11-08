import { join } from 'path';
import { insertRouteContent, getRealRoutesPath } from './writeNewRoute';

describe('insertRouteContent', () => {
  it.only('getRealRoutesPath in antdpro', () => {
    const configPath = join(
      __dirname,
      '../fixtures/block/antdpro/config/config.js',
    );
    const routesPath = join(
      __dirname,
      '../fixtures/block/antdpro/config/router.config.js',
    );
    expect(getRealRoutesPath(configPath)).toEqual({
      realPath: routesPath,
      routesProperty: null,
    });
  });

  it('getRealRoutesPath in simple demo', () => {
    const configPath = join(__dirname, '../fixtures/block/simple/.umirc.js');
    expect(getRealRoutesPath(configPath)).toEqual({
      realPath: configPath,
      routesProperty: 'routes',
    });
  });

  it('getRealRoutesPath in alias demo', () => {
    const configPath = join(
      __dirname,
      '../fixtures/block/alias/config/config.js',
    );
    const aliasPath = join(__dirname, '../fixtures/block/alias');
    expect(getRealRoutesPath(configPath, aliasPath)).toEqual({
      realPath: join(aliasPath, 'routes.js'),
      routesProperty: null,
    });
  });

  it('routes is a array', () => {
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
        'routes',
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
        'routes',
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
        'routes',
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

  it('routes export from default', () => {
    expect(
      insertRouteContent(
        `import test from './test';
export default [
  // user
  {
    path: '/',
    component: 'testindex'
  }
];
`,
        'demo',
        null,
      ),
    ).toEqual(`import test from './test';
export default [
  {
    path: '/demo',
    component: './demo'
  },
  // user
  {
    path: '/',
    component: 'testindex'
  }
];
`);
  });
});
