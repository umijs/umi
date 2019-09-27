import React from 'react';
import styled, { keyframes } from 'styled-components';

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

let cached;

class Modal extends React.Component {
  getScrollBarSize = fresh => {
    if (fresh || cached === undefined) {
      const inner = document.createElement('div');
      inner.style.width = '100%';
      inner.style.height = '200px';

      const outer = document.createElement('div');
      const outerStyle = outer.style;

      outerStyle.position = 'absolute';
      outerStyle.top = 0;
      outerStyle.left = 0;
      outerStyle.pointerEvents = 'none';
      outerStyle.visibility = 'hidden';
      outerStyle.width = '200px';
      outerStyle.height = '150px';
      outerStyle.overflow = 'hidden';

      outer.appendChild(inner);

      document.body.appendChild(outer);

      const widthContained = inner.offsetWidth;
      outer.style.overflow = 'scroll';
      let widthScroll = inner.offsetWidth;

      if (widthContained === widthScroll) {
        widthScroll = outer.clientWidth;
      }

      document.body.removeChild(outer);

      cached = widthContained - widthScroll;
    }
    return cached;
  };

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
    const scrollBarSize = this.getScrollBarSize();
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
