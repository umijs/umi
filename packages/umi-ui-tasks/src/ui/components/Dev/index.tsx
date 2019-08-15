import React, { useState } from 'react';
import { Row, Col, Button, Spin } from 'antd';
import { IUiApi } from 'umi-types';
import styles from '../../ui.module.less';
import { TaskType, TaskState } from '../../../server/core/enums';
import { exec, cancel, isCaredEvent, getTerminalIns, TriggerState } from '../../util';
import { useTaskDetail } from '../../hooks';
import Terminal from '../Terminal';

interface IProps {
  api: IUiApi;
  state?: TaskState;
}

const taskType = TaskType.DEV;

const DevComponent: React.FC<IProps> = ({ api }) => {
  const [taskDetail, setTaskDetail] = useState({ state: TaskState.INIT, type: taskType });
  const { loading } = useTaskDetail(taskType);

  api.listenRemote({
    type: 'org.umi.task.state',
    onMessage: ({ detail, taskType: type }) => {
      if (!isCaredEvent(type, taskType)) {
        return;
      }
      setTaskDetail(detail);
    },
  });

  if (loading) {
    return <Spin />;
  }

  async function dev() {
    const { triggerState, errMsg, result } = await exec(taskType);
    if (triggerState === TriggerState.FAIL) {
      api.notify({
        type: 'error',
        title: '执行启动失败',
        message: errMsg,
      });
      return;
    }
    setTaskDetail(result);
    const { state } = result;
    api.notify({
      type: state === TaskState.SUCCESS ? 'success' : 'error',
      title: state === TaskState.SUCCESS ? '启动成功' : '启动失败',
      message: '',
    });
  }

  async function cancelDev() {
    const { triggerState, errMsg, result } = await cancel(taskType);
    if (triggerState === TriggerState.FAIL) {
      api.notify({
        title: '取消启动失败',
        message: errMsg,
      });
      return;
    }
    setTaskDetail(result);
  }

  const isTaskRunning = taskDetail && taskDetail.state === TaskState.ING;
  return (
    <>
      <h1>本地开发</h1>
      <div className={styles.container}>
        <Row>
          <Col span={23} className={styles.actions}>
            <Button onClick={isTaskRunning ? cancelDev : dev} loading={loading}>
              {isTaskRunning ? '停止' : '启动'}
            </Button>
          </Col>
          <Col span={1}>
            <span className={styles.output}>输出</span>
          </Col>
        </Row>
        <Row>
          <Terminal terminal={getTerminalIns(taskType)} />
        </Row>
      </div>
    </>
  );
};

export default DevComponent;
