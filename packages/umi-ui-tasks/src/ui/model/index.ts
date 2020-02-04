import {
  callRemote,
  listenRemote,
  getTerminalRefIns,
  getNoticeMessage,
  intl,
  notify,
  runTask,
  cancelTask,
  getTaskDetail,
} from '../util';

export const namespace = 'org.umi.taskManager';
import { TaskType, TaskState } from '../../server/core/enums';
import { Analyze } from '../util';

let init = false;

export default {
  namespace,
  state: {
    currentProject: {},
    tasks: {}, // [cwd]: { dev: DevTask, build: BuildTask, ... }
    dbPath: {}, // [cwd]: 'dbPath'
  },
  effects: {
    // 初始化 taskManager
    *init({ payload, callback }, { call, put }) {
      const { currentProject, getSharedDataDir } = payload;
      const { states: taskStates } = yield callRemote({
        type: 'plugin/init',
        payload: {
          key: currentProject.key,
        },
      });
      const dir = yield getSharedDataDir();
      yield put({
        type: 'initCurrentProjectState',
        payload: {
          currentProject,
          taskStates,
          dbPath: dir,
        },
      });
    },
    // 执行任务
    *exec({ payload }, { call }) {
      const { taskType, args, env } = payload;
      yield call(runTask, taskType, args, env);
    },
    // 取消任务
    *cancel({ payload }, { call }) {
      const { taskType } = payload;
      yield call(cancelTask, taskType);
    },

    // 获取任务详情（获取日志时使用 -> 前端不做 log 的存储）
    *getTaskDetail({ payload }, { put, call }) {
      const { taskType, callback, log, dbPath } = payload;
      const result = yield call(getTaskDetail, taskType, log, dbPath);
      callback && callback(result);
      yield put({
        type: 'updateWebpackStats',
        payload: result,
      });
    },

    // 更新日志
    *writeLog({ payload }, { select }) {
      const { taskType, log, key: projectKey } = payload;
      const modal = yield select(state => state[namespace]);
      const key = modal && modal.currentProject && modal.currentProject.key;
      if (!key) {
        return;
      }
      const ins = getTerminalRefIns(taskType, projectKey);
      if (!ins) {
        return;
      }
      ins.write(log.replace(/\n/g, '\r\n'));
    },
  },
  reducers: {
    initCurrentProjectState(state, { payload }) {
      const { currentProject, taskStates, dbPath } = payload;
      return {
        ...state,
        currentProject,
        tasks: {
          ...state.tasks,
          [currentProject.path]: taskStates,
        },
        dbPath: {
          ...state.dbPath,
          [currentProject.path]: dbPath,
        },
      };
    },
    updateTaskDetail(state, { payload }) {
      const { taskType, detail, cwd } = payload;
      const { stats, ...rest } = detail;
      return {
        ...state,
        tasks: {
          ...state.tasks,
          [cwd]: {
            ...state.tasks[cwd],
            [taskType]: {
              ...state.tasks[cwd][taskType],
              ...rest,
              analyze: stats ? new Analyze(stats) : null,
            },
          },
        },
      };
    },
    updateWebpackStats(state, { payload }) {
      const { currentCwd, stats, type } = payload;
      return {
        ...state,
        tasks: {
          ...state.tasks,
          [currentCwd]: {
            ...state.tasks[currentCwd],
            [type]: {
              ...state.tasks[currentCwd][type],
              analyze: stats ? new Analyze(stats) : null, // 若有 stats, 初始化 analyze instance
            },
          },
        },
      };
    },
  },
  subscriptions: {
    setup({ history, dispatch }) {
      history.listen(({ pathname }) => {
        if (init) {
          return;
        }
        if (pathname === '/tasks') {
          init = true;
          // 接收状态通知
          listenRemote({
            type: 'org.umi.task.state',
            onMessage: ({ detail, taskType, cwd }) => {
              // 更新 state 数据
              dispatch({
                type: 'updateTaskDetail',
                payload: {
                  detail,
                  taskType,
                  cwd,
                },
              });

              // 成功或者失败的时候做通知
              if ([TaskState.INIT, TaskState.ING].indexOf(detail.state) > -1) {
                return;
              }
              const { title, message, ...rest } = getNoticeMessage(taskType, detail.state);
              // TODO: 这儿应该加上项目的名称
              notify({
                title: intl({ id: title }),
                message: intl({ id: message }),
                ...rest,
              });
            },
          });
          // 日志更新
          listenRemote({
            type: 'org.umi.task.log',
            onMessage: ({
              log = '',
              taskType,
              key,
            }: {
              log: string;
              taskType: TaskType;
              key: string;
            }) => {
              if (!log) {
                return;
              }
              dispatch({
                type: 'writeLog',
                payload: {
                  taskType,
                  log,
                  key,
                },
              });
            },
          });
        }
      });
    },
  },
};
