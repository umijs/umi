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

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hide: false,
      open: false,
      connected: false,
      currentProject: props.currentProject,
    };
  }

  async componentDidMount() {
    const { currentProject, path, port } = this.props;
    try {
      await initSocket(`http://localhost:${port}/umiui`);
      console.log('currentProject', currentProject);
      let key = currentProject;
      if (!currentProject) {
        const res = await callRemote({
          type: '@@project/getKeyOrAddWithPath',
          payload: {
            path,
          },
        });
        key = res.key;
      }
      this.setState({
        ...(key ? { currentProject } : {}),
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

  openModal = () => {
    if (this.state.hide) {
      this.setState({
        hide: false,
      });
    }
    if (this.state.connected) {
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

  render() {
    const { hide, open, currentProject, connected } = this.state;
    const { port } = this.props;

    console.log('currentProject', currentProject);
    console.log('connected', connected);

    return (
      <Dragger hide={hide} onClick={this.openModal}>
        <Bubble>
          <Logo />
        </Bubble>
        <Close onClick={this.toggleBubble} />
        <Modal visible={open} onMaskClick={this.closeModal}>
          <iframe
            style={{ width: '100%', minHeight: '80vh' }}
            // localhost maybe hard code
            src={`http://localhost:${port}/?mini&key=${currentProject}`}
            frameBorder="0"
            title="iframe_umi_ui"
          />
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
