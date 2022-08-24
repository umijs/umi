// @ts-ignore
import type { RouterConfig } from 'umi';

export function onRouterCreated({ router }: any) {
  console.log('onRouterCreated', router);
}

export function onAppCreated({ app }: any) {
  console.log('onAppCreated', app);
}

export function onMounted({ app, router }: any) {
  console.log('onMounted', app, router);
  // @ts-ignore
  router.beforeEach((to, from, next) => {
    console.log('router beforeEach', to, from);
    next();
  });
}

export const router: RouterConfig = {
  linkExactActiveClass: 'is-active',
  // @ts-ignore
  scrollBehavior(to, from) {
    console.log('scrollBehavior', to, from);
  },
};
