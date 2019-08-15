import React, { useEffect, useState, useContext } from 'react';
import { Button, Form } from 'antd';
import serialize from 'serialize-javascript';
import Context from '../Context';
import configMapping from './ConfigItem';
import styles from './BasicConfig.less';

const BasicConfig = () => {
  const [data, setData] = useState([]);
  const [form] = Form.useForm();
  const { api } = useContext(Context);
  useEffect(() => {
    (async () => {
      await updateData();
    })();
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

  return (
    <div className={styles.basicConfig}>
      {Object.keys(groupedData).map(group => {
        return (
          <div className={styles.group} key={group}>
            <h2>{group}</h2>
            <Form
              onFinish={values => {
                console.log('valuesvaluesvalues', values);
              }}
            >
              {groupedData[group].slice(0, 1).map(item => {
                const ConfigItem = configMapping[item.type];
                return <ConfigItem key={item.name} {...item} form={form} />;
              })}
            </Form>
          </div>
        );
      })}
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
