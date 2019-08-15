import TaskManager from '../core/TaskManger';
import { TaskEventType, LogType, TaskType } from '../core/enums';

function subscribeTaskEvent(taskManger: TaskManager, send) {
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

export { subscribeTaskEvent };
