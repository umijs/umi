import React, { useRef } from 'react';
import { Button, Form, Input, message } from 'antd';
import ProjectContext from '@/layouts/ProjectContext';
import { importProject } from '@/services/project';
import cls from 'classnames';

import common from '../common.less';
import styles from './index.less';

const { useState, useEffect, useContext } = React;

interface ImportProjectProps {}

const ImportProject: React.SFC<ImportProjectProps> = props => {
  const { currentProject, cwd, files, logs, fetchProject } = props;
  const { setCurrent } = useContext(ProjectContext);

  const layout = {
    wrapperCol: { span: 16 },
  };
  const tailLayout = {
    wrapperCol: { span: 16 },
  };

  const handleClick = async values => {
    const { path, name } = values;
    try {
      await importProject({
        path,
        name,
      });
      setCurrent('list');
    } catch (e) {
      message.error('导入项目失败');
    }
  };

  return (
    <section className={common.section}>
      <h2>导入</h2>
      <Form
        {...layout}
        name="basic"
        initialValues={{
          path: cwd,
          name: 'hahaha',
        }}
        onFinish={handleClick}
      >
        <Form.Item label="路径" name="path" rules={[{ required: true }]}>
          <Input />
        </Form.Item>

        <Form.Item label="名称" name="name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>

        <Form.Item {...tailLayout}>
          <Button type="primary" htmlType="submit">
            Import Project
          </Button>
        </Form.Item>
      </Form>
    </section>
  );
};

export default ImportProject;
