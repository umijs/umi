import React, { useState, useEffect } from 'react';
import { Row, Col, Button, Modal, Select, Form } from 'antd';
import { CaretRightOutlined, PauseOutlined } from '@ant-design/icons';
import styles from '../../ui.module.less';
import { TaskState } from '../../../server/core/enums';
import { getTerminalRefIns, setTerminalRefIns } from '../../util';
import { TaskComponentProps } from '..';
import { useInit } from '../../hooks';

const { Option } = Select;

const InstallComponent: React.FC<TaskComponentProps> = ({
  taskType,
  namespace,
  api,
  dispatch,
  detail = {},
  Terminal,
}) => {
  const { intl } = api;
  const [log, setLog] = useState('');
  const [npmClients, setNpmClients] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [init] = useInit(detail);

  useEffect(
    () => {
      if (!init) {
        return;
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
      (async () => {
        const { data } = await api.callRemote({
          type: '@@project/getNpmClients',
        });
        setNpmClients(data);
        form.setFieldsValue({
          npmClient: data[0],
        });
      })();
    },
    [init],
  );

  // UnMount: reset form
  useEffect(() => {
    return () => {
      form.resetFields();
      const terminal = getTerminalRefIns(taskType, api.currentProject.key);
      if (terminal) {
        terminal.clear();
      }
    };
  }, []);

  async function install(npmClient) {
    dispatch({
      type: `${namespace}/exec`,
      payload: {
        taskType,
        env: {
          NPM_CLIENT: npmClient,
        },
      },
    });
  }

  async function cancelInstall() {
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
        install(values.npmClient);
        setModalVisible(false);
      })
      .catch(_ => {});
  };

  const handleCancel = () => {
    setModalVisible(false);
  };

  const isTaskRunning = detail && detail.state === TaskState.ING;
  return (
    <>
      <h1 className={styles.title}>{intl({ id: 'org.umi.ui.tasks.install' })}</h1>
      <>
        <Row>
          <Col span={24} className={styles.buttonGroup}>
            <Button
              size={api.mini ? 'small' : 'default'}
              type="primary"
              onClick={isTaskRunning ? cancelInstall : openModal}
            >
              {isTaskRunning ? (
                <>
                  <PauseOutlined />
                  <span className={styles.runningText}>
                    {' '}
                    {intl({ id: 'org.umi.ui.tasks.install.cancel' })}
                  </span>
                </>
              ) : (
                <>
                  <CaretRightOutlined />
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

export default InstallComponent;
