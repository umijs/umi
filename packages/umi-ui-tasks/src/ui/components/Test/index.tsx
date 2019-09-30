import React, { useEffect, useState } from 'react';
import { Row, Col, Button } from 'antd';
import { CaretRight, Pause } from '@ant-design/icons';
import { IUiApi } from 'umi-types';
import withSize from 'react-sizeme';
import styles from '../../ui.module.less';
import { TaskType, TaskState } from '../../../server/core/enums';
import { getTerminalIns, clearLog } from '../../util';
import Terminal from '../Terminal';
import { ITaskDetail } from '../../../server/core/types';
import { namespace } from '../../model';
import { useInit } from '../../hooks';

interface IProps {
  api: IUiApi;
  detail: ITaskDetail;
  dispatch: any;
}

const { SizeMe } = withSize;
const taskType = TaskType.TEST;

const TestComponent: React.FC<IProps> = ({ api, dispatch, detail = {} }) => {
  const { intl } = api;
  const [log, setLog] = useState('');
  const [init] = useInit(detail);

  // UnMount: reset form
  useEffect(
    () => {
      if (!init) {
        return () => {};
      }
      dispatch({
        type: `${namespace}/getTaskDetail`,
        payload: {
          taskType,
          callback: ({ log }) => {
            setLog(log);
          },
        },
      });
      return () => {
        const terminal = getTerminalIns(taskType);
        terminal && terminal.clear();
      };
    },
    [init],
  );

  async function test() {
    dispatch({
      type: `${namespace}/exec`,
      payload: {
        taskType,
      },
    });
  }

  async function cancelTest() {
    dispatch({
      type: `${namespace}/exec`,
      payload: {
        taskType,
      },
    });
  }

  const isTaskRunning = detail && detail.state === TaskState.ING;
  return (
    <>
      <h1 className={styles.title}>{intl({ id: 'org.umi.ui.tasks.test' })}</h1>
      <>
        <Row>
          <Col span={24} className={styles.buttonGroup}>
            <Button
              size={api.mini ? 'small' : 'default'}
              type="primary"
              onClick={isTaskRunning ? cancelTest : test}
            >
              {isTaskRunning ? (
                <>
                  <Pause />
                  <span className={styles.runningText}>
                    {' '}
                    {intl({ id: 'org.umi.ui.tasks.test.cancel' })}
                  </span>
                </>
              ) : (
                <>
                  <CaretRight />
                  <span className={styles.runningText}>
                    {' '}
                    {intl({ id: 'org.umi.ui.tasks.test.start' })}
                  </span>
                </>
              )}
            </Button>
          </Col>
        </Row>
        <div className={styles.logContainer}>
          <SizeMe monitorWidth monitorHeight>
            {({ size }) => (
              <Terminal
                api={api}
                size={size}
                terminal={getTerminalIns(taskType)}
                log={log}
                onClear={() => {
                  clearLog(taskType);
                }}
              />
            )}
          </SizeMe>
        </div>
      </>
    </>
  );
};

export default TestComponent;
