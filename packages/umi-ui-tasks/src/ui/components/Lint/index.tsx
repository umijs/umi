import React, { useEffect, useState } from 'react';
import { Row, Col, Button } from 'antd';
import { CaretRight, Pause } from '@ant-design/icons';
import { IUiApi } from 'umi-types';
import withSize from 'react-sizeme';
import styles from '../../ui.module.less';
import { TaskType, TaskState } from '../../../server/core/enums';
import { getTerminalIns, clearLog } from '../../util';
import Terminal from '../Terminal';
import { namespace } from '../../model';
import { ITaskDetail } from '../../../server/core/types';
import { useInit } from '../../hooks';

interface IProps {
  api: IUiApi;
  detail: ITaskDetail;
  dispatch: any;
}

const { SizeMe } = withSize;
const taskType = TaskType.LINT;

const LintComponent: React.FC<IProps> = ({ api, detail = {}, dispatch }) => {
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
      return () => {
        const terminal = getTerminalIns(taskType);
        terminal && terminal.clear();
      };
    },
    [init],
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
                  <Pause />
                  <span className={styles.runningText}>
                    {' '}
                    {intl({ id: 'org.umi.ui.tasks.lint.cancel' })}
                  </span>
                </>
              ) : (
                <>
                  <CaretRight />
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

export default LintComponent;
