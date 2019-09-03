import React, { useState, useEffect } from 'react';
import { Row, Col, Button, Form, Switch, Input, Modal, Badge } from 'antd';
import { CaretRight, Pause } from '@ant-design/icons';
import { IUiApi } from 'umi-types';
import withSize from 'react-sizeme';
import styles from '../../ui.module.less';
import { TaskType, TaskState } from '@/src/server/core/enums';
import { exec, cancel, isCaredEvent, getTerminalIns, TriggerState, clearLog } from '../../util';
import { useTaskDetail } from '../../hooks';
import Terminal from '../Terminal';

interface IProps {
  api: IUiApi;
  state?: TaskState;
}

const { SizeMe } = withSize;
const taskType = TaskType.DEV;

const DevComponent: React.FC<IProps> = ({ api }) => {
  const { intl } = api;
  const isEnglish = api.getLocale() === 'en-US';
  const [taskDetail, setTaskDetail] = useState({ state: TaskState.INIT, type: taskType, log: '' });
  const [form] = Form.useForm();
  const [modalVisible, setModalVisible] = useState(false);
  const [env, setEnv] = useState({
    BABEL_POLYFILL: true,
    HMR: true,
    BABEL_CACHE: true,
    MOCK: true,
    BROWSER: true,
    CLEAR_CONSOLE: true,
    PORT: null,
    FORK_TS_CHECKER: false,
  });

  // Mount: 获取 task detail
  const { detail } = useTaskDetail(taskType);
  useEffect(
    () => {
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
  // UnMount: reset form
  useEffect(() => {
    return () => {
      form.resetFields();
      const terminal = getTerminalIns(taskType);
      terminal && terminal.clear();
    };
  }, []);

  async function dev() {
    const { triggerState, errMsg } = await exec(taskType, env);
    if (triggerState === TriggerState.FAIL) {
      api.notify({
        type: 'error',
        title: intl({ id: 'org.umi.ui.tasks.dev.startError' }),
        message: errMsg,
      });
    }
  }

  async function cancelDev() {
    const { triggerState, errMsg } = await cancel(taskType);
    if (triggerState === TriggerState.FAIL) {
      api.notify({
        title: intl({ id: 'org.umi.ui.tasks.dev.cancelError' }),
        message: errMsg,
      });
    }
  }

  const openModal = () => {
    setModalVisible(true);
  };

  const handleOk = () => {
    form
      .validateFields()
      .then(values => {
        setEnv(values as any);
        setModalVisible(false);
      })
      .catch(_ => {});
  };

  const handleCancel = () => {
    setModalVisible(false);
  };

  const stopEventPop = e => {
    e && e.stopPropagation();
    e && e.preventDefault();
  };
  const EnvLabel = props => (
    <div>
      <div onClick={stopEventPop} className={styles.modleLableTitle}>
        {intl({ id: props.title })}
      </div>
      <div className={styles.modleLableDesc}>
        <span onClick={stopEventPop}>{intl({ id: props.desc })}</span>
        <a
          className={styles.modleLablelDescIcon}
          href={isEnglish ? props.link.replace(/\/zh\//, '/') : props.link}
          target="_blank"
        >
          {intl({ id: 'org.umi.ui.tasks.env.detail' })}
        </a>
      </div>
    </div>
  );

  const isTaskRunning =
    taskDetail && [TaskState.ING, TaskState.SUCCESS].indexOf(taskDetail.state) > -1;
  const outputRunningInfo = ({ state, localUrl }) => {
    if (!state || state === TaskState.INIT) {
      return null;
    }
    const map = {
      [TaskState.ING]: {
        status: 'processing',
        text: <span>{intl({ id: 'org.umi.ui.tasks.dev.state.starting' })}</span>,
      },
      [TaskState.SUCCESS]: {
        status: 'success',
        text: (
          <span>
            {localUrl ? (
              <>
                {intl({ id: 'org.umi.ui.tasks.dev.state.success' })}
                <a href={localUrl} target="_blank">
                  {localUrl}
                </a>
              </>
            ) : null}
          </span>
        ),
      },
      [TaskState.FAIL]: {
        status: 'error',
        text: <span>{intl({ id: 'org.umi.ui.tasks.dev.state.fail' })}</span>,
      },
    };
    return (
      <div className={styles.runningInfo}>
        <Badge status={map[state].status} />
        <span>{map[state].text}</span>
      </div>
    );
  };
  return (
    <>
      <h1 className={styles.title}>{intl({ id: 'org.umi.ui.tasks.dev' })}</h1>
      <>
        <Row>
          <Col span={24} className={styles.buttonGroup}>
            <Button type="primary" onClick={isTaskRunning ? cancelDev : dev}>
              {isTaskRunning ? (
                <>
                  <Pause />
                  <span className={styles.runningText}>
                    {' '}
                    {intl({ id: 'org.umi.ui.tasks.dev.cancel' })}
                  </span>
                </>
              ) : (
                <>
                  <CaretRight />
                  <span className={styles.runningText}>
                    {' '}
                    {intl({ id: 'org.umi.ui.tasks.dev.start' })}
                  </span>
                </>
              )}
            </Button>
            <Button onClick={openModal}>{intl({ id: 'org.umi.ui.tasks.envs' })}</Button>
            {outputRunningInfo(taskDetail)}
            <Modal
              visible={modalVisible}
              title={intl({ id: 'org.umi.ui.tasks.envs' })}
              onOk={handleOk}
              onCancel={handleCancel}
            >
              <div className={styles.modalContainer}>
                <Form name="devEnv" form={form} initialValues={env} layout="vertical">
                  <Form.Item label={intl({ id: 'org.umi.ui.tasks.envs.port' })} name="PORT">
                    <Input />
                  </Form.Item>
                  <Form.Item
                    label={
                      <EnvLabel
                        title="org.umi.ui.tasks.envs.babelPolyfill"
                        desc="org.umi.ui.tasks.envs.babelPolyfill.desc"
                        link="https://umijs.org/zh/guide/env-variables.html#babel-polyfill"
                      />
                    }
                    name="BABEL_POLYFILL"
                    valuePropName="checked"
                  >
                    <Switch size="small" />
                  </Form.Item>
                  <Form.Item
                    label={
                      <EnvLabel
                        title="org.umi.ui.tasks.envs.hmr"
                        desc="org.umi.ui.tasks.envs.hmr.desc"
                        link="https://umijs.org/zh/guide/env-variables.html#hmr"
                      />
                    }
                    name="HMR"
                    valuePropName="checked"
                  >
                    <Switch size="small" />
                  </Form.Item>
                  <Form.Item
                    label={
                      <EnvLabel
                        title="org.umi.ui.tasks.envs.babelCache"
                        desc="org.umi.ui.tasks.envs.babelCache.desc"
                        link="https://umijs.org/zh/guide/env-variables.html#babel-cache"
                      />
                    }
                    name="BABEL_CACHE"
                    valuePropName="checked"
                  >
                    <Switch size="small" />
                  </Form.Item>
                  <Form.Item
                    label={
                      <EnvLabel
                        title="org.umi.ui.tasks.envs.mock"
                        desc="org.umi.ui.tasks.envs.mock.desc"
                        link="https://umijs.org/zh/guide/env-variables.html#mock"
                      />
                    }
                    name="MOCK"
                    valuePropName="checked"
                  >
                    <Switch size="small" />
                  </Form.Item>
                  <Form.Item
                    label={
                      <EnvLabel
                        title="org.umi.ui.tasks.envs.BROWSER"
                        desc="org.umi.ui.tasks.envs.BROWSER.desc"
                        link="https://umijs.org/zh/guide/env-variables.html#browser"
                      />
                    }
                    name="BROWSER"
                    valuePropName="checked"
                  >
                    <Switch size="small" />
                  </Form.Item>
                  <Form.Item
                    label={
                      <EnvLabel
                        title="org.umi.ui.tasks.envs.clear"
                        desc="org.umi.ui.tasks.envs.clear.desc"
                        link="https://umijs.org/zh/guide/env-variables.html#clear-console"
                      />
                    }
                    name="CLEAR_CONSOLE"
                    valuePropName="checked"
                  >
                    <Switch size="small" />
                  </Form.Item>
                  <Form.Item
                    label={
                      <EnvLabel
                        title="org.umi.ui.tasks.envs.tsCheck"
                        desc="org.umi.ui.tasks.envs.tsCheck.desc"
                        link="https://umijs.org/zh/guide/env-variables.html#fork-ts-checker"
                      />
                    }
                    name="FORK_TS_CHECKER"
                    valuePropName="checked"
                  >
                    <Switch size="small" />
                  </Form.Item>
                </Form>
              </div>
            </Modal>
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
    </>
  );
};

export default DevComponent;
