import React from 'react';

// 在 dev 下似乎没有用，会被 HMR 拦截
export default class ErrorBoundary extends React.Component {
  static defaultProps = {
    onError: null,
    enable: true,
  };
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
    };
  }
  componentDidCatch(error, info) {
    const { onError } = this.props;
    console.error('Umi UI mini error', error);
    if (onError && typeof onError === 'function') {
      onError(error, info);
    }
  }
  render() {
    const { children, enable } = this.props;
    const { hasError } = this.state;
    if (hasError && enable) {
      return null;
    }
    return children;
  }
}
