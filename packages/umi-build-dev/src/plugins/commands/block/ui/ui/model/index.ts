import { IUiApi } from 'umi-types';

import { Block } from '../../../data.d';

export const namespace = 'org.umi.block';

let callRemote;

export function initApiToGlobal(api: IUiApi) {
  // eslint-disable-next-line
  callRemote = api.callRemote;
}

export interface ModelState {
  blockData: {
    [resourceId: string]: Block[];
  };
}

export default {
  namespace,
  // TODO fill state
  state: {
    blockData: {},
  },
  effects: {
    // 获取数据
    *fetch({ payload }, { call, put, select }) {
      const blockData = yield select(state => state[namespace].blockData);
      const { resourceId, reload } = payload;
      if (blockData[resourceId] && !reload) {
        return blockData[resourceId];
      }
      const { data: list } = yield call(() => {
        return callRemote({
          type: 'org.umi.block.list',
          payload: {
            resourceId,
          },
        });
      });
      yield put({
        type: 'saveData',
        payload: {
          resourceId,
          list,
        },
      });
      return [];
    },
  },
  reducers: {
    saveData({ blockData }, { payload }) {
      const { resourceId, list } = payload;
      const newState = {
        blockData: {
          ...blockData,
          [resourceId]: list,
        },
      };
      return newState;
    },
  },
};
