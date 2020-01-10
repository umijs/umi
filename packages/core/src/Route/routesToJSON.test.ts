import routesToJSON from './routesToJSON';

test('normal', () => {
  const ret = routesToJSON({
    routes: [{ path: '/', component: '@/pages/index.ts' }],
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

test('component with arrow function', () => {
  expect(
    routesToJSON({
      routes: [{ path: '/', component: '()=><div>loading...</div>' }],
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
