import React, { useEffect, useState, useContext } from 'react';
import cls from 'classnames';
import { Button, Form, Input, Spin, Switch, message } from 'antd';
import serialize from 'serialize-javascript';
import Context from '../Context';
import ObjectItemField from './ConfigItem/fields/ObjectItemField';
import configMapping from './ConfigItem';
import Toc from './common/Toc';
import { getToc } from './ConfigItem/utils';
import styles from './BasicConfig.module.less';

const BasicConfig = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  // const [submitLoading, setSubmitLoading] = useState(false);
  // const [disabled, setDisabled] = useState(true);
  const { api, theme } = useContext(Context);
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

  const initialValues = data.reduce(
    (prev, curr) => ({
      ...prev,
      [curr.name]: curr.value || curr.default,
    }),
    {},
  );
  console.log('initialValues', initialValues);
  if (loading) {
    return <Spin />;
  }

  const getChangedValue = React.useCallback(
    vv => {
      return getDiffItems(initialValues, vv);
    },
    [initialValues],
  );

  const handleFinish = async values => {
    console.log('valuesvalues', values);
    const changedValues = getChangedValue(values);
    console.log('changedValues', changedValues);
    if (!Object.keys(changedValues).length) {
      // no edit config
      return false;
    }
    const loadingMsg = message.loading('正在保存配置', 0);
    const PromiseArr = [];
    Object.keys(changedValues).forEach(name => {
      PromiseArr.push(
        api.callRemote({
          type: 'org.umi.config.edit',
          payload: {
            key: name,
            value: formatValue(changedValues[name]),
          },
        }),
      );
    });

    console.log('PromiseArr', PromiseArr);
    try {
      Promise.all(PromiseArr);
    } catch (e) {
      message.error('配置修改失败');
      console.error('配置修改失败', e);
    } finally {
      loadingMsg();
      // setSubmitLoading(false);
    }
    await updateData();
    message.success('配置修改成功');
  };

  const handleFinishFailed = ({ errorFields }) => {
    const [firstErrorField] = errorFields;
    const [firstErrorFieldName] = firstErrorField.name;
    form.scrollToField(firstErrorFieldName);
  };

  const themeCls = cls(styles.basicConfig, styles[`basicConfig-${theme}`]);

  console.log('groupedData', groupedData);
  const tocAnchors = React.useMemo(() => getToc(groupedData), [groupedData]);

  return (
    <div className={themeCls}>
      {data.length > 0 && (
        <div className={styles.form}>
          <Form
            layout="vertical"
            onFinish={handleFinish}
            onFinishFailed={handleFinishFailed}
            initialValues={initialValues}
            onValuesChange={(changedValues, allValues) => {
              // console.log('allValues', allValues);
              const changed = getChangedValue(allValues);
              // setDisabled(Object.keys(changed).length === 0);
            }}
          >
            {Object.keys(groupedData).map(group => {
              return (
                <div className={styles.group} key={group}>
                  <h2 id={group}>{group}</h2>
                  {groupedData[group].map(item => {
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
      )}
      <Toc
        className={styles.toc}
        anchors={tocAnchors}
        getContainer={() => document.getElementById('two-column-panel-right')}
      />
    </div>
  );
};

export default BasicConfig;
