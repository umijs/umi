import React, { useEffect, useState, useContext } from 'react';
import { Button, Form, Input, Spin, Switch } from 'antd';
import serialize from 'serialize-javascript';
import Context from '../Context';
import configMapping from './ConfigItem';
import styles from './BasicConfig.less';

const BasicConfig = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const { api } = useContext(Context);
  const { _ } = api;

  const getDiffItems = (prev: object, curr: object): object =>
    _.omitBy(curr, (v, k) => _.isEqual(prev[k], v));

  useEffect(() => {
    setLoading(true);
    (async () => {
      await updateData();
    })();
    setLoading(false);
  }, []);

  async function updateData() {
    const { data } = await api.callRemote({
      type: 'org.umi.config.list',
      payload: {
        lang: api.getLocale(),
      },
    });
    setData(data);
  }

  function formatValue(value) {
    if (value) {
      if (typeof value === 'object') {
        return serialize(value);
      }
      return value.toString();
    }
    return value;
  }

  async function editHandler(name, value) {
    await api.callRemote({
      type: 'org.umi.config.edit',
      payload: {
        key: name,
        value: formatValue(value),
      },
    });
    await updateData();
  }

  const groupedData = {};
  console.log('data', data);
  data.forEach(item => {
    const { group } = item;
    if (!groupedData[group]) {
      groupedData[group] = [];
    }
    groupedData[group].push(item);
  });

  console.log('groupedData', groupedData);

  const initialValues = data.reduce(
    (prev, curr) => ({
      ...prev,
      [curr.name]: curr.default,
    }),
    {},
  );
  console.log('initialValues', initialValues);
  if (loading) {
    return <Spin />;
  }
  const handleFinish = values => {
    console.log('valuesvalues', values);
    const changedValues = getDiffItems(initialValues, values);
    console.log('changedValues', changedValues);
  };
  return (
    <div className={styles.basicConfig}>
      {data.length > 0 && (
        <Form
          layout="vertical"
          onFinish={handleFinish}
          initialValues={initialValues}
          onValuesChange={(changedValues, allValues) => {
            console.log('allValues', allValues);
          }}
        >
          {Object.keys(groupedData).map(group => {
            return (
              <div className={styles.group} key={group}>
                <h2>{group}</h2>
                {groupedData[group].slice(0, 3).map(item => {
                  const ConfigItem = configMapping[item.type];
                  return <ConfigItem key={item.name} {...item} form={form} />;
                })}
              </div>
            );
          })}
          <Form.Item shouldUpdate>
            {({ getFieldsValue }) => {
              return <pre>{JSON.stringify(getFieldsValue(), null, 2)}</pre>;
            }}
          </Form.Item>
          <Button htmlType="submit">保存</Button>
        </Form>
      )}
      <div>
        <h2>Test</h2>
        <Button
          type="primary"
          onClick={editHandler.bind(null, 'mock.exclude', ['aaa', 'bbb'])}
        >{`保存 mock.exclude 为 ['aaa', 'bbb']`}</Button>
        <Button
          type="primary"
          onClick={editHandler.bind(null, 'mock.exclude', [])}
        >{`清空 mock.exclude`}</Button>
        <br />
        <br />
        <Button
          type="primary"
          onClick={editHandler.bind(
            null,
            {
              base: '/foo/',
              publicPath: '/foo/',
            },
            '',
          )}
        >{`同时保存 base 和 publicPath 为 /foo/`}</Button>
        <br />
        <br />
        <br />
      </div>
    </div>
  );
};

export default BasicConfig;
