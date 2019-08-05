import * as React from 'react';
import { Form, Input, Button } from 'antd';
import cls from 'classnames';
import { IStepItemForm } from '@/components/StepForm/StepItem';
import DirectoryForm from '@/components/DirectoryForm';
import { isValidFolderName } from '@/utils/isValid';
import ProjectContext from '@/layouts/ProjectContext';

const { useState, useEffect, useContext, forwardRef } = React;

const Form1: React.FC<IStepItemForm> = (props, ref) => {
  const { cwd, goNext, goPrev, style } = props;
  const { formatMessage } = useContext(ProjectContext);
  const [baseDir, setBaseDir] = useState<string>(cwd);
  const [form] = Form.useForm();

  const handleBaseDirChange = (value: string) => {
    const name = form.getFieldValue('name') ? form.getFieldValue('name') : '';
    const dir = `${value.endsWith('/') ? value : `${value}/`}${name}`;
    form.setFieldsValue({
      baseDir: dir,
    });
    setBaseDir(dir);
  };

  const handleProjectName = e => {
    const basename = baseDir
      .split('/')
      .slice(0, -1)
      .join('/');
    const dir = `${basename.endsWith('/') ? basename : `${basename}/`}${e.target.value}`;
    form.setFieldsValue({
      baseDir: dir,
    });
    setBaseDir(dir);
  };

  return (
    <Form
      form={form}
      ref={ref}
      style={style}
      layout="vertical"
      name="form_create_project"
      onFinish={() => goNext()}
      initialValues={{
        _directory: cwd,
      }}
    >
      <Form.Item label={null}>
        <DirectoryForm onChange={handleBaseDirChange} />
      </Form.Item>
      <Form.Item
        name="name"
        label={formatMessage({ id: 'org.umi.ui.global.project.create.steps.input.name' })}
        rules={[
          { required: true, message: formatMessage({ id: '请输入应用名' }) },
          {
            validator: async (rule, value) => {
              if (!isValidFolderName(value)) {
                throw new Error(formatMessage({ id: '文件名无效' }));
              }
            },
          },
        ]}
      >
        <Input onChange={handleProjectName} />
      </Form.Item>
      <Form.Item name="baseDir">
        <p>{baseDir}</p>
      </Form.Item>
      <Form.Item>
        <Button htmlType="submit" type="primary">
          {formatMessage({ id: '下一步' })}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default forwardRef(Form1);
