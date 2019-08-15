import React, { useState, useEffect } from 'react';
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

const taskType = TaskType.BUILD;

const BuildComponent: React.FC<IProps> = ({ api }) => {
  const [taskDetail, setTaskDetail] = useState({ state: TaskState.INIT, type: taskType });
  const [loading, setLoading] = useState(true);
  const { loading: detailLoading, detail } = useTaskDetail(taskType);

  useEffect(
    () => {
      setLoading(detailLoading);
      setTaskDetail(detail as any);
    },
    [detail],
  );

  api.listenRemote({
    type: 'org.umi.task.state',
    onMessage: ({ detail: result, taskType: type }) => {
      if (!isCaredEvent(type, taskType)) {
        return;
      }
      const { state } = result;
      api.notify({
        type: state === TaskState.SUCCESS ? 'success' : 'error',
        title: state === TaskState.SUCCESS ? '构建成功' : '构建失败',
        message: '',
      });
      setTaskDetail(result);
    },
  });

  if (loading) {
    return <Spin />;
  }

  async function build() {
    const { triggerState, errMsg, result } = await exec(taskType);
    if (triggerState === TriggerState.FAIL) {
      api.notify({
        type: 'error',
        title: '执行构建失败',
        message: errMsg,
      });
      return;
    }
    setTaskDetail(result);
  }

  async function cancelBuild() {
    const { triggerState, errMsg, result } = await exec(taskType);
    if (triggerState === TriggerState.FAIL) {
      api.notify({
        title: '取消构建失败',
        message: errMsg,
      });
      return;
    }
    setTaskDetail(result);
  }

  const isTaskRunning = taskDetail && taskDetail.state === TaskState.ING;

  return (
    <>
      <h1>构建插件</h1>
      <div className={styles.container}>
        <Row>
          <Col span={23} className={styles.actions}>
            <Button onClick={isTaskRunning ? cancelBuild : build} loading={loading}>
              {isTaskRunning ? '停止' : '构建'}
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

export default BuildComponent;
