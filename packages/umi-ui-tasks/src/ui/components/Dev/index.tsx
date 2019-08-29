import React, { useState, useEffect } from 'react';
import { Row, Col, Button, Spin, Form, Switch, Input, Modal } from 'antd';
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
const taskType = TaskType.DEV;

const DevComponent: React.FC<IProps> = ({ api }) => {
  const { intl } = api;
  const [taskDetail, setTaskDetail] = useState({ state: TaskState.INIT, type: taskType, log: '' });
  const [loading, setLoading] = useState(true);
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
  const { loading: detailLoading, detail } = useTaskDetail(taskType);
  useEffect(
    () => {
      setLoading(detailLoading);
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
        title: intl('org.umi.ui.tasks.dev.startError'),
        message: errMsg,
      });
    }
  }

  async function cancelDev() {
    const { triggerState, errMsg } = await cancel(taskType);
    if (triggerState === TriggerState.FAIL) {
      api.notify({
        title: intl('org.umi.ui.tasks.dev.cancelError'),
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

  const EnvLabel = props => (
    <div>
      <div className={styles.modleLableTitle}>{intl(props.title)}</div>
      <div className={styles.modleLableDesc}>{intl(props.desc)}</div>
    </div>
  );

  const isTaskRunning = taskDetail && taskDetail.state === TaskState.ING;
  return (
    <>
      <h1 className={styles.title}>{intl('org.umi.ui.tasks.dev')}</h1>
      {loading ? (
        <Spin />
      ) : (
        <>
          <Row>
            <Col span={8} className={styles.buttonGroup}>
              <Button type="primary" onClick={isTaskRunning ? cancelDev : dev} loading={loading}>
                {isTaskRunning
                  ? intl('org.umi.ui.tasks.dev.cancel')
                  : intl('org.umi.ui.tasks.dev.start')}
              </Button>
              <Button onClick={openModal}>{intl('org.umi.ui.tasks.envs')}</Button>
              <Modal
                visible={modalVisible}
                title={intl('org.umi.ui.tasks.envs')}
                onOk={handleOk}
                onCancel={handleCancel}
              >
                <div className={styles.modalContainer}>
                  <Form name="devEnv" form={form} initialValues={env} layout="vertical">
                    <Form.Item label={intl('org.umi.ui.tasks.envs.port')} name="PORT">
                      <Input />
                    </Form.Item>
                    <Form.Item
                      label={
                        <EnvLabel
                          title="org.umi.ui.tasks.envs.babelPolyfill"
                          desc="org.umi.ui.tasks.envs.babelPolyfill.desc"
                        />
                      }
                      name="BABEL_POLYFILL"
                      valuePropName="checked"
                    >
                      <Switch />
                    </Form.Item>
                    <Form.Item
                      label={
                        <EnvLabel
                          title="org.umi.ui.tasks.envs.hmr"
                          desc="org.umi.ui.tasks.envs.hmr.desc"
                        />
                      }
                      name="HMR"
                      valuePropName="checked"
                    >
                      <Switch />
                    </Form.Item>
                    <Form.Item
                      label={
                        <EnvLabel
                          title="org.umi.ui.tasks.envs.babelCache"
                          desc="org.umi.ui.tasks.envs.babelCache.desc"
                        />
                      }
                      name="BABEL_CACHE"
                      valuePropName="checked"
                    >
                      <Switch />
                    </Form.Item>
                    <Form.Item
                      label={
                        <EnvLabel
                          title="org.umi.ui.tasks.envs.mock"
                          desc="org.umi.ui.tasks.envs.mock.desc"
                        />
                      }
                      name="MOCK"
                      valuePropName="checked"
                    >
                      <Switch />
                    </Form.Item>
                    <Form.Item
                      label={
                        <EnvLabel
                          title="org.umi.ui.tasks.envs.BROWSER"
                          desc="org.umi.ui.tasks.envs.BROWSER.desc"
                        />
                      }
                      name="BROWSER"
                      valuePropName="checked"
                    >
                      <Switch />
                    </Form.Item>
                    <Form.Item
                      label={
                        <EnvLabel
                          title="org.umi.ui.tasks.envs.clear"
                          desc="org.umi.ui.tasks.envs.clear.desc"
                        />
                      }
                      name="CLEAR_CONSOLE"
                      valuePropName="checked"
                    >
                      <Switch />
                    </Form.Item>
                    <Form.Item
                      label={
                        <EnvLabel
                          title="org.umi.ui.tasks.envs.tsCheck"
                          desc="org.umi.ui.tasks.envs.tsCheck.desc"
                        />
                      }
                      name="FORK_TS_CHECKER"
                      valuePropName="checked"
                    >
                      <Switch />
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
      )}
    </>
  );
};

export default DevComponent;
