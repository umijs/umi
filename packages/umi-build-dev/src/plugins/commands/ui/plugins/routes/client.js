import React from 'react';
import { connect } from 'dva';
import { Button, Icon } from 'antd';
import './client.css';

const Routes = connect(state => ({
  routes: state.routes,
}))(props => {
  function renderRoutes(routes) {
    return (
      <ul>
        {routes.map((route, i) => {
          if (!route.path) return null;
          return (
            <li key={route.key || i}>
              <div>
                <span className="client-pathName">{route.path}</span>
                <Icon
                  type="delete"
                  theme="filled"
                  onClick={(route => {
                    window.send('rm', ['page', route.component]);
                  }).bind(null, route)}
                />
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
            window.send('generate', ['page', name]);
          }}
        >
          add route
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
