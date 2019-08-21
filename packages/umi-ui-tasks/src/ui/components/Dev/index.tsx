import React, { useState, useEffect } from 'react';
import { Row, Col, Button, Spin, Radio, Form, Switch, Input, Modal } from 'antd';
import { IUiApi } from 'umi-types';
import styles from '../../ui.module.less';
import { TaskType, TaskState } from '../../../server/core/enums';
import { exec, cancel, isCaredEvent, getTerminalIns, TriggerState, clearLog } from '../../util';
import { useTaskDetail } from '../../hooks';
import Terminal from '../Terminal';

interface IProps {
  api: IUiApi;
  state?: TaskState;
}

const taskType = TaskType.DEV;

const DevComponent: React.FC<IProps> = ({ api }) => {
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

  async function dev() {
    const { triggerState, errMsg } = await exec(taskType, env);
    if (triggerState === TriggerState.FAIL) {
      api.notify({
        type: 'error',
        title: '执行启动失败',
        message: errMsg,
      });
    }
  }

  async function cancelDev() {
    const { triggerState, errMsg } = await cancel(taskType);
    if (triggerState === TriggerState.FAIL) {
      api.notify({
        title: '取消启动失败',
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

  const isTaskRunning = taskDetail && taskDetail.state === TaskState.ING;
  return (
    <>
      <h1 className={styles.title}>本地启动</h1>
      {loading ? (
        <Spin />
      ) : (
        <>
          <Row>
            <Col span={8} className={styles.buttonGroup}>
              <Button type="primary" onClick={isTaskRunning ? cancelDev : dev} loading={loading}>
                {isTaskRunning ? '停止' : '启动'}
              </Button>
              <Button onClick={openModal}>变量管理</Button>
              <Modal
                visible={modalVisible}
                title="构建环境变量"
                onOk={handleOk}
                onCancel={handleCancel}
              >
                <Form name="devEnv" form={form} initialValues={env} layout="vertical">
                  <Form.Item label="端口号" name="PORT">
                    <Input />
                  </Form.Item>
                  <Form.Item
                    label="是否引入 @babel/polyfill"
                    name="BABEL_POLYFILL"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                  <Form.Item label="是否开启热更新" name="HMR" valuePropName="checked">
                    <Switch />
                  </Form.Item>
                  <Form.Item
                    label="是否开启 babel cache"
                    name="BABEL_CACHE"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                  <Form.Item label="是否开启 mock" name="MOCK" valuePropName="checked">
                    <Switch />
                  </Form.Item>
                  <Form.Item
                    label="是否启动后自动打开浏览器"
                    name="BROWSER"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                  <Form.Item label="是否清屏" name="CLEAR_CONSOLE" valuePropName="checked">
                    <Switch />
                  </Form.Item>
                  <Form.Item
                    label="是否开启 TS 检查"
                    name="FORK_TS_CHECKER"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Form>
              </Modal>
            </Col>
            {/* <Col span={4} offset={12} className={styles.formatGroup}>
              <Radio.Group defaultValue="log" buttonStyle="solid">
                <Radio.Button value="log">输出</Radio.Button>
              </Radio.Group>
            </Col> */}
          </Row>
          <div className={styles.logContainer}>
            <Terminal
              terminal={getTerminalIns(taskType)}
              log={taskDetail.log}
              onClear={() => {
                clearLog(taskType);
              }}
            />
          </div>
        </>
      )}
    </>
  );
};

export default DevComponent;
