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

const taskType = TaskType.LINT;

const LintComponent: React.FC<IProps> = ({ api }) => {
  const [taskDetail, setTaskDetail] = useState({ state: TaskState.INIT, type: taskType });
  const { loading } = useTaskDetail(taskType);

  api.listenRemote({
    type: 'org.umi.task.state',
    onMessage: ({ detail, taskType: type }) => {
      if (!isCaredEvent(type, taskType)) {
        return;
      }
      setTaskDetail(detail);
      const { state } = detail;
      api.notify({
        type: state === TaskState.SUCCESS ? 'success' : 'error',
        title: state === TaskState.SUCCESS ? 'Lint 成功' : 'Lint 失败',
        message: '',
      });
    },
  });

  if (loading) {
    return <Spin />;
  }

  async function lint() {
    const { triggerState, errMsg, result } = await exec(taskType);
    if (triggerState === TriggerState.FAIL) {
      api.notify({
        type: 'error',
        title: '执行 Lint 失败',
        message: errMsg,
      });
      return;
    }
    setTaskDetail(result);
    const { state } = result;
    api.notify({
      type: state === TaskState.SUCCESS ? 'success' : 'error',
      title: state === TaskState.SUCCESS ? 'Lint 成功' : 'Lint 失败',
      message: '',
    });
  }

  async function cancelLint() {
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
      <h1>代码风格校验</h1>
      <div className={styles.container}>
        <Row>
          <Col span={23} className={styles.actions}>
            <Button onClick={isTaskRunning ? cancelLint : lint} loading={loading}>
              {isTaskRunning ? '停止' : 'LINT'}
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

export default LintComponent;
