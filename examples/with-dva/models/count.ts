import type { DvaModel } from 'umi';

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));
export interface CountModelState {
  num: number;
}

export default {
  namespace: 'count',
  state: {
    num: 0,
  },
  reducers: {
    add(state: any): any {
      state.num += 1;
    },
  },
  effects: {
    *addAsync(_action: any, { put }: any) {
      yield delay(1000);
      yield put({ type: 'add' });
    },
    *throwError(_action: any) {
      throw new Error('effect error');
    },
  },
} as DvaModel<CountModelState>;
