import React from 'react';
import { connect } from 'dva';
import { Input, Form, Button, Select, Switch } from 'antd';
import model from './model';

const FormItem = Form.Item;
const Option = Select.Option;

function toString(data) {
  if (typeof data === 'string') return data;
  else if (typeof data === 'object') return JSON.stringify(data);
  else if (typeof data === 'boolean') return JSON.stringify(data);
  else throw new Error(`unsupport data type: ${typeof data}`);
}

function ConfigItem(props) {
  return (
    <>
      <li>
        {props.name}
        {do {
          if (props.name === 'plugins') {
            <PluginList data={props.data} />;
          } else {
            <ConfigPropertyItem {...props} />;
          }
        }}
      </li>
    </>
  );
}

function ConfigPropertyItem({ name, data }) {
  function blurHandler(e) {
    window.send('config', ['set', name, `${e.target.value}`]);
  }
  return (
    <Input size="small" defaultValue={toString(data)} onBlur={blurHandler} />
  );
}

function PluginList(props) {
  return (
    <ul>
      {props.data.map((item, i) => (
        <PluginItem key={i} data={item} />
      ))}
    </ul>
  );
}

function PluginItem(props) {
  const [name, opts] = Array.isArray(props.data) ? props.data : [props.data];
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

const ConfigManager = connect(state => ({
  config: state.config,
}))(
  Form.create()(props => {
    const { getFieldDecorator } = props.form;
    const config = props.config.data;

    function onChange(name, value) {
      window.send('config', [
        'set',
        name,
        `${value.target ? value.target.value : value}`,
      ]);
    }

    return (
      <div>
        <h2>Basic</h2>
        <FormItem
          {...formItemLayout}
          label="history"
          help="除非知道为什么，否则不要配置为 memory"
        >
          {getFieldDecorator('history', {
            initialValue: config.history || 'browser',
          })(
            <Select
              style={{ width: 160 }}
              onChange={onChange.bind(null, 'history')}
            >
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
          })(
            <Input
              style={{ width: 160 }}
              onBlur={onChange.bind(null, 'publicPath')}
            />,
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="base"
          help="指定路由的 base 路径，部署到非根目录时需要配置"
        >
          {getFieldDecorator('base', {
            initialValue: config.base || '/',
          })(
            <Input
              style={{ width: 160 }}
              onBlur={onChange.bind(null, 'base')}
            />,
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="outputPath"
          help="指定构建产物输出路径"
        >
          {getFieldDecorator('outputPath', {
            initialValue: config.outputPath || './dist',
          })(
            <Input
              style={{ width: 160 }}
              onBlur={onChange.bind(null, 'outputPath')}
            />,
          )}
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
        <FormItem
          {...formItemLayout}
          label="hash"
          help="指定输出文件是否带上 hash 后缀"
        >
          {getFieldDecorator('hash', {
            valuePropName: 'checked',
            initialValue: config.hash,
          })(<Switch onChange={onChange.bind(null, 'hash')} />)}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="mountElementId"
          help="指定页面根节点元素"
        >
          {getFieldDecorator('mountElementId', {
            initialValue: config.mountElementId || 'root',
          })(
            <Input
              style={{ width: 160 }}
              onBlur={onChange.bind(null, 'mountElementId')}
            />,
          )}
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

export default api => {
  api.addPanel({
    title: 'Config Manager',
    path: '/config',
    component: ConfigManager,
    models: [model],
  });
};
