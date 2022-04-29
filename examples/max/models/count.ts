export default {
  namespace: 'count',
  state: 0,
  reducers: {
    add(state: number) {
      return state + 1;
    },
  },
  subscriptions: {
    setup(opts: any) {
      console.log('dva model setup', opts);
    },
  },
};
