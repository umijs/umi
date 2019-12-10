import React, { useEffect, useState } from 'react';
import { Row, Col, Button } from 'antd';
import { CaretRightOutlined, PauseOutlined } from '@ant-design/icons';
import { IUiApi } from 'umi-types';
import styles from '../../ui.module.less';
import { TaskType, TaskState } from '../../../server/core/enums';
import { getTerminalRefIns, setTerminalRefIns } from '../../util';
import { namespace } from '../../model';
import { ITaskDetail } from '../../../server/core/types';
import { useInit } from '../../hooks';

interface IProps {
  api: IUiApi;
  detail: ITaskDetail;
  dispatch: any;
}

const taskType = TaskType.LINT;

const LintComponent: React.FC<IProps> = ({ api, detail = {}, dispatch, iife }) => {
  const { intl, Terminal } = api;
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
