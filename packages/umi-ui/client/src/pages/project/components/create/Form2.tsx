import * as React from 'react';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { Form, Checkbox, Button, Select, Row, Col, Radio, Spin, Tooltip } from 'antd';
import { IStepItemForm } from 'umi-types/ui';
import useNpmClients from '@/components/hooks/useNpmClients';
import CardForm, { IOption } from '@/components/CardForm';
import { REACT_FEATURES, REACT_FEATURES_TIP } from '@/enums';
import ProjectContext from '@/layouts/ProjectContext';
import styles from './index.less';

const { useContext, useEffect } = React;
const { Option } = Select;

const Form2: React.FC<IStepItemForm> = (props, ref) => {
  const { goPrev, handleFinish, style, active } = props;
  const { formatMessage, locale } = useContext(ProjectContext);
  const { npmClient, loading } = useNpmClients({
    active,
  });
  const [form] = Form.useForm();
  useEffect(() => {
    if (Array.isArray(npmClient) && npmClient.length > 0) {
      form.setFieldsValue({
        npmClient: npmClient[0],
      });
    }
  }, [npmClient]);
  // TODO: tmp options, real from server
  const options: IOption[] = [
    {
      title: locale === 'zh-CN' ? 'Ant Design Pro 模板' : 'Ant Design Pro Template',
      description:
        locale === 'zh-CN'
          ? '选择一个由流程编排提供的典型用户案例，'
          : 'Choose a typical user case provided by process orchestration',
      link: 'http://preview.pro.ant.design',
      value: 'ant-design-pro',
    },
    {
      title: locale === 'zh-CN' ? '基础模板' : 'Basic template',
      description:
        locale === 'zh-CN'
          ? '选择一个由流程编排提供的典型用户案例，'
          : 'Choose a typical user case provided by process orchestration',
      link: 'https://github.com/umijs/create-umi/tree/master/lib/generators/app',
      value: 'app',
    },
  ];

  return (
    <Form
      style={style}
      form={form}
      ref={ref}
      layout="vertical"
      name="form_create_project"
      onFinish={handleFinish}
      onKeyDown={e => (e.keyCode === 13 ? e.preventDefault() : '')}
      initialValues={{
        args: {
          language: 'JavaScript',
          reactFeatures: [],
        },
        // taobaoSpeedUp: true,
      }}
    >
      <Form.Item
        name="type"
        required={false}
        label={formatMessage({ id: 'org.umi.ui.global.project.create.steps.info.template' })}
        rules={[
          {
            required: true,
            message: formatMessage({
              id: 'org.umi.ui.global.project.create.steps.info.template.required',
            }),
          },
        ]}
      >
        <CardForm options={options} />
      </Form.Item>
      <Form.Item
        shouldUpdate={(prevValues, curValues) => prevValues.type !== curValues.type}
        style={{ marginBottom: 0 }}
      >
        {({ getFieldValue }) => {
          const isShow = getFieldValue('type') === 'app';
          return (
            isShow && (
              <Form.Item
                name={['args', 'reactFeatures']}
                label={formatMessage({
                  id: 'org.umi.ui.global.project.create.steps.info.reactFeatures',
                })}
                required={false}
                rules={[
                  {
                    type: 'array',
                    message: formatMessage({
                      id: 'org.umi.ui.global.project.create.steps.info.reactFeatures.required',
                    }),
                  },
                ]}
                style={{ marginBottom: 0 }}
              >
                <Checkbox.Group style={{ width: '100%' }}>
                  <Row>
                    {Object.keys(REACT_FEATURES).map((feature: any) => (
                      <Col className={styles['feature-col']} key={feature} span={8}>
                        <Checkbox value={feature}>{REACT_FEATURES[feature]}&nbsp;</Checkbox>
                        <Tooltip title={formatMessage({ id: REACT_FEATURES_TIP[feature] })}>
                          <QuestionCircleOutlined style={{ cursor: 'pointer' }} />
                        </Tooltip>
                      </Col>
                    ))}
                  </Row>
                </Checkbox.Group>
              </Form.Item>
            )
          );
        }}
      </Form.Item>
      <Form.Item
        name={['args', 'language']}
        label={formatMessage({ id: 'org.umi.ui.global.project.create.steps.info.lang' })}
        required={false}
        rules={[
          {
            required: true,
            message: formatMessage({
              id: 'org.umi.ui.global.project.create.steps.info.lang.required',
            }),
          },
        ]}
      >
        <Radio.Group>
          <Radio.Button value="JavaScript">JavaScript</Radio.Button>
          <Radio.Button value="TypeScript">TypeScript</Radio.Button>
        </Radio.Group>
      </Form.Item>
      <Form.Item
        name="npmClient"
        label={formatMessage({ id: 'org.umi.ui.global.project.create.steps.info.npmClient' })}
        required={false}
        rules={[
          {
            required: true,
            message: formatMessage({
              id: 'org.umi.ui.global.project.create.steps.info.npmClient.required',
            }),
          },
        ]}
      >
        <Select
          placeholder="org.umi.ui.global.project.create.steps.info.npmClient.required"
          notFoundContent={
            loading ? (
              <Spin size="small" />
            ) : (
              !npmClient.length && (
                <p>
                  {formatMessage({
                    id: 'org.umi.ui.global.project.create.steps.info.npmClient.empty',
                  })}
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
      {/*<Form.Item*/}
      {/*  noStyle*/}
      {/*  shouldUpdate={(prevValues, curValues) => prevValues.npmClient !== curValues.npmClient}*/}
      {/*>*/}
      {/*  {({ getFieldValue }) => {*/}
      {/*    const client = getFieldValue('npmClient') as string;*/}
      {/*    const shouldSpeedUp = Object.keys(SPEEDUP_CLIENTS).includes(client);*/}
      {/*    return (*/}
      {/*      shouldSpeedUp && (*/}
      {/*        <Form.Item*/}
      {/*          name="taobaoSpeedUp"*/}
      {/*          valuePropName="checked"*/}
      {/*          label={*/}
      {/*            <span>*/}
      {/*              淘宝源加速&nbsp;*/}
      {/*              <Tooltip title="使用 npm/yarn 时开启国内加速  ">*/}
      {/*                <QuestionCircle />*/}
      {/*              </Tooltip>*/}
      {/*            </span>*/}
      {/*          }*/}
      {/*        >*/}
      {/*          <Switch />*/}
      {/*        </Form.Item>*/}
      {/*      )*/}
      {/*    );*/}
      {/*  }}*/}
      {/*</Form.Item>*/}
      <Form.Item style={{ marginTop: 16 }}>
        <>
          <Button onClick={() => goPrev()}>
            {formatMessage({ id: 'org.umi.ui.global.steps.prev' })}
          </Button>
          <Button htmlType="submit" type="primary" style={{ marginLeft: 8 }}>
            {formatMessage({ id: 'org.umi.ui.global.project.create.steps.info.finish' })}
          </Button>
        </>
      </Form.Item>
    </Form>
  );
};

export default React.forwardRef(Form2);
