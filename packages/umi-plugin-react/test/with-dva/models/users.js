export default {
  state: {
    data: ['cc'],
  },
  effects: {
    *throwError() {
      throw new Error('test error');
    },
  },
};
