// @ts-ignore
import { RouterConfig } from 'umi';

export function onRouterCreated({ router }: any) {
  console.log('onRouterCreated', router);
}

export function onAppCreated({ app }: any) {
  console.log('onAppCreated', app);
}

export function onMounted({ app, router }: any) {
  console.log('onMounted', app, router);
  router.beforeEach((to, from) => {
    console.log('router beforeEach', to, from);
  });
}

export const router: RouterConfig = {
  linkExactActiveClass: 'is-active',
  // @ts-ignore
  scrollBehavior(to, from) {
    console.log('scrollBehavior', to, from);
  },
};
