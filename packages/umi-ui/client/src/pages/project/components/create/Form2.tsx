import * as React from 'react';
import { Form, Input, Button } from 'antd';
import { IStepItemForm } from '@/components/StepForm/StepItem';
import { isValidFolderName } from '@/utils/isValid';
import ProjectContext from '@/layouts/ProjectContext';

const { useState, useEffect, useContext } = React;

const Form2: React.FC<IStepItemForm> = (props, ref) => {
  const { goNext, goPrev, handleFinish, style } = props;
  const { formatMessage } = useContext(ProjectContext);
  const [form] = Form.useForm();

  return (
    <Form
      style={style}
      form={form}
      ref={ref}
      layout="vertical"
      name="form_create_project"
      onFinish={handleFinish}
      initialValues={{}}
    >
      <Form.Item
        name="name2"
        label={formatMessage({ id: 'org.umi.ui.global.project.create.steps.input.name' })}
        rules={[
          { required: true, message: formatMessage({ id: '请输入应用名2' }) },
          {
            validator: async (rule, value) => {
              if (!isValidFolderName(value)) {
                throw new Error(formatMessage({ id: '文件名无效2' }));
              }
            },
          },
        ]}
      >
        <Input />
      </Form.Item>
      <Form.Item>
        <>
          <Button onClick={() => goPrev()}>{formatMessage({ id: '上一步' })}</Button>
          <Button htmlType="submit" type="primary">
            {formatMessage({ id: '完成' })}
          </Button>
        </>
      </Form.Item>
    </Form>
  );
};

export default React.forwardRef(Form2);
