import * as React from 'react';
import { Button, Modal, Form } from 'antd';
import { ButtonProps } from 'antd/lib/button';
import NpmClientForm from '@/components/NpmClientForm';
import { reInstallDependencies } from '@/services/project';

const { useState, useEffect } = React;

export interface DepsInstallProps {
  installType?: 'install' | 'reinstall';
  path?: string;
  payload?: object;
  onProgress?: (data: any) => void;
  children: any;
}

const DepsInstallBtn: React.SFC<DepsInstallProps & ButtonProps> = props => {
  const { children, installType, path, onClick, payload, onProgress, ...restProps } = props;
  const { npmClient } = payload;
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [currNpmClient, setCurrNpmClient] = useState<string>('');
  const projectPath = path || window.g_uiCurrentProject.path || '';
  const [form] = Form.useForm();

  const closeModal = () => {
    setModalVisible(false);
  };

  const doInstallDeps = async () => {
    const action = installType === 'install' ? reInstallDependencies : reInstallDependencies;
    const actionPayload = npmClient
      ? {
          npmClient: currNpmClient,
          projectPath,
        }
      : { projectPath };
    setLoading(true);
    try {
      await action(actionPayload, {
        onProgress,
        onSuccess: () => {
          setLoading(false);
        },
        onFailure: () => {
          setLoading(false);
        },
      });
    } catch (e) {
      console.error('install error', e);
    } finally {
      setLoading(false);
    }
  };

  const onOk = async () => {
    form.submit();
  };

  const handleFinish = async () => {
    setModalVisible(false);
    await doInstallDeps();
  };

  const handleClick = async () => {
    if (npmClient && !currNpmClient) {
      // show modal
      setModalVisible(true);
      return false;
    }
    await doInstallDeps();
  };

  const handleSelectNpmClient = (client: string) => {
    setCurrNpmClient(client);
  };

  return (
    <>
      <Button {...restProps} onClick={handleClick} loading={loading}>
        {children}
      </Button>
      <Modal visible={modalVisible} onOk={onOk} maskClosable={false} onCancel={closeModal}>
        <Form form={form} layout="vertical" onFinish={handleFinish}>
          <Form.Item
            label="选择包管理器"
            name="npmClient"
            rules={[{ required: true, message: '请选择包管理器' }]}
          >
            <NpmClientForm onChange={handleSelectNpmClient} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default DepsInstallBtn;
