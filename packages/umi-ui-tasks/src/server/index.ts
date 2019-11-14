import { IApi } from 'umi-types';
import TaskManager from './core/TaskManger';
import { formatEnv } from './util';

const taskManger: TaskManager = new TaskManager();
export default (api: IApi) => {
  api.onUISocket(({ action: { type, payload }, send, log }) => {
    switch (type) {
      case 'plugin/init':
        (async () => {
          await taskManger.init(api.cwd, send, payload.key);
          const states = await taskManger.getTasksState();
          send({
            type: `${type}/success`,
            payload: {
              states,
            },
          });
        })();
        break;
      case 'tasks':
        (async () => {
          send({
            type: `${type}/success`,
            payload: await taskManger.getTasksState(),
          });
        })();
        break;
      case 'tasks/detail': // 初始化操作
        (async () => {
          const task = await taskManger.getTask(payload.type);
          const detail = await task.getDetail(payload.dbPath);
          send({
            type: 'tasks/detail/success',
            payload: {
              ...detail,
              log: payload.log ? task.getLog() : null,
              currentCwd: taskManger.currentCwd,
            },
          });
        })();
        break;
      case 'tasks/run':
        (async () => {
          log('info', `Run task: ${payload.type} `);
          const task = await taskManger.getTask(payload.type);
          await task.run(payload.args, formatEnv(payload.env));
          send({
            type: 'tasks/run/success',
            payload: {
              pid: task.proc.pid,
            },
          });
        })();
        break;
      case 'tasks/cancel':
        (async () => {
          log('info', `Cancel task: ${payload.type} `);
          const task = await taskManger.getTask(payload.type);
          await task.cancel();
          send({
            type: 'tasks/cancel/success',
            payload: {
              pid: task.proc.pid,
            },
          });
        })();
        break;
      case 'tasks/clearLog':
        (async () => {
          const task = await taskManger.getTask(payload.type);
          task.clearLog();
          send({
            type: 'tasks/clearLog/success',
            payload: {},
          });
        })();
        break;
      case 'tasks/is_dev_server_alive':
        (async () => {
          const alive = await taskManger.isDevServerAlive();
          send({
            type: 'tasks/is_dev_server_alive/success',
            payload: {
              alive,
            },
          });
        })();
        break;
      default:
    }
  });
};
