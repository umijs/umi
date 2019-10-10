import { IUiApi } from 'umi-types';

import { Block } from '../../../data.d';
import { sendGaEvent } from '../../uiUtil';

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
  currentResourceId?: string;
}

export default {
  namespace,
  // TODO fill state
  state: {
    blockData: {},
    currentResourceId: null,
  },
  effects: {
    // 获取数据
    *fetch({ payload }, { call, put, select }) {
      const { blockData, currentResourceId } = yield select(state => state[namespace]);
      const { resourceId = currentResourceId, reload } = payload;
      if (blockData[resourceId] && !reload) {
        return blockData[resourceId];
      }

      sendGaEvent({
        action: 'fetch data',
        label: resourceId,
      });

      const { data: list } = yield call(() => {
        return callRemote({
          type: 'org.umi.block.list',
          payload: {
            resourceId,
            force: reload,
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
        currentResourceId: resourceId,
      };
      return newState;
    },
  },
};
