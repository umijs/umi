import * as React from 'react';
import { Form, Input, Button } from 'antd';
import cls from 'classnames';
import { IStepItemForm } from '@/components/StepForm/StepItem';
import { isValidFolderName } from '@/utils/isValid';
import ProjectContext from '@/layouts/ProjectContext';

const { useState, useEffect, useContext, forwardRef } = React;

const Form1: React.FC<IStepItemForm> = (props, ref) => {
  const { cwd, goNext, goPrev, style } = props;
  const [path, setPath] = useState<string>(cwd);
  const { formatMessage } = useContext(ProjectContext);
  const [form] = Form.useForm();

  return (
    <Form
      form={form}
      ref={ref}
      style={style}
      layout="vertical"
      name="form_create_project"
      onFinish={() => goNext()}
      initialValues={{}}
    >
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
        <Input
          onChange={e => {
            setPath(`${cwd}/${e.target.value}`);
          }}
        />
      </Form.Item>
      <Form.Item>
        <p>{path}</p>
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
