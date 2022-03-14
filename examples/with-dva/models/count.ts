export default {
  namespace: 'count',
  state: 0,
  reducers: {
    add(state: number) {
      return state + 1;
    },
  },
};
