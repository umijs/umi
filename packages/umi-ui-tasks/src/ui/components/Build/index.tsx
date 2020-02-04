import React, { useState, useEffect } from 'react';
import { Row, Col, Button, Modal, Form, Switch, Radio } from 'antd';
import { CaretRightOutlined, PauseOutlined } from '@ant-design/icons';
import styles from '../../ui.module.less';
import { TaskState } from '../../../server/core/enums';
import { getTerminalRefIns, setTerminalRefIns } from '../../util';
import { useInit } from '../../hooks';
import { TaskComponentProps } from '..';
import Analyze from '../Analyze';

const BuildComponent: React.FC<TaskComponentProps> = ({
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
    BABEL_CACHE: true,
    BABEL_POLYFILL: true,
    COMPRESS: true,
    CSS_COMPRESS: true,
    HTML: true,
    FORK_TS_CHECKER: false,
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
        build();
      }
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

  async function build() {
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

  async function cancelBuild() {
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
        setEnv(values as any);
        setModalVisible(false);
      })
      .catch(info => {
        setModalVisible(false);
      });
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

  const toggleView = e => {
    const { value } = e.target;
    setView(value);
  };

  const isTaskRunning = detail.state === TaskState.ING;
  const detailHost = `https://umijs.org/${isEnglish ? '' : 'zh'}`;
  return (
    <>
      <h1 className={styles.title}>{intl({ id: 'org.umi.ui.tasks.build' })}</h1>
      <>
        <Row type="flex" justify="space-between">
          <Col className={styles.buttonGroup}>
            <Button
              size={api.mini ? 'small' : 'default'}
              type="primary"
              onClick={isTaskRunning ? cancelBuild : build}
            >
              {isTaskRunning ? (
                <>
                  <PauseOutlined />
                  <span className={styles.runningText}>
                    {' '}
                    {intl({ id: 'org.umi.ui.tasks.build.cancel' })}
                  </span>
                </>
              ) : (
                <>
                  <CaretRightOutlined />
                  <span className={styles.runningText}>
                    {' '}
                    {intl({ id: 'org.umi.ui.tasks.build.start' })}
                  </span>
                </>
              )}
            </Button>
            <Button size={api.mini ? 'small' : 'default'} onClick={openModal}>
              {intl({ id: 'org.umi.ui.tasks.envs' })}
            </Button>
            <Modal
              visible={modalVisible}
              title={intl({ id: 'org.umi.ui.tasks.envs' })}
              onOk={handleOk}
              onCancel={handleCancel}
            >
              <div className={styles.modalContainer}>
                <Form name="buildEnv" form={form} initialValues={env} layout="vertical">
                  <Form.Item
                    label={
                      <EnvLabel
                        title="org.umi.ui.tasks.envs.compress"
                        desc="org.umi.ui.tasks.envs.compress.desc"
                        link={`${detailHost}/guide/env-variables.html#compress`}
                      />
                    }
                    name="COMPRESS"
                    valuePropName="checked"
                  >
                    <Switch size="small" />
                  </Form.Item>
                  <Form.Item
                    label={
                      <EnvLabel
                        title="org.umi.ui.tasks.envs.cssCompress"
                        desc="org.umi.ui.tasks.envs.cssCompress.desc"
                        link={`${detailHost}/guide/env-variables.html#css-compress`}
                      />
                    }
                    name="CSS_COMPRESS"
                    valuePropName="checked"
                  >
                    <Switch size="small" />
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
                        title="org.umi.ui.tasks.envs.html"
                        desc="org.umi.ui.tasks.envs.html.desc"
                        link={`${detailHost}/guide/env-variables.html#html`}
                      />
                    }
                    name="HTML"
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
                setTerminalRefIns(taskType, api.currentProject.key, ins);
              }}
              defaultValue={log}
            />
          ) : (
            <Analyze api={api} analyze={detail.analyze} />
          )}
        </div>
      </>
    </>
  );
};

export default BuildComponent;
