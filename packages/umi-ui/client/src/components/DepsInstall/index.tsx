import * as React from 'react';
import { Button, Modal, Form, Select, Spin } from 'antd';
import { getLocale } from 'umi-plugin-react/locale';
import { ButtonProps } from 'antd/lib/button';
import useNpmClients from '@/components/hooks/useNpmClients';
import intl from '@/utils/intl';
import { reInstallDependencies, installDependencies } from '@/services/project';

const { useState, useEffect } = React;
const { Option } = Select;

export interface DepsInstallProps {
  installType?: 'install' | 'reinstall';
  path?: string;
  payload?: object;
  onProgress?: (data: any) => void;
  onFailure?: () => void;
  onSuccess?: () => void;
  children: any;
  loadingChild?: any;
}

const DepsInstallBtn: React.SFC<DepsInstallProps & ButtonProps> = props => {
  const {
    children,
    installType,
    path,
    onClick,
    payload,
    loadingChild,
    onFailure,
    onProgress,
    onSuccess,
    ...restProps
  } = props;
  const locale = getLocale();
  const { npmClient: needNpmClient } = payload;
  const { npmClient, error } = useNpmClients();
  const [loading, setLoading] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const projectPath = path || window.g_uiCurrentProject.path || '';
  const projectKey = window.g_uiCurrentProject.key || '';
  const [form] = Form.useForm();

  useEffect(
    () => {
      if (Array.isArray(npmClient) && npmClient.length > 0) {
        form.setFieldsValue({
          npmClient: npmClient[0],
        });
      }
    },
    [npmClient],
  );

  const closeModal = () => {
    setModalVisible(false);
  };

  const doInstallDeps = async () => {
    const action = installType === 'install' ? installDependencies : reInstallDependencies;
    const currentNpmClient = form.getFieldValue('npmClient');
    const actionPayload = needNpmClient
      ? {
          npmClient: currentNpmClient,
          projectPath,
          key: projectKey,
        }
      : { projectPath, key: projectKey };
    try {
      setLoading(true);
      await action(actionPayload, {
        onProgress,
      });
      if (onSuccess) {
        onSuccess();
      }
    } catch (e) {
      if (onFailure) {
        onFailure();
      }
    } finally {
      setLoading(false);
    }
  };

  const onOk = async () => {
    if (onClick) {
      onClick();
    }
    form.submit();
  };

  const handleFinish = async () => {
    setModalVisible(false);
    await doInstallDeps();
  };

  const handleClick = async e => {
    if (needNpmClient) {
      // show modal
      setModalVisible(true);
      return false;
    }
    if (onClick) {
      onClick(e);
    }
    await doInstallDeps();
  };

  return (
    <>
      <Button {...restProps} onClick={handleClick} loading={loading}>
        {loading && loadingChild ? loadingChild : children}
      </Button>
      <Modal visible={modalVisible} onOk={onOk} maskClosable={false} onCancel={closeModal}>
        <Form form={form} layout="vertical" onFinish={handleFinish}>
          <Form.Item
            label={intl({ id: 'org.umi.ui.global.project.create.steps.info.npmClient' })}
            name="npmClient"
            style={{
              marginBottom: 0,
            }}
            rules={[
              {
                required: true,
                message: intl({
                  id: 'org.umi.ui.global.project.create.steps.info.npmClient.required',
                }),
              },
            ]}
          >
            <Select
              placeholder={intl({
                id: 'org.umi.ui.global.project.create.steps.info.npmClient.required',
              })}
              notFoundContent={
                loading ? (
                  <Spin size="small" />
                ) : (
                  !npmClient.length && (
                    <p>
                      {intl({ id: 'org.umi.ui.global.project.create.steps.info.npmClient.empty' })}
                    </p>
                  )
                )
              }
            >
              {Array.isArray(npmClient) &&
                npmClient.map(client => (
                  <Option key={client} value={client}>
                    {client}
                  </Option>
                ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default DepsInstallBtn;
