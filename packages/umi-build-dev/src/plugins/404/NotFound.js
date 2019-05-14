/* eslint-disable */
import React from 'react';
import Link from 'umi/link';
import withRouter from 'umi/withRouter';
import 'whatwg-fetch';
import guessJSFileFromPath from './guessJSFileFromPath';
import styles from './NotFound.less';

class NotFound extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      routes: [],
    };
  }

  componentDidMount() {
    fetch('/__umiDev/routes')
      .then(res => res.json())
      .then(routes => {
        this.setState({
          loading: false,
          routes,
        });
      });
  }

  renderRoutes(routes) {
    return (
      <ul>
        {routes.map((route, i) => {
          if (!route.path) return null;
          return (
            <li key={route.key || i}>
              <Link to={route.path}>{route.path}</Link>
              {route.routes ? this.renderRoutes(route.routes) : null}
            </li>
          );
        })}
      </ul>
    );
  }

  render() {
    const { location, pagesPath, hasRoutesInConfig } = this.props;
    const jsFile = guessJSFileFromPath(location.pathname);
    return (
      <div className={styles['umi-NotFound-wrapper']}>
        <h1>umi development 404 page</h1>
        <p>
          There's not a page yet at <code>{location.pathname}</code>.
        </p>
        <p>
          Create a React.js component in your pages directory at{' '}
          <code>
            {pagesPath}/{jsFile}
          </code>{' '}
          {do {
            if (hasRoutesInConfig) {
              `and configure the route in config file `;
            } else {
              ('');
            }
          }}
          then this page will automatically refresh to show the new page component you created.
        </p>
        <h2>Your Routes</h2>
        {do {
          if (this.state.loading) {
            <div>Loading routes...</div>;
          } else {
            this.renderRoutes(this.state.routes);
          }
        }}
      </div>
    );
  }
}

export default withRouter(NotFound);
