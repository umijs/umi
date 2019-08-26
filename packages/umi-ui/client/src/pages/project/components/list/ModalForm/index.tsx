import * as React from 'react';
import { Modal, Input, InputNumber, Form } from 'antd';
import { formatMessage } from 'umi-plugin-react/locale';
import flatten from 'lodash/flatten';
import nanoid from 'nanoid';

const { useState, useEffect } = React;

interface IModalFormProps {
  onCancel?: () => void;
  name?: string;
  onOk?: (name: string, values: object) => void;
  restModelProps?: object;
  initialValues?: any;
  restFormProps?: object;
}

const ModalForm: React.FC<IModalFormProps> = ({
  onCancel,
  onOk,
  name,
  initialValues,
  restModelProps,
  restFormProps,
}) => {
  const [form] = Form.useForm();
  const formName = name || nanoid();

  console.log('initialValues', initialValues);

  React.useEffect(() => {
    return () => {
      form.resetFields();
    };
  }, []);

  const handleOnOk = () => {
    const values = form.getFieldsValue();
    const errors = flatten(form.getFieldsError().map(error => error.errors));
    if (!errors.length && onOk) {
      onOk(formName, values);
    }
  };

  return (
    <Modal {...restModelProps} visible onOk={handleOnOk} onCancel={onCancel}>
      <Form
        layout="vertical"
        {...restFormProps}
        form={form}
        initialValues={initialValues}
        name={formName}
      >
        <Form.Item
          name="name"
          label={formatMessage({ id: 'org.umi.ui.global.project.create.steps.input.name' })}
          rules={[
            {
              required: true,
              message: formatMessage({
                id: 'org.umi.ui.global.project.create.steps.input.placeholder',
              }),
            },
          ]}
        >
          <Input
            placeholder={formatMessage({
              id: 'org.umi.ui.global.project.create.steps.input.placeholder',
            })}
          />
        </Form.Item>
        <Form.Item name="key" noStyle>
          <span />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ModalForm;
