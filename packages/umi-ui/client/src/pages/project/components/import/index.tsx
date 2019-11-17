import React from 'react';
import { Button, Form, message, Input } from 'antd';
import slash2 from 'slash2';
import cls from 'classnames';
import ProjectContext from '@/layouts/ProjectContext';
import { importProject } from '@/services/project';
import { trimSlash, validateDirPath, getBasename } from '@/components/DirectoryForm/pathUtils';
import DirectoryForm from '@/components/DirectoryForm';
import debug from '@/debug';
import { IProjectProps } from '../index';
import common from '../common.less';
import styles from './index.less';

const { useState, useEffect, useContext } = React;

const ImportProject: React.SFC<IProjectProps> = props => {
  const _log = debug.extend('ImportProject');
  const { cwd, files } = props;
  const { formatMessage } = useContext(ProjectContext);
  const [form] = Form.useForm();
  const { setCurrent } = useContext(ProjectContext);

  const handleFinish = async values => {
    _log('import projects', values);
    try {
      await importProject(values);
      setCurrent('list');
    } catch (e) {
      message.error(e.message || '导入项目失败');
    }
  };

  return (
    <section className={common.section}>
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <h2> {formatMessage({ id: 'org.umi.ui.global.project.import.hint' })} </h2>
        <Form
          form={form}
          layout="vertical"
          name="form_create_project"
          onFinish={handleFinish}
          initialValues={{
            path: cwd,
          }}
          onValuesChange={(changedValue, { path }) => {
            form.setFieldsValue({
              name: getBasename(trimSlash(path)),
            });
          }}
        >
          <Form.Item
            label={null}
            name="path"
            rules={[
              { required: true },
              {
                validator: async (rule, value) => {
                  await validateDirPath(value);
                },
              },
            ]}
          >
            <DirectoryForm />
          </Form.Item>
          <Form.Item label={null} shouldUpdate name="name" noStyle rules={[{ required: true }]}>
            <p />
          </Form.Item>
          <Form.Item shouldUpdate style={{ marginTop: 16 }}>
            {({ getFieldValue }) => <p>{trimSlash(getFieldValue('path'))}</p>}
          </Form.Item>
          <Form.Item>
            <Button htmlType="submit" type="primary">
              {formatMessage({ id: 'org.umi.ui.global.okText' })}
            </Button>
          </Form.Item>
        </Form>
      </div>
    </section>
  );
};

export default ImportProject;
