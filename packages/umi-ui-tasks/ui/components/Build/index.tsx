import React, { useState, useEffect } from 'react';
import { Row, Col, Button, Modal, Form, Switch } from 'antd';
import { CaretRight, Pause } from '@ant-design/icons';
import { IUiApi } from 'umi-types';
import withSize from 'react-sizeme';
import styles from '../../ui.module.less';
import { TaskType, TaskState } from '@/src/server/core/enums';
import { exec, cancel, isCaredEvent, getTerminalIns, TriggerState, clearLog } from '../../util';
import { useTaskDetail } from '../../hooks';
import Terminal from '../Terminal';
import { ITaskDetail } from '@/server/core/types';

interface IProps {
  detail: ITaskDetail;
  api: IUiApi;
  state?: TaskState;
}

const { SizeMe } = withSize;
const taskType = TaskType.BUILD;

const BuildComponent: React.FC<IProps> = ({ api }) => {
  const { intl } = api;
  const isEnglish = api.getLocale() === 'en-US';
  const [taskDetail, setTaskDetail] = useState({ state: TaskState.INIT, type: taskType, log: '' });
  const [form] = Form.useForm();
  const [modalVisible, setModalVisible] = useState(false);
  const [env, setEnv] = useState({
    BABEL_CACHE: true,
    BABEL_POLYFILL: true,
    COMPRESS: true,
    CSS_COMPRESS: true,
    HTML: true,
    FORK_TS_CHECKER: false,
  });

  // Mount: 获取 task detail
  const { detail } = useTaskDetail(taskType);

  // Mount: 监听 task state 改变
  useEffect(
    () => {
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
      form.resetFields();
      const terminal = getTerminalIns(taskType);
      terminal && terminal.clear();
    };
  }, []);

  async function build() {
    const { triggerState, errMsg } = await exec(taskType, env);
    if (triggerState === TriggerState.FAIL) {
      api.notify({
        type: 'error',
        title: `${api.currentProject.name} ${intl({ id: 'org.umi.ui.tasks.build.buildError' })}`,
        message: errMsg,
      });
    }
  }

  async function cancelBuild() {
    const { triggerState, errMsg } = await cancel(taskType);
    if (triggerState === TriggerState.FAIL) {
      api.notify({
        title: `${api.currentProject.name} ${intl({ id: 'org.umi.ui.tasks.build.cancelError' })}`,
        message: errMsg,
      });
      return;
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

  const isTaskRunning = taskDetail && taskDetail.state === TaskState.ING;
  return (
    <>
      <h1 className={styles.title}>{intl({ id: 'org.umi.ui.tasks.build' })}</h1>
      <>
        <Row>
          <Col span={24} className={styles.buttonGroup}>
            <Button type="primary" onClick={isTaskRunning ? cancelBuild : build}>
              {isTaskRunning ? (
                <>
                  <Pause />
                  <span className={styles.runningText}>
                    {' '}
                    {intl({ id: 'org.umi.ui.tasks.build.cancel' })}
                  </span>
                </>
              ) : (
                <>
                  <CaretRight />
                  <span className={styles.runningText}>
                    {' '}
                    {intl({ id: 'org.umi.ui.tasks.build.start' })}
                  </span>
                </>
              )}
            </Button>
            <Button onClick={openModal}>{intl({ id: 'org.umi.ui.tasks.envs' })}</Button>
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
                        link="https://umijs.org/zh/guide/env-variables.html#compress"
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
                        link="https://umijs.org/zh/guide/env-variables.html#css-compress"
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
                        title="org.umi.ui.tasks.envs.html"
                        desc="org.umi.ui.tasks.envs.html.desc"
                        link="https://umijs.org/zh/guide/env-variables.html#html"
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

export default BuildComponent;
