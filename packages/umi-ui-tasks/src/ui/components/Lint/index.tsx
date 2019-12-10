import React, { useEffect, useState } from 'react';
import { Row, Col, Button } from 'antd';
import { CaretRightOutlined, PauseOutlined } from '@ant-design/icons';
import styles from '../../ui.module.less';
import { TaskState } from '../../../server/core/enums';
import { getTerminalRefIns, setTerminalRefIns } from '../../util';
import { TaskComponentProps } from '../index';
import { useInit } from '../../hooks';

const LintComponent: React.FC<TaskComponentProps> = ({
  taskType,
  namespace,
  api,
  detail = {},
  dispatch,
  iife,
  Terminal,
}) => {
  const { intl } = api;
  const [log, setLog] = useState('');
  const [init] = useInit(detail);

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
      if (iife) {
        lint();
      }
      return () => {
        const terminal = getTerminalRefIns(taskType, api.currentProject.key);
        if (terminal) {
          terminal.clear();
        }
      };
    },
    [init, iife],
  );

  async function lint() {
    dispatch({
      type: `${namespace}/exec`,
      payload: {
        taskType,
      },
    });
  }

  async function cancelLint() {
    dispatch({
      type: `${namespace}/cancel`,
      payload: {
        taskType,
      },
    });
  }

  const isTaskRunning = detail && detail.state === TaskState.ING;
  return (
    <>
      <h1 className={styles.title}>{intl({ id: 'org.umi.ui.tasks.lint' })}</h1>
      <>
        <Row>
          <Col span={24} className={styles.buttonGroup}>
            <Button
              size={api.mini ? 'small' : 'default'}
              type="primary"
              onClick={isTaskRunning ? cancelLint : lint}
            >
              {isTaskRunning ? (
                <>
                  <PauseOutlined />
                  <span className={styles.runningText}>
                    {' '}
                    {intl({ id: 'org.umi.ui.tasks.lint.cancel' })}
                  </span>
                </>
              ) : (
                <>
                  <CaretRightOutlined />
                  <span className={styles.runningText}>
                    {' '}
                    {intl({ id: 'org.umi.ui.tasks.lint.start' })}
                  </span>
                </>
              )}
            </Button>
          </Col>
          {/* <Col span={4} offset={12} className={styles.formatGroup}>
            <Radio.Group defaultValue="log" buttonStyle="solid">
              <Radio.Button value="log">输出</Radio.Button>
            </Radio.Group>
          </Col> */}
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
          )}
        </div>
      </>
    </>
  );
};

export default LintComponent;
