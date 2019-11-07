import React, { useState, useEffect } from 'react';
import { Row, Col, Button, Modal, Select, Form } from 'antd';
import { CaretRight, Pause } from '@ant-design/icons';
import { IUiApi } from 'umi-types';
import withSize from 'react-sizeme';
import styles from '../../ui.module.less';
import { TaskType, TaskState } from '../../../server/core/enums';
import { ITaskDetail } from '../../../server/core/types';
import { getTerminalIns, clearLog } from '../../util';
import { namespace } from '../../model';
import { useInit } from '../../hooks';

import Terminal from '../Terminal';

interface IProps {
  api: IUiApi;
  detail: ITaskDetail;
  dispatch: any;
}

const { SizeMe } = withSize;
const taskType = TaskType.INSTALL;
const { Option } = Select;

const InstallComponent: React.FC<IProps> = ({ api, dispatch, detail = {} }) => {
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
      const terminal = getTerminalIns(taskType);
      terminal && terminal.clear();
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

export default InstallComponent;
