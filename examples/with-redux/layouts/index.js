import React from 'react';
import { Provider } from 'react-redux';
import { store } from '../store';

export default class Layout extends React.PureComponent {
  render() {
    return (
      <Provider store={store}>
        <div>{this.props.children}</div>
      </Provider>
    );
  }
}
