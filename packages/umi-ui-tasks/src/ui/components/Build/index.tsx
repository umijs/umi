import React, { useState, useEffect } from 'react';
import { Row, Col, Button, Radio, Spin, Modal, Form, Input, Switch } from 'antd';
import { IUiApi } from 'umi-types';
import styles from '../../ui.module.less';
import { TaskType, TaskState } from '../../../server/core/enums';
import { exec, cancel, isCaredEvent, getTerminalIns, TriggerState } from '../../util';
import { useTaskDetail } from '../../hooks';
import Terminal from '../Terminal';
import { ITaskDetail } from '../../../server/core/types';

interface IProps {
  detail: ITaskDetail;
  api: IUiApi;
  state?: TaskState;
}

const taskType = TaskType.BUILD;

const BuildComponent: React.FC<IProps> = ({ api }) => {
  const [taskDetail, setTaskDetail] = useState({ state: TaskState.INIT, type: taskType });
  const [loading, setLoading] = useState(true);
  const [form] = Form.useForm();
  const [modalVisible, setModalVisible] = useState(false);
  const [env, setEnv] = useState({
    COMPRESS: true,
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
    };
  }, []);

  async function build() {
    const { triggerState, errMsg } = await exec(taskType, env);
    if (triggerState === TriggerState.FAIL) {
      api.notify({
        type: 'error',
        title: '执行构建失败',
        message: errMsg,
      });
    }
  }

  async function cancelBuild() {
    const { triggerState, errMsg } = await cancel(taskType);
    if (triggerState === TriggerState.FAIL) {
      api.notify({
        title: '取消构建失败',
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

  const isTaskRunning = taskDetail && taskDetail.state === TaskState.ING;
  return (
    <>
      {loading ? (
        <Spin />
      ) : (
        <>
          <Row>
            <Col span={8} className={styles.buttonGroup}>
              <Button
                type="primary"
                onClick={isTaskRunning ? cancelBuild : build}
                loading={loading}
              >
                {isTaskRunning ? '停止' : '构建'}
              </Button>
              <Button onClick={openModal}>变量管理</Button>
              <Modal
                visible={modalVisible}
                title="构建环境变量"
                onOk={handleOk}
                onCancel={handleCancel}
              >
                <Form name="buildEnv" form={form} initialValues={env}>
                  <Form.Item label="是否压缩" name="COMPRESS" valuePropName="checked">
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
            <Terminal terminal={getTerminalIns(taskType)} />
          </div>
        </>
      )}
    </>
  );
};

export default BuildComponent;
