/*
 * @Description:
 * @Author: xiaobei
 * @Date: 2020-07-09 21:35:14
 * @LastEditTime: 2020-07-09 21:35:14
 */

export default {
  namespace: 'test',
  state: {
    title: null,
  },

  effects: {
  },

  reducers: {
    test(state, { payload }) {
      state.title = 'hello umi';
    },
  },

};
