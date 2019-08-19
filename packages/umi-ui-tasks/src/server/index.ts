import { IApi } from 'umi-types';
import TaskManager from './core/TaskManger';
import { subscribeTaskEvent, formatEnv } from './util';

export default (api: IApi) => {
  const taskManger: TaskManager = new TaskManager(api);
  api.onUISocket(({ action: { type, payload }, send }) => {
    switch (type) {
      case 'plugin/init':
        subscribeTaskEvent(taskManger, send);
        break;
      case 'tasks':
        (async () => {
          send({
            type: `${type}/success`,
            payload: await taskManger.getTasksState(),
          });
        })();
        break;
      case 'tasks/detail':
        (async () => {
          send({
            type: 'tasks/detail/success',
            payload: taskManger.getTaskDetail(payload.type),
          });
        })();
        break;
      case 'tasks/run':
        (async () => {
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
      default:
    }
  });
};
