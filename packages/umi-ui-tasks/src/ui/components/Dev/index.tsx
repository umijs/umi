import React, { useState, useEffect } from 'react';
import { Row, Col, Button, Form, Switch, Input, Modal, Badge, Radio } from 'antd';
import { CaretRightOutlined, PauseOutlined } from '@ant-design/icons';
import styles from '../../ui.module.less';
import { TaskState } from '../../../server/core/enums';
import { getTerminalRefIns, setTerminalRefIns } from '../../util';
import { useInit } from '../../hooks';
import { TaskComponentProps } from '..';
import Analyze from '../Analyze';

const DevComponent: React.FC<TaskComponentProps> = ({
  taskType,
  namespace,
  api,
  detail = {},
  dispatch,
  dbPath,
  iife,
  Terminal,
}) => {
  const { intl } = api;
  const isEnglish = api.getLocale() === 'en-US';
  const [form] = Form.useForm();
  const [modalVisible, setModalVisible] = useState(false);
  const [log, setLog] = useState('');
  const [view, setView] = useState('log');
  const [env, setEnv] = useState({
    UMI_UI_SERVER: 'none',
    UMI_UI_PORT: window.location.port,
    BABEL_POLYFILL: true,
    HMR: true,
    BABEL_CACHE: true,
    MOCK: true,
    BROWSER: true,
    CLEAR_CONSOLE: true,
    PORT: null,
    FORK_TS_CHECKER: false,
    UMI_UI: null,
  });
  const [init] = useInit(detail);

  useEffect(
    () => {
      if (!init) {
        return () => {};
      }
      if (view === 'log') {
        dispatch({
          type: `${namespace}/getTaskDetail`,
          payload: {
            taskType,
            log: true,
            dbPath,
            callback: ({ log }) => {
              setLog(log);
            },
          },
        });
      }
      if (iife) {
        dev();
      }
      // UnMount: reset form
      return () => {
        form.resetFields();
        const terminal = getTerminalRefIns(taskType, api.currentProject.key);
        if (terminal) {
          terminal.clear();
        }
      };
    },
    [init, view, iife],
  );

  async function dev() {
    dispatch({
      type: `${namespace}/exec`,
      payload: {
        taskType,
        args: {
          analyze: true,
          dbPath,
        },
        env,
      },
    });
  }

  async function cancelDev() {
    dispatch({
      type: `${namespace}/cancel`,
      payload: {
        taskType,
      },
    });
  }

  const openModal = () => {
    setModalVisible(true);
  };

  const handleOk = () => {
    form
      .validateFields()
      .then(values => {
        setEnv({
          ...env,
          ...(values as any),
        });
        setModalVisible(false);
      })
      .catch(_ => {});
  };

  const handleCancel = () => {
    setModalVisible(false);
  };

  const toggleView = e => {
    const { value } = e.target;
    setView(value);
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

  const isTaskRunning = detail && [TaskState.ING, TaskState.SUCCESS].indexOf(detail.state) > -1;
  const outputRunningInfo = ({ state, localUrl, hasError }) => {
    if (!state || state === TaskState.INIT) {
      return null;
    }
    const map = {
      [TaskState.ING]: {
        status: 'processing',
        text: (
          <span>
            {intl({
              id: hasError
                ? 'org.umi.ui.tasks.dev.state.starting.error'
                : 'org.umi.ui.tasks.dev.state.starting',
            })}
          </span>
        ),
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

  const detailHost = `https://umijs.org/${isEnglish ? '' : 'zh'}`;
  return (
    <>
      <h1 className={styles.title}>{intl({ id: 'org.umi.ui.tasks.dev' })}</h1>
      <>
        <Row type="flex" justify="space-between">
          <Col className={styles.buttonGroup}>
            <Button
              size={api.mini ? 'small' : 'default'}
              type="primary"
              onClick={isTaskRunning ? cancelDev : dev}
            >
              {isTaskRunning ? (
                <>
                  <PauseOutlined />
                  <span className={styles.runningText}>
                    {' '}
                    {intl({ id: 'org.umi.ui.tasks.dev.cancel' })}
                  </span>
                </>
              ) : (
                <>
                  <CaretRightOutlined />
                  <span className={styles.runningText}>
                    {' '}
                    {intl({ id: 'org.umi.ui.tasks.dev.start' })}
                  </span>
                </>
              )}
            </Button>
            <Button size={api.mini ? 'small' : 'default'} onClick={openModal}>
              {intl({ id: 'org.umi.ui.tasks.envs' })}
            </Button>
            {outputRunningInfo(detail)}
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
                        link={`${detailHost}/guide/env-variables.html#babel-polyfill`}
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
                        link={`${detailHost}/guide/env-variables.html#hmr`}
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
                        link={`${detailHost}/guide/env-variables.html#babel-cache`}
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
                        link={`${detailHost}/guide/env-variables.html#mock`}
                      />
                    }
                    name="MOCK"
                    valuePropName="checked"
                  >
                    <Switch size="small" />
                  </Form.Item>
                  {window.g_bigfish ? null : (
                    <Form.Item
                      label={
                        <EnvLabel
                          title="org.umi.ui.tasks.envs.BROWSER"
                          desc="org.umi.ui.tasks.envs.BROWSER.desc"
                          link={`${detailHost}/guide/env-variables.html#browser`}
                        />
                      }
                      name="BROWSER"
                      valuePropName="checked"
                    >
                      <Switch size="small" />
                    </Form.Item>
                  )}
                  <Form.Item
                    label={
                      <EnvLabel
                        title="org.umi.ui.tasks.envs.clear"
                        desc="org.umi.ui.tasks.envs.clear.desc"
                        link={`${detailHost}/guide/env-variables.html#clear-console`}
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
                        link={`${detailHost}/guide/env-variables.html#fork-ts-checker`}
                      />
                    }
                    name="FORK_TS_CHECKER"
                    valuePropName="checked"
                  >
                    <Switch size="small" />
                  </Form.Item>
                  <Form.Item
                    label={
                      <EnvLabel
                        title="org.umi.ui.tasks.envs.umiUI"
                        desc="org.umi.ui.tasks.envs.umiUI.desc"
                        link={`${detailHost}/guide/env-variables.html#umi-ui`}
                      />
                    }
                    name="UMI_UI"
                    valuePropName="checked"
                  >
                    <Switch size="small" />
                  </Form.Item>
                </Form>
              </div>
            </Modal>
          </Col>
          <Col className={styles.formatGroup}>
            <Radio.Group
              size={api.mini ? 'small' : 'default'}
              defaultValue="log"
              value={view}
              buttonStyle="solid"
              onChange={toggleView}
            >
              <Radio.Button value="log">{intl({ id: 'org.umi.ui.tasks.log' })}</Radio.Button>
              <Radio.Button value="analyze">
                {intl({ id: 'org.umi.ui.tasks.analyze' })}
              </Radio.Button>
            </Radio.Group>
          </Col>
        </Row>
        <div className={styles.logContainer}>
          {view === 'log' ? (
            <Terminal
              onInit={ins => {
                if (ins) {
                  setTerminalRefIns(taskType, api.currentProject.key, ins);
                }
              }}
              defaultValue={log}
            />
          ) : (
            <Analyze
              api={api}
              src={
                detail.analyzePort
                  ? `http://${window.location.hostname}:${detail.analyzePort}`
                  : null
              }
            />
          )}
        </div>
      </>
    </>
  );
};

export default DevComponent;
