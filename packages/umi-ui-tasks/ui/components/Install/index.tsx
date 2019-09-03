import React, { useState, useEffect } from 'react';
import { Row, Col, Button, Modal, Select, Form } from 'antd';
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
const taskType = TaskType.INSTALL;
const { Option } = Select;

const InstallComponent: React.FC<IProps> = ({ api }) => {
  const { intl } = api;
  const [taskDetail, setTaskDetail] = useState({ state: TaskState.INIT, type: taskType, log: '' });
  const [npmClients, setNpmClients] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

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

  useEffect(() => {
    (async () => {
      const { data } = await api.callRemote({
        type: '@@project/getNpmClients',
      });
      setNpmClients(data);
      form.setFieldsValue({
        npmClient: data[0],
      });
    })();
  }, []);

  // UnMount: reset form
  useEffect(() => {
    return () => {
      form.resetFields();
      const terminal = getTerminalIns(taskType);
      terminal && terminal.clear();
    };
  }, []);

  async function install(npmClient) {
    const { triggerState, errMsg } = await exec(taskType, {
      NPM_CLIENT: npmClient,
    });
    if (triggerState === TriggerState.FAIL) {
      api.notify({
        type: 'error',
        title: intl({ id: 'org.umi.ui.tasks.install.execError' }),
        message: errMsg,
      });
    }
  }

  async function cancelInstall() {
    const { triggerState, errMsg } = await cancel(taskType);
    if (triggerState === TriggerState.FAIL) {
      api.notify({
        title: intl({ id: 'org.umi.ui.tasks.install.cancelError' }),
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
        install(values.npmClient);
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
      <h1 className={styles.title}>{intl({ id: 'org.umi.ui.tasks.install' })}</h1>
      <>
        <Row>
          <Col span={24} className={styles.buttonGroup}>
            <Button type="primary" onClick={isTaskRunning ? cancelInstall : openModal}>
              {isTaskRunning ? (
                <>
                  <Pause />
                  <span className={styles.runningText}>
                    {' '}
                    {intl({ id: 'org.umi.ui.tasks.install.cancel' })}
                  </span>
                </>
              ) : (
                <>
                  <CaretRight />
                  <span className={styles.runningText}>
                    {' '}
                    {intl({ id: 'org.umi.ui.tasks.install.start' })}
                  </span>
                </>
              )}
            </Button>
            <Modal
              visible={modalVisible}
              title={intl({ id: 'org.umi.ui.tasks.install' })}
              okText={intl({ id: 'org.umi.ui.tasks.install.okText' })}
              cancelText={intl({ id: 'org.umi.ui.tasks.install.cancelText' })}
              onOk={handleOk}
              onCancel={handleCancel}
            >
              <div className={styles.modalContainer}>
                <div className={styles.confirmMessage}>
                  {intl({ id: 'org.umi.ui.tasks.install.tip' })}
                </div>
                <Form name="intasllEnv" form={form} layout="vertical">
                  <Form.Item
                    label={intl({ id: 'org.umi.ui.tasks.install.npmClient' })}
                    name="npmClient"
                  >
                    <Select style={{ width: 120 }}>
                      {npmClients.map(key => (
                        <Option key={key} value={key}>
                          {key}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Form>
              </div>
            </Modal>
          </Col>
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

export default InstallComponent;
