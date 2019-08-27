import { IApi } from 'umi-types';
import TaskManager from './core/TaskManger';
import { formatEnv } from './util';

const taskManger: TaskManager = new TaskManager();
export default (api: IApi) => {
  api.onUISocket(({ action: { type, payload }, send, log }) => {
    switch (type) {
      case 'plugin/init':
        (async () => {
          await taskManger.init(api.cwd, send);
          send({
            type: `${type}/success`,
            payload: {},
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
          const task = taskManger.getTask(payload.type);
          send({
            type: 'tasks/detail/success',
            payload: {
              ...taskManger.getTaskDetail(payload.type),
              ...task.getDetail(),
              log: task.getLog(),
            },
          });
        })();
        break;
      case 'tasks/run':
        (async () => {
          log('info', `Run task: ${payload.type} `);
          const task = taskManger.getTask(payload.type);
          await task.run(formatEnv(payload.env));
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
          const task = taskManger.getTask(payload.type);
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
        const task = taskManger.getTask(payload.type);
        task.clearLog();
        send({
          type: 'tasks/clearLog/success',
          payload: {},
        });
        break;
      default:
    }
  });
};
