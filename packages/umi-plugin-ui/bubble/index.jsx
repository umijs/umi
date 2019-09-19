import React from 'react';
import ReactDOM from 'react-dom';
import styled, { keyframes } from 'styled-components';
import { callRemote, init as initSocket } from './socket';
import Bubble from './Bubble';

/**
 * Bubble (show/hide)
 * Icon (logo/close <= open/close)
 * iframe (loaded => open/close, connected/disconnected)
 *
 */

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
  width: 50vw;
  height: 60vh;
  display: ${props => (props.visible ? 'block' : 'none')};
  animation: ${props => (props.visible ? fadeInUp : fadeOutDown)} 400ms ease;
  opacity: ${props => (props.visible ? 1 : 0)};
  & > div {
    animation: ${props => (props.visible ? fadeInUp : fadeOutDown)} 400ms ease;
    opacity: ${props => (props.visible ? 1 : 0)};
  }
`;

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hide: false,
      open: undefined,
      connected: false,
      currentProject: props.currentProject,
    };
    window.addEventListener('message', this.handleMessage, false);
  }

  handleMessage = event => {
    try {
      const { action, data } = JSON.parse(event.data);
      switch (action) {
        // 显示 mini
        case 'umi.ui.showMini': {
          this.setState({
            open: true,
          });
          break;
        }
        // 隐藏 mini
        case 'umi.ui.hideMini': {
          this.setState({
            open: false,
          });
          break;
        }
        default: {
        }
      }
    } catch (_) {}
    return false;
  };

  async componentDidMount() {
    const { port } = this.props;
    try {
      await initSocket(`http://localhost:${port}/umiui`);
      this.setState({
        connected: true,
      });
    } catch (e) {
      console.error('Init socket failed', e);
      this.setState({
        connected: false,
      });
    }
  }

  toggleBubble = e => {
    e.stopPropagation();
    this.setState(state => ({
      hide: !state.hide,
    }));
  };

  toggleModal = async () => {
    const { currentProject, path } = this.props;
    if (this.state.hide) {
      this.setState({
        hide: false,
      });
    } else if (this.state.connected) {
      // open iframe UmiUI
      if (!currentProject.key) {
        const res = await callRemote({
          type: '@@project/getKeyOrAddWithPath',
          payload: {
            path,
          },
        });
        this.setState({
          currentProject: res,
        });
      }
      this.setState(state => ({
        open: !state.open,
      }));
    } else {
      // TODO: message.error
      alert('未连接 UI socket');
    }
  };

  closeModal = e => {
    e.stopPropagation();
    this.setState({
      open: false,
    });
  };

  onIframeLoad = () => {
    console.log('iframe loaded');
  };

  toggleMiniOpen = () => {
    this.setState(prevState => ({
      open: !prevState.open,
    }));
  };

  render() {
    const { hide, open, currentProject, connected } = this.state;
    const { port, isBigfish = false } = this.props;

    console.log('currentProject', currentProject);
    console.log('connected', connected);

    return (
      <Bubble isBigfish={isBigfish} toggleMiniOpen={this.toggleMiniOpen} open={open}>
        <IframeWrapper visible={open}>
          <iframe
            onLoad={this.onIframeLoad}
            style={{ width: '100%', height: '100%' }}
            // localhost maybe hard code
            src={`http://localhost:${port}/?mini${
              currentProject && currentProject.key ? `&key=${currentProject.key}` : ''
            }`}
            frameBorder="0"
            scrolling="no"
            seamless="seamless"
            title="iframe_umi_ui"
          />
        </IframeWrapper>
      </Bubble>
    );
  }
}

const doc = window.document;
const node = doc.createElement('div');
doc.body.appendChild(node);

export default props => {
  ReactDOM.render(<App {...props} />, node);
};
