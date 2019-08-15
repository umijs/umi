import React, { useEffect, useState, useContext } from 'react';
import { IUiApi } from 'umi-types';
import { Input, Form, Select, Switch, Button } from 'antd';
import serialize from 'serialize-javascript';
import Context from './Context';
import styles from './ui.module.less';

const FormItem = Form.Item;
const { Option } = Select;

function toString(data) {
  if (typeof data === 'string') return data;
  else if (typeof data === 'object') return JSON.stringify(data);
  else if (typeof data === 'boolean') return JSON.stringify(data);
  else throw new Error(`unsupport data type: ${typeof data}`);
}

// function ConfigItem(props) {
//   /* eslint-disable no-unused-expressions */
//   const { name, data } = props;
//   return (
//     <React.Fragment>
//       <li>
//         {name}
//         {name === 'plugins' ? <PluginList data={data} /> : <ConfigPropertyItem {...props} />}
//         }}
//       </li>
//     </React.Fragment>
//   );
//   /* eslint-enable no-unused-expressions */
// }

function ConfigPropertyItem({ name, data }) {
  function blurHandler(e) {
    window.send('config', ['set', name, `${e.target.value}`]);
  }
  return <Input size="small" defaultValue={toString(data)} onBlur={blurHandler} />;
}

function PluginList({ data }) {
  return (
    <ul>
      {data.map((item, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <PluginItem key={i} data={item} />
      ))}
    </ul>
  );
}

function PluginItem({ data }) {
  const [name, opts] = Array.isArray(data) ? data : [data];
  return (
    <li>
      {name}
      {opts ? <input defaultValue={JSON.stringify(opts)} /> : ''}
    </li>
  );
}

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 4 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 16 },
  },
};

function ConfigTargets(props) {
  const { default: defaultValue, value } = props.item;
  const mergedValue = {
    ...defaultValue,
    ...value,
  };
  return (
    <div>
      {Object.keys(mergedValue).map(key => {
        return (
          <div key={key}>
            <h4>{key}</h4>
            <Input defaultValue={mergedValue[key]} />
          </div>
        );
      })}
    </div>
  );
}

function ConfigItem(props) {
  const { item, editHandler } = props;
  let value = item.default;
  if ('value' in item) {
    value = item.value;
  }

  return (
    <div className={styles.configItem}>
      <h3>{item.title || item.name}</h3>
      {item.type === 'list' && (
        <div>
          <Select value={value} onChange={v => editHandler(item.name, v)}>
            {item.choices.map(choice => {
              return (
                <Option key={choice} value={choice}>
                  {choice}
                </Option>
              );
            })}
          </Select>
        </div>
      )}
      {item.type === 'string' && (
        <div>
          <Input defaultValue={value} onBlur={e => editHandler(item.name, e.target.value)} />
        </div>
      )}
      {item.type === 'boolean' && (
        <div>
          <Switch checked={value} onChange={vv => editHandler(item.name, toString(vv))} />
        </div>
      )}
      {item.type === 'object' && <div>object</div>}
      <div>{item.description}</div>
    </div>
  );
}

function BasicConfig() {
  const [data, setData] = useState([]);
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
            {groupedData[group].map(item => {
              return <ConfigItem key={item.name} item={item} editHandler={editHandler} />;
            })}
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
}

function Test() {
  return <div>TEST</div>;
}

interface IConfigManager {
  api: IUiApi;
}

const ConfigManager: React.SFC<IConfigManager> = ({ api }) => {
  const { TwoColumnPanel } = api;
  return (
    <Context.Provider
      value={{
        api,
      }}
    >
      <TwoColumnPanel
        sections={[
          {
            title: '项目配置',
            icon: 'plus-circle',
            description: 'ABC',
            component: BasicConfig,
          },
          {
            title: 'umi-plugin-react 配置',
            icon: 'pause-circle',
            description: 'BCD',
            component: Test,
          },
        ]}
      />
    </Context.Provider>
  );
};

export default ConfigManager;
