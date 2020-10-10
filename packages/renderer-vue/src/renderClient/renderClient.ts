import { createApp } from 'vue';
import {
  createRouter,
  createWebHistory,
  createWebHashHistory,
} from 'vue-router';
// @ts-ignore
import App from '@@/plugin-vue/App.vue';

export function renderClient(opts: any) {
  const router = createRouter({
    history: createWebHistory(),
    routes: opts.routes,
  });
  console.log(router.getRoutes());
  console.log('test', App, App.render.toString());
  const app = createApp(App);
  app.use(router);
  console.log(app);
  app.mount(`#${opts.rootElement}`);
}
