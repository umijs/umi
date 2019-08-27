import React, { useEffect, useState, useContext } from 'react';
import { IUiApi } from 'umi-types';
import { Input, Form, Select, Switch, Button } from 'antd';
import serialize from 'serialize-javascript';
import BasicConfig from './components/BasicConfig';
import UIConfig from './components/UIConfig';
import PluginConfig from './components/PluginConfig';
import Context from './Context';
import styles from './index.module.less';

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

interface IConfigManager {
  api: IUiApi;
}

function getSections(api) {
  const sections = [
    {
      key: 'project',
      title: '项目配置',
      icon: (
        <img
          src="https://img.alicdn.com/tfs/TB1cEkUdq67gK0jSZFHXXa9jVXa-64-64.png"
          width={32}
          height={32}
        />
      ),
      description: '这是一段项目配置的描述。',
      component: BasicConfig,
    },
  ];
  const isBigfish = !!window.g_bigfish;
  if (!isBigfish) {
    sections.push({
      key: 'react',
      title: 'umi-plugin-react 配置',
      icon: 'pause-circle',
      description: 'BCD',
      component: PluginConfig,
    });
  }
  const { npmClient } = api.currentProject;
  if (['npm', 'yarn', 'pnpm'].indexOf(npmClient) > -1) {
    sections.push({
      key: 'install',
      title: 'UI 配置',
      icon: (
        <img
          src="https://img.alicdn.com/tfs/TB1cEkUdq67gK0jSZFHXXa9jVXa-64-64.png"
          width={32}
          height={32}
        />
      ),
      description: 'UI 配置',
      component: UIConfig,
    });
  }

  return sections;
}

const ConfigManager: React.SFC<IConfigManager> = ({ api }) => {
  const { TwoColumnPanel, getContext } = api;
  const { theme } = useContext(getContext());
  return (
    <Context.Provider
      value={{
        api,
        theme,
      }}
    >
      <TwoColumnPanel
        disableRightOverflow
        className={styles.configuration}
        sections={getSections(api)}
      />
    </Context.Provider>
  );
};

export default ConfigManager;
