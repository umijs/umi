import TaskManager from '../core/TaskManger';
import { TaskEventType, LogType, TaskType } from '../core/enums';

let init: boolean = false;

function subscribeTaskEvent(taskManger: TaskManager, send) {
  if (init) {
    return;
  }
  init = true;

  taskManger.getAllTasks().forEach(({ type, task }) => {
    task.on(TaskEventType.STD_OUT_DATA, data => {
      send({
        type: 'org.umi.task.log',
        payload: {
          data,
          taskType: type,
          logType: LogType.STD_OUT,
        },
      });
    });
    task.on(TaskEventType.STD_ERR_DATA, data => {
      send({
        type: 'org.umi.task.log',
        payload: {
          logType: LogType.STD_ERR,
          taskType: type,
          data,
        },
      });
    });

    task.on(TaskEventType.STATE_EVENT, () => {
      send({
        type: 'org.umi.task.state',
        payload: {
          taskType: type,
          detail: taskManger.getTaskDetail(TaskType[type]),
        },
      });
    });
  });
}

function formatEnv(env: object): object {
  const res = {} as any;
  Object.keys(env).forEach(key => {
    if (typeof env[key] === 'boolean') {
      res[key] = env[key] ? '1' : 'none';
    } else {
      res[key] = env[key];
    }
  });
  return res;
}

export { subscribeTaskEvent, formatEnv };
