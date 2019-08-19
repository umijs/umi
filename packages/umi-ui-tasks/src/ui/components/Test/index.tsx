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

const taskType = TaskType.TEST;

const TestComponent: React.FC<IProps> = ({ api }) => {
  const [taskDetail, setTaskDetail] = useState({ state: TaskState.INIT, type: taskType });
  const [loading, setLoading] = useState(true);

  // Mount: 获取 task detail
  const { loading: detailLoading, detail } = useTaskDetail(taskType);
  useEffect(
    () => {
      setLoading(detailLoading);
      setTaskDetail(detail as any);
    },
    [detail],
  );

  // Mount: 监听 task state 改变
  useEffect(
    () => {
      const unsubscribe = api.listenRemote({
        type: 'org.umi.task.state',
        onMessage: ({ detail: result, taskType: type }) => {
          if (!isCaredEvent(type, taskType)) {
            return null;
          }
          if (result) {
            setTaskDetail(result);
          }
        },
      });
      return () => {
        unsubscribe && unsubscribe();
      };
    },
    [detail],
  );

  async function test() {
    const { triggerState, errMsg } = await exec(taskType);
    if (triggerState === TriggerState.FAIL) {
      api.notify({
        type: 'error',
        title: '执行测试失败',
        message: errMsg,
      });
    }
  }

  async function cancelTest() {
    const { triggerState, errMsg, result } = await cancel(taskType);
    if (triggerState === TriggerState.FAIL) {
      api.notify({
        title: '取消测试失败',
        message: errMsg,
      });
      return;
    }
  }

  const isTaskRunning = taskDetail && taskDetail.state === TaskState.ING;
  return (
    <>
      {loading ? (
        <Spin />
      ) : (
        <>
          <Row>
            <Col span={8} className={styles.buttonGroup}>
              <Button type="primary" onClick={isTaskRunning ? cancelTest : test} loading={loading}>
                {isTaskRunning ? '停止' : '测试'}
              </Button>
            </Col>
          </Row>
          <div className={styles.logContainer}>
            <Terminal terminal={getTerminalIns(taskType)} />
          </div>
        </>
      )}
    </>
  );
};

export default TestComponent;
