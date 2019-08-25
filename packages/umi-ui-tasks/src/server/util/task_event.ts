import TaskManager from '../core/TaskManger';
import { TaskEventType, LogType, TaskType } from '../core/enums';
import { formatLog } from '../util';

const LOG = {
  [TaskType.BUILD]: '',
  [TaskType.DEV]: '',
  [TaskType.LINT]: '',
  [TaskType.TEST]: '',
};

interface ISendLog {
  taskType: TaskType;
  eventType: string;
  log?: string;
  detail?: any;
}

const createLogSender = send => {
  return function sender({ taskType, log, eventType, detail }: ISendLog) {
    const logData = log ? formatLog(log) : '';
    // 发送日志
    send({
      type: eventType,
      payload: {
        taskType,
        data: logData,
        detail: detail || null,
      },
    });

    // 保存日志
    if (eventType !== 'org.umi.task.log') {
      return;
    }
    LOG[taskType] = `${LOG[taskType]}${logData}`;
  };
};

let init: boolean = false;
function subscribeTaskEvent(taskManger: TaskManager, send) {
  if (init) {
    return;
  }
  init = true;
  const sender = createLogSender(send);

  taskManger.getAllTasks().forEach(({ type, task }) => {
    task.on(TaskEventType.STD_OUT_DATA, data => {
      sender({
        eventType: 'org.umi.task.log',
        taskType: type as TaskType,
        log: data,
      });
    });
    task.on(TaskEventType.STD_ERR_DATA, data => {
      sender({
        eventType: 'org.umi.task.log',
        taskType: type as TaskType,
        log: data,
      });
    });

    task.on(TaskEventType.STATE_EVENT, () => {
      sender({
        eventType: 'org.umi.task.state',
        taskType: type as TaskType,
        detail: taskManger.getTaskDetail(TaskType[type]),
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

function getLog(taskType: TaskType) {
  return LOG[taskType] || '';
}

function clearLog(taskType: TaskType) {
  LOG[taskType] = '';
}

export { subscribeTaskEvent, formatEnv, getLog, clearLog };
