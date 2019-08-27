import React, { useState, useEffect } from 'react';
import { Row, Col, Button, Spin } from 'antd';
import { IUiApi } from 'umi-types';
import withSize from 'react-sizeme';
import styles from '../../ui.module.less';
import { TaskType, TaskState } from '../../../server/core/enums';
import { exec, cancel, isCaredEvent, getTerminalIns, TriggerState, clearLog } from '../../util';

import { useTaskDetail } from '../../hooks';
import Terminal from '../Terminal';

interface IProps {
  api: IUiApi;
  state?: TaskState;
}

const { SizeMe } = withSize;
const taskType = TaskType.INSTALL;

const InstallComponent: React.FC<IProps> = ({ api }) => {
  const { intl } = api;
  const [taskDetail, setTaskDetail] = useState({ state: TaskState.INIT, type: taskType, log: '' });
  const [loading, setLoading] = useState(true);

  // Mount: 获取 task detail
  const { loading: detailLoading, detail } = useTaskDetail(taskType);
  // Mount: 监听 task state 改变
  useEffect(
    () => {
      setLoading(detailLoading);
      setTaskDetail(detail as any);
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

  // UnMount: reset form
  useEffect(() => {
    return () => {
      const terminal = getTerminalIns(taskType);
      terminal && terminal.clear();
    };
  }, []);

  async function install() {
    const { triggerState, errMsg } = await exec(taskType, {
      NPM_CLIENT: api.currentProject.npmClient,
      TAOBAO_SPEED_UP: api.currentProject.taobaoSpeedUp,
    });
    if (triggerState === TriggerState.FAIL) {
      api.notify({
        type: 'error',
        title: intl('org.umi.ui.tasks.install.execError'),
        message: errMsg,
      });
    }
  }

  async function cancelInstall() {
    const { triggerState, errMsg } = await cancel(taskType);
    if (triggerState === TriggerState.FAIL) {
      api.notify({
        title: intl('org.umi.ui.tasks.install.cancelError'),
        message: errMsg,
      });
    }
  }

  const isTaskRunning = taskDetail && taskDetail.state === TaskState.ING;
  return (
    <>
      <h1 className={styles.title}>{intl('org.umi.ui.tasks.install')}</h1>
      {loading ? (
        <Spin />
      ) : (
        <>
          <Row>
            <Col span={8} className={styles.buttonGroup}>
              <Button
                type="primary"
                onClick={isTaskRunning ? cancelInstall : install}
                loading={loading}
              >
                {isTaskRunning
                  ? intl('org.umi.ui.tasks.install.cancel')
                  : intl('org.umi.ui.tasks.install.start')}
              </Button>
            </Col>
            {/* <Col span={4} offset={12} className={styles.formatGroup}>
              <Radio.Group defaultValue="log" buttonStyle="solid">
                <Radio.Button value="log">输出</Radio.Button>
              </Radio.Group>
            </Col> */}
          </Row>
          <div className={styles.logContainer}>
            <SizeMe monitorWidth monitorHeight>
              {({ size }) => (
                <Terminal
                  api={api}
                  size={size}
                  terminal={getTerminalIns(taskType)}
                  log={taskDetail.log}
                  onClear={() => {
                    clearLog(taskType);
                  }}
                />
              )}
            </SizeMe>
          </div>
        </>
      )}
    </>
  );
};

export default InstallComponent;
