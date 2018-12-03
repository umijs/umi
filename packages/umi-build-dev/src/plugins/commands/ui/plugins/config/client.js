import React from 'react';
import { connect } from 'dva';

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
  return <input defaultValue={toString(data)} onBlur={blurHandler} />;
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

const ConfigManager = connect(state => ({
  config: state.config,
}))(props => {
  return (
    <div>
      <h3>config mangager page</h3>
      <ul>
        {Object.keys(props.config.data).map(key => (
          <ConfigItem key={key} name={key} data={props.config.data[key]} />
        ))}
      </ul>
    </div>
  );
});

export default api => {
  api.addPanel({
    title: 'Config Manager',
    path: '/config',
    component: ConfigManager,
    models: [require('./model').default],
  });
};
