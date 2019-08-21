import * as React from 'react';
import { Form, Checkbox, Button, Select, Row, Col, Radio, message, Spin } from 'antd';
import { IStepItemForm } from '@/components/StepForm/StepItem';
import NpmClientForm from '@/components/NpmClientForm';
import CardForm, { IOption } from '@/components/CardForm';
import { APP_TYPE, REACT_FEATURES } from '@/enums';
import ProjectContext from '@/layouts/ProjectContext';

const { useState, useContext } = React;

const Form2: React.FC<IStepItemForm> = (props, ref) => {
  const { goPrev, handleFinish, style, active } = props;
  const { formatMessage } = useContext(ProjectContext);
  const [appType, setAppType] = useState<APP_TYPE>();
  const [form] = Form.useForm();
  // tmp options, real from server
  const options: IOption[] = [
    {
      title: 'Bigfish-Ant Design Pro 模板',
      description: '选择一个由流程编排提供的典型用户案例，',
      link: 'http://preview.pro.ant.design',
      value: 'ant-design-pro',
    },
    {
      title: '基础模板',
      description: '选择一个由流程编排提供的典型用户案例，',
      link: 'http://preview.pro.ant.design',
      value: 'app',
    },
  ];

  const handleTypeOnChange = (type: APP_TYPE): void => {
    setAppType(type);
  };

  return (
    <Form
      style={style}
      form={form}
      ref={ref}
      layout="vertical"
      name="form_create_project"
      onFinish={handleFinish}
      initialValues={{
        args: {
          language: 'JavaScript',
        },
      }}
    >
      <Form.Item
        name="type"
        label="模板"
        rules={[{ required: true, message: formatMessage({ id: '请选择模板' }) }]}
      >
        <CardForm options={options} onChange={handleTypeOnChange} />
      </Form.Item>
      {appType === 'app' && (
        <Form.Item
          name={['args', 'reactFeatures']}
          label="技术栈"
          rules={[{ type: 'array', message: formatMessage({ id: '请选择特性' }) }]}
        >
          <Checkbox.Group style={{ width: '100%' }}>
            <Row>
              {Object.keys(REACT_FEATURES).map((feature: any) => (
                <Col key={feature} span={8} style={{ marginBottom: 16 }}>
                  <Checkbox value={feature}>{REACT_FEATURES[feature]}</Checkbox>
                </Col>
              ))}
            </Row>
          </Checkbox.Group>
        </Form.Item>
      )}
      <Form.Item
        name={['args', 'language']}
        label="语言"
        rules={[{ required: true, message: formatMessage({ id: '请选择语言' }) }]}
      >
        <Radio.Group>
          <Radio value="JavaScript">JavaScript</Radio>
          <Radio value="TypeScript">TypeScript</Radio>
        </Radio.Group>
      </Form.Item>
      {active && (
        <Form.Item
          name="npmClient"
          label="包管理"
          rules={[{ required: true, message: formatMessage({ id: '请选择包管理器' }) }]}
        >
          <NpmClientForm />
        </Form.Item>
      )}
      <Form.Item style={{ marginTop: 16 }}>
        <>
          <Button onClick={() => goPrev()}>{formatMessage({ id: '上一步' })}</Button>
          <Button htmlType="submit" type="primary" style={{ marginLeft: 8 }}>
            {formatMessage({ id: '完成' })}
          </Button>
        </>
      </Form.Item>
    </Form>
  );
};

export default React.forwardRef(Form2);
