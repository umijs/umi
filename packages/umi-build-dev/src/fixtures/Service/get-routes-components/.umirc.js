import { join } from 'path';

export default {
  routes: [
    {
      path: '/',
      component: join(__dirname, 'src', 'pages', '.umi', 'Layout.jsx'),
      routes: [
        { path: '/', component: './index' },
        { path: '/news', component: './news' },
        { path: '/news2', component: './news' }
      ]
    }
  ]
}
