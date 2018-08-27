import React from 'react';

export default class UmiReactTitle extends React.Component {
  componentDidMount() {
    document.title = this.props.route._title;
  }
  componentWillUnmount() {
    document.title = this.props.route._title_default;
  }
  render() {
    return this.props.children;
  }
}
