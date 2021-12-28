export default {
  qiankun: {
    slave: {},
  },
  routes: [
    { path: '/', component: 'index' },
    { path: '/users', component: '() => { return <h1>users</h1> }' },
    {
      path: '/users2',
      component: '(() => () => { return <h1>users 2</h1> })()',
    },
  ],
};
