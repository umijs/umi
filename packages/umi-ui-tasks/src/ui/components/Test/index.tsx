import React, { useEffect, useState } from 'react';
import { Row, Col, Button } from 'antd';
import { CaretRightOutlined, PauseOutlined } from '@ant-design/icons';
import styles from '../../ui.module.less';
import { TaskState } from '../../../server/core/enums';
import { getTerminalRefIns, setTerminalRefIns } from '../../util';
import { TaskComponentProps } from '..';
import { useInit } from '../../hooks';

const TestComponent: React.FC<TaskComponentProps> = ({
  taskType,
  namespace,
  api,
  dispatch,
  detail = {},
  Terminal,
}) => {
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
        const terminal = getTerminalRefIns(taskType, api.currentProject.key);
        if (terminal) {
          terminal.clear();
        }
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
                  <PauseOutlined />
                  <span className={styles.runningText}>
                    {' '}
                    {intl({ id: 'org.umi.ui.tasks.test.cancel' })}
                  </span>
                </>
              ) : (
                <>
                  <CaretRightOutlined />
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
          <Terminal
            defaultValue={log}
            onInit={ins => {
              if (ins) {
                setTerminalRefIns(taskType, api.currentProject.key, ins);
              }
            }}
          />
        </div>
      </>
    </>
  );
};

export default TestComponent;
