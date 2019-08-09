import React, { useEffect, useState } from 'react';
import { Input, Form, Select, Switch } from 'antd';
import styles from './ui.module.less';

const FormItem = Form.Item;
const { Option } = Select;

function toString(data) {
  if (typeof data === 'string') return data;
  else if (typeof data === 'object') return JSON.stringify(data);
  else if (typeof data === 'boolean') return JSON.stringify(data);
  else throw new Error(`unsupport data type: ${typeof data}`);
}

function ConfigItem(props) {
  /* eslint-disable no-unused-expressions */
  const { name, data } = props;
  return (
    <React.Fragment>
      <li>
        {name}
        {do {
          if (name === 'plugins') {
            <PluginList data={data} />;
          } else {
            <ConfigPropertyItem {...props} />;
          }
        }}
      </li>
    </React.Fragment>
  );
  /* eslint-enable no-unused-expressions */
}

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

/*
const ConfigManager = connect(state => ({
  config: state.config,
}))(
  Form.create()(props => {
    const { getFieldDecorator } = props.form;
    const config = props.config.data;

    function onChange(name, value) {
      window.send('config', ['set', name, `${value.target ? value.target.value : value}`]);
    }

    return (
      <div>
        <h2>Basic</h2>
        <FormItem {...formItemLayout} label="history" help="除非知道为什么，否则不要配置为 memory">
          {getFieldDecorator('history', {
            initialValue: config.history || 'browser',
          })(
            <Select style={{ width: 160 }} onChange={onChange.bind(null, 'history')}>
              <Option value="hash">hash</Option>
              <Option value="browser">browser</Option>
              <Option value="memory">memory</Option>
            </Select>,
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="publicPath"
          help="指定 webpack 的 publicPath 配置，部署静态文件到非根目录时需要配置"
        >
          {getFieldDecorator('publicPath', {
            initialValue: config.publicPath || '/',
          })(<Input style={{ width: 160 }} onBlur={onChange.bind(null, 'publicPath')} />)}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="base"
          help="指定路由的 base 路径，部署到非根目录时需要配置"
        >
          {getFieldDecorator('base', {
            initialValue: config.base || '/',
          })(<Input style={{ width: 160 }} onBlur={onChange.bind(null, 'base')} />)}
        </FormItem>
        <FormItem {...formItemLayout} label="outputPath" help="指定构建产物输出路径">
          {getFieldDecorator('outputPath', {
            initialValue: config.outputPath || './dist',
          })(<Input style={{ width: 160 }} onBlur={onChange.bind(null, 'outputPath')} />)}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="runtimePublicPath"
          help="启用运行时 publicPath，对 JavaScript 有效"
        >
          {getFieldDecorator('runtimePublicPath', {
            valuePropName: 'checked',
            initialValue: config.runtimePublicPath,
          })(<Switch onChange={onChange.bind(null, 'runtimePublicPath')} />)}
        </FormItem>
        <FormItem {...formItemLayout} label="hash" help="指定输出文件是否带上 hash 后缀">
          {getFieldDecorator('hash', {
            valuePropName: 'checked',
            initialValue: config.hash,
          })(<Switch onChange={onChange.bind(null, 'hash')} />)}
        </FormItem>
        <FormItem {...formItemLayout} label="mountElementId" help="指定页面根节点元素">
          {getFieldDecorator('mountElementId', {
            initialValue: config.mountElementId || 'root',
          })(<Input style={{ width: 160 }} onBlur={onChange.bind(null, 'mountElementId')} />)}
        </FormItem>
        <h2>Targets</h2>
        <h2>Plugins</h2>
        <h2>Webpack</h2>
        <ul>
          {Object.keys(props.config.data).map(key => (
            <ConfigItem key={key} name={key} data={props.config.data[key]} />
          ))}
        </ul>
      </div>
    );
  }),
);
 */

export default api => {
  const { callRemote, getContext, TwoColumnPanel } = api;

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
    const { item } = props;
    let value = item.default;
    if ('value' in item) {
      value = item.value;
    }

    function blurHandler(name, e) {
      props.editHandler(name, e.target.value);
    }

    return (
      <div className={styles.configItem}>
        <h3>{item.name}</h3>
        {do {
          if (item.type === 'list') {
            <div>
              <Select value={value} onChange={props.editHandler.bind(null, item.name)}>
                {item.choices.map(choice => {
                  return (
                    <Option key={choice} value={choice}>
                      {choice}
                    </Option>
                  );
                })}
              </Select>
            </div>;
          } else if (item.type === 'string') {
            <div>
              <Input defaultValue={value} onBlur={blurHandler.bind(null, item.name)} />
            </div>;
          } else if (item.type === 'boolean') {
            <div>
              <Switch checked={value} onChange={props.editHandler.bind(null, item.name)} />
            </div>;
          } else if (item.name === 'targets') {
            <ConfigTargets {...props} />;
          } else if (item.type === 'object') {
            <div>object</div>;
          } else {
            <div>Unsupport type {item.type}</div>;
          }
        }}
        <div>{item.description}</div>
      </div>
    );
  }

  function BasicConfig() {
    const [data, setData] = useState([]);
    useEffect(() => {
      (async () => {
        await updateData();
      })();
    }, []);

    async function updateData() {
      const { data } = await callRemote({
        type: 'org.umi.config.list',
      });
      setData(data);
    }

    async function editHandler(name, value) {
      await callRemote({
        type: 'org.umi.config.edit',
        payload: {
          key: name,
          value: value.toString(),
        },
      });
      await updateData();
    }

    const groupedData = {};
    data.forEach(item => {
      if (!groupedData[item.group]) {
        groupedData[item.group] = [];
      }
      groupedData[item.group].push(item);
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
      </div>
    );
  }

  function Test() {
    return <div>TEST</div>;
  }

  function ConfigManager() {
    return (
      <TwoColumnPanel
        sections={[
          { title: '项目配置', icon: 'plus-circle', description: 'ABC', component: BasicConfig },
          {
            title: 'umi-plugin-react 配置',
            icon: 'pause-circle',
            description: 'BCD',
            component: Test,
          },
        ]}
      />
    );
  }

  api.addPanel({
    title: '配置管理',
    path: '/configuration',
    icon: 'environment',
    component: ConfigManager,
  });
};
