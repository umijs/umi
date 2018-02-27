import { routerRedux } from 'dva/router';

function delay(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

export default {
  namespace: 'global',
  state: {
    text: 'hello umi+dva',
    login: false,
  },
  reducers: {
    setText(state) {
      return {
        ...state,
        text: 'setted',
      };
    },
    signin(state) {
      return {
        ...state,
        login: true,
      };
    },
  },
  effects: {
    *login(action, { call, put }) {
      yield put({
        type: 'signin',
      });
      yield put(routerRedux.push('/admin'));
    },
    *throwError() {
      throw new Error('hi error');
    },
  },
};
