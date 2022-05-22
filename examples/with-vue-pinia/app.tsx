// @ts-ignore
import { createPinia } from 'pinia';
import { RouterConfig } from 'umi';

export function onAppCreated({ app }: any) {
  const pinia = createPinia();
  app.use(pinia);
}

export function onMounted({ app, router }: any) {
  console.log('onMounted', app, router);
  app.provide('umi-hello', {
    h: 'hello',
    w: 'word',
  });
}

export const router: RouterConfig = {
  // @ts-ignore
  scrollBehavior(to, from) {
    console.log('scrollBehavior', to, from);
  },
};
