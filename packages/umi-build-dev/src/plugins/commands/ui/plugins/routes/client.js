import React from 'react';
import { connect } from 'dva';
import { Button, Icon, Popconfirm } from 'antd';
import './client.css';

const Routes = connect(state => ({
  routes: state.routes,
}))(props => {
  function renderRoutes(routes) {
    return (
      <ul className="client-list">
        {routes.map((route, i) => {
          if (!route.path) return null;
          const keys = Object.keys(route).filter(key => {
            if (['exact', 'routes', 'component'].includes(key)) return false;
            if (key.charAt(0) === '_') return false;
            return true;
          });

          function getValue(key) {
            if (key === 'path') {
              return (
                <a href={`http://localhost:8000${route[key]}`}>{route[key]}</a>
              );
            }
            return route[key];
          }

          return (
            <li key={route.key || i} className="client-item">
              <div>
                <Icon
                  className="client-type"
                  type={route.routes ? 'folder-open' : 'file'}
                />
                <span className="client-info">
                  {keys.map((key, i) => {
                    return (
                      <span key={key}>
                        <strong>{key}: </strong>
                        <code>{getValue(key)}</code>
                        {i === keys.length - 1 ? '' : <strong>, </strong>}
                      </span>
                    );
                  })}
                </span>
                {/*<Icon className="client-icon" type="edit" theme="filled" />*/}
                <Popconfirm
                  title="Are you sure delete this component?"
                  onConfirm={(route => {
                    window.send('rm', ['page', route.component]);
                  }).bind(null, route)}
                >
                  <Icon className="client-icon" type="delete" theme="filled" />
                </Popconfirm>
              </div>
              {route.routes ? renderRoutes(route.routes) : null}
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <div>
      <div className="client-actions">
        <Button
          type="primary"
          onClick={() => {
            const name = window.prompt(`What's your page name?`);
            if (name) {
              window.send('generate', ['page', name]);
            }
          }}
        >
          add route
        </Button>
        &nbsp;&nbsp;
        <Button
          type="primary"
          onClick={() => {
            const name = window.prompt(`What's your layout name?`);
            if (name) {
              window.send('generate', ['layout', name]);
            }
          }}
        >
          add layout
        </Button>
      </div>
      {renderRoutes(props.routes.data)}
    </div>
  );
});

export default api => {
  api.addPanel({
    title: 'Routes Manager',
    path: '/routes',
    component: Routes,
    models: [require('./model').default],
  });
};
