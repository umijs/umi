export function rootContainer({ router, store, Vue }) {
  return new Vue({
    router,
    store,
    render(h) {
      return h('router-view');
    },
  });
}
