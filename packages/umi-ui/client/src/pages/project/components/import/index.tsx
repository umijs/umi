import React from 'react';
import { Button, Form, message, Input } from 'antd';
import ProjectContext from '@/layouts/ProjectContext';
import { importProject } from '@/services/project';
import DirectoryForm from '@/components/DirectoryForm';
import { IProjectProps } from '../index';
import { getBasename } from '@/utils';
import cls from 'classnames';

import common from '../common.less';
import styles from './index.less';

const { useState, useEffect, useContext } = React;

const ImportProject: React.SFC<IProjectProps> = props => {
  const { cwd, files } = props;
  const [fullPath, setFullPath] = useState<string>(cwd);
  const { formatMessage } = useContext(ProjectContext);
  const [form] = Form.useForm();
  const { setCurrent } = useContext(ProjectContext);

  const handleFinish = async values => {
    console.log('import projects', values);
    try {
      await importProject(values);
      setCurrent('list');
    } catch (e) {
      message.error('导入项目失败');
    }
  };

  console.log('fullPath', fullPath);

  return (
    <section className={common.section}>
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <h2>导入</h2>
        <Form
          form={form}
          layout="vertical"
          name="form_create_project"
          onFinish={handleFinish}
          onValuesChange={(changedValue, { path }) => {
            setFullPath(path);
            form.setFieldsValue({
              name: getBasename(path),
            });
          }}
        >
          <Form.Item label={null} name="path" rules={[{ required: true }]}>
            <DirectoryForm />
          </Form.Item>
          <Form.Item label={null} shouldUpdate name="name" noStyle rules={[{ required: true }]}>
            <p />
          </Form.Item>
          <Form.Item style={{ marginTop: 16 }}>
            <p>{fullPath}</p>
          </Form.Item>
          <Form.Item>
            <Button htmlType="submit" type="primary">
              {formatMessage({ id: '确定' })}
            </Button>
          </Form.Item>
        </Form>
      </div>
    </section>
  );
};

export default ImportProject;
