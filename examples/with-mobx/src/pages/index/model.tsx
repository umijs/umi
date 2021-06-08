import { Reducer, Subscription } from 'umi';

interface CountModelType {
  namespace: 'count';
  state: number;
  reducers: {
    increase: Reducer<number>;
    decrease: Reducer<number>;
  };
  subscriptions: {
    setup: Subscription;
  };
}

const CountModel: CountModelType = {
  namespace: 'count',
  state: 0,
  reducers: {
    increase(state) {
      return state! + 1;
    },
    decrease(state) {
      return state! - 1;
    },
  },
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(({}) => {
        console.log(history);
      });
    },
  },
};

export default CountModel;
