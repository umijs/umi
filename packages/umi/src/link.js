import React, { Component, Children } from 'react';
import Router from './router';
import { isLocal, normalizePath } from './utils';

class Link extends Component {
  linkClicked = e => {
    if (
      e.currentTarget.nodeName === 'A' &&
      (e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        (e.nativeEvent && e.nativeEvent.which === 2))
    ) {
      return;
    }

    const { to } = this.props;
    const path = normalizePath(to);
    if (!isLocal(path)) {
      return;
    }

    e.preventDefault();

    const { replace } = this.props;
    const changeMethod = replace ? 'replace' : 'push';

    Router[changeMethod](to);
  };

  render() {
    let { children } = this.props;
    if (typeof children === 'string') {
      children = <a>{children}</a>;
    }

    const child = Children.only(children);
    const props = {
      onClick: this.linkClicked,
    };

    return React.cloneElement(child, props);
  }
}

export default Link;
