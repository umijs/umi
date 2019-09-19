import React from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';
import { callRemote, init as initSocket } from './socket';
import Logo from './Logo';
import Close from './Close';
import Dragger from './Dragger';
import Modal from './Modal';

const Bubble = styled('div')`
  background-color: rgb(48, 85, 234);
  height: 48px;
  width: 48px;
  pointer-events: none;
  cursor: pointer;
  display: flex;
  -webkit-box-pack: center;
  justify-content: center;
  -webkit-box-align: center;
  align-items: center;
  position: relative;
  box-shadow: rgba(14, 39, 140, 0.3) 0px 4px 10px 0px;
  user-select: none;
  opacity: 0.8;
  border-radius: 50%;
  padding: 8px;
  transition: background-color 0.2s ease 0s, opacity 0.2s ease 0s, transform 0.2s ease 0s;
  &:hover {
    background-color: rgb(21, 59, 210);
    opacity: 1;
  }
`;

const IframeWrapper = styled('div')`
  position: relative;
  z-index: 1001;
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

  openModal = async () => {
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
        open: state.hide === false,
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

  render() {
    const { hide, open, currentProject, connected } = this.state;
    const { port } = this.props;

    console.log('currentProject', currentProject);
    console.log('connected', connected);

    return (
      <Dragger open={open} hide={hide} onClick={this.openModal}>
        <Bubble>
          <Logo />
        </Bubble>
        <Close onClick={this.toggleBubble} />
        <Modal visible={open} onMaskClick={this.closeModal}>
          <IframeWrapper>
            <iframe
              onLoad={this.onIframeLoad}
              style={{ width: '100%', minHeight: '80vh' }}
              // localhost maybe hard code
              src={`http://localhost:${port}/?mini${
                currentProject && currentProject.key ? `&key=${currentProject.key}` : ''
              }`}
              frameBorder="0"
              title="iframe_umi_ui"
            />
          </IframeWrapper>
        </Modal>
      </Dragger>
    );
  }
}

const doc = window.document;
const node = doc.createElement('div');
doc.body.appendChild(node);

export default props => {
  ReactDOM.render(<App {...props} />, node);
};
