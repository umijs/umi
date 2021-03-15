import routesToJSON from './routesToJSON';

test('normal', () => {
  const ret = routesToJSON({
    routes: [{ path: '/', component: '@/pages/index.ts' }],
    config: {},
  });
  expect(ret).toEqual(
    `
[
  {
    "path": "/",
    "component": require('@/pages/index.ts').default
  }
]
  `.trim(),
  );
});

test('normal with dynamicImport', () => {
  const ret = routesToJSON({
    routes: [
      { path: '/', component: '@/pages/index.ts' },
      { path: '/users/:id', component: '@/pages/users/[id].ts' },
    ],
    config: {
      dynamicImport: true,
    },
  });
  expect(ret).toEqual(
    `
[
  {
    "path": "/",
    "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__index' */'@/pages/index.ts')})
  },
  {
    "path": "/users/:id",
    "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__users__id' */'@/pages/users/[id].ts')})
  }
]
  `.trim(),
  );
});

test('normal with dynamicImport and ssr', () => {
  const ret = routesToJSON({
    routes: [
      { path: '/', component: '@/pages/index.ts' },
      { path: '/users/:id', component: '@/pages/users/[id].ts' },
    ],
    config: {
      dynamicImport: true,
    },
    isServer: true,
  });
  expect(ret).toEqual(
    `
[
  {
    "path": "/",
    "component": require('@/pages/index.ts').default,
    "_chunkName": "p__index"
  },
  {
    "path": "/users/:id",
    "component": require('@/pages/users/[id].ts').default,
    "_chunkName": "p__users__id"
  }
]
  `.trim(),
  );
});

test('component with arrow function', () => {
  expect(
    routesToJSON({
      routes: [{ path: '/', component: '()=><div>loading...</div>' }],
      config: {},
    }),
  ).toEqual(
    `
[
  {
    "path": "/",
    "component": ()=><div>loading...</div>
  }
]
  `.trim(),
  );
  expect(
    routesToJSON({
      routes: [{ path: '/', component: '(props) => <div>loading...</div>' }],
      config: {},
    }),
  ).toEqual(
    `
[
  {
    "path": "/",
    "component": (props) => <div>loading...</div>
  }
]
  `.trim(),
  );
});

test('component with function', () => {
  expect(
    routesToJSON({
      routes: [
        {
          path: '/',
          component: 'function(){ return <div>loading...</div>; }',
        },
      ],
      config: {},
    }),
  ).toEqual(
    `
[
  {
    "path": "/",
    "component": function(){ return <div>loading...</div>; }
  }
]
  `.trim(),
  );
  expect(
    routesToJSON({
      routes: [
        {
          path: '/',
          component: 'function abc(props) { return <div>loading...</div>; }',
        },
      ],
      config: {},
    }),
  ).toEqual(
    `
[
  {
    "path": "/",
    "component": function abc(props) { return <div>loading...</div>; }
  }
]
  `.trim(),
  );
});

test('wrappers', () => {
  const ret = routesToJSON({
    routes: [
      {
        path: '/',
        component: '@/pages/index.ts',
        wrappers: ['@/wrappers/foo.ts'],
      },
    ],
    config: {},
  });
  expect(ret).toEqual(
    `
[
  {
    "path": "/",
    "component": require('@/pages/index.ts').default,
    "wrappers": [require('@/wrappers/foo.ts').default]
  }
]
  `.trim(),
  );
});

test('wrappers with dynamicImport', () => {
  const ret = routesToJSON({
    routes: [
      {
        path: '/',
        component: '@/pages/index.ts',
        wrappers: ['@/wrappers/foo.ts'],
      },
    ],
    config: {
      dynamicImport: true,
    },
  });
  expect(ret).toEqual(
    `
[
  {
    "path": "/",
    "component": dynamic({ loader: () => import(/* webpackChunkName: 'p__index' */'@/pages/index.ts')}),
    "wrappers": [dynamic({ loader: () => import(/* webpackChunkName: 'wrappers' */'@/wrappers/foo.ts')})]
  }
]
  `.trim(),
  );
});
