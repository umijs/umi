export default {
  state: {
    num: 100,
  },
  reducers: {
    add(state: any) {
      state.num += 1;
    },
  },
};
