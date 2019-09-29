import React from 'react';
import styled, { keyframes } from 'styled-components';
import { getScrollBarSize } from './Dragger/utils';

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
  position: absolute;
  z-index: 1001;
  bottom: 72px;
  right: 0;
  box-shadow: 0 4px 8px 0 rgba(13, 26, 38, 0.2);
  background: #23232d;
  width: 68vw;
  height: 80vh;
  display: ${props => (props.visible ? 'block' : 'none')};
  animation: ${props => (props.visible ? fadeInUp : fadeOutDown)} 400ms ease;
  opacity: ${props => (props.visible ? 1 : 0)};
  & > * {
    animation: ${props => (props.visible ? fadeInUp : fadeOutDown)} 400ms ease;
    opacity: ${props => (props.visible ? 1 : 0)};
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
    this.switchScrollingEffect();
    document.body.style['overflow-y'] = 'hidden';
  };

  removeScrollingEffect = () => {
    document.body.style['overflow-y'] = '';
    this.switchScrollingEffect(true);
  };

  componentDidUpdate() {
    if (this.props.visible) {
      this.addScrollingEffect();
    } else {
      this.removeScrollingEffect();
    }
  }

  render() {
    return <IframeWrapper {...this.props} />;
  }
}

export default Modal;
