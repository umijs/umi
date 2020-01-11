import React from 'react';
import ReactDOM from 'react-dom';
import styled, { keyframes } from 'styled-components';
import { getScrollBarSize } from './utils';

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(50px);
  }
  to {
    opacity: 1;
  }
`;

const fadeOutDown = keyframes`
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
    transform: translateY(50px);
  }
`;

const IframeWrapper = styled('div')`
  animation: ${({ visible }) => (visible ? fadeInUp : fadeOutDown)} 400ms ease;
  & > * {
    animation: ${({ visible }) => (visible ? fadeInUp : fadeOutDown)} 400ms ease;
    opacity: ${({ visible }) => (visible ? 1 : 0)};
    position: absolute;
    width: 100%;
    height: 100%;
    left: 0;
    top: 0;
  }
`;

class Modal extends React.Component {
  switchScrollingEffect = close => {
    const bodyIsOverflowing =
      document.body.scrollHeight > (window.innerHeight || document.documentElement.clientHeight) &&
      window.innerWidth > document.body.offsetWidth;
    if (!bodyIsOverflowing) {
      return;
    }
    if (close) {
      document.body.style.position = '';
      document.body.style.width = '';
      return;
    }
    const scrollBarSize = getScrollBarSize();
    if (scrollBarSize) {
      document.body.style.position = 'relative';
      document.body.style.width = `calc(100% - ${scrollBarSize}px)`;
    }
  };

  addScrollingEffect = () => {
    const node = this.nodeDom;
    this.switchScrollingEffect();
    document.body.style['overflow-y'] = 'hidden';
    node.style.display = 'block';
    requestAnimationFrame(() => {
      node.style.opacity = '1';
    });
  };

  removeScrollingEffect = () => {
    const node = this.nodeDom;
    document.body.style['overflow-y'] = '';
    this.switchScrollingEffect(true);
    node.style.opacity = '0';
    requestAnimationFrame(() => {
      node.style.display = 'none';
    });
  };

  componentDidMount() {
    // eslint-disable-next-line
    this.nodeDom = ReactDOM.findDOMNode(this);
    // DidMount 的时候就是true，因为默认是未定义。
    // 所以强行调用一下 componentDidUpdate，可以防止闪动
    this.componentDidUpdate();
  }

  componentDidUpdate() {
    if (this.props.visible) {
      this.addScrollingEffect();
    } else {
      this.removeScrollingEffect();
    }
  }

  render() {
    const { children, visible } = this.props;
    const style = {
      position: 'absolute',
      zIndex: 1001,
      bottom: 72,
      right: 0,
      boxShadow: '0 4px 8px 0 rgba(13, 26, 38, 0.2)',
      background: '#23232d',
      width: '68vw',
      height: '80vh',
    };
    return (
      <IframeWrapper style={style} visible={visible}>
        {children}
      </IframeWrapper>
    );
  }
}

export default Modal;
