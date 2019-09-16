import React from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';
import Logo from './Logo';
import Close, { CloseWrapper } from './Close';
import Modal from './Modal';

const BubbleWrapper = styled('div')`
  position: fixed;
  bottom: 10px;
  right: 0px;
  padding-right: 26px;
  transition: transform 0.1s ease-in-out;
  ${props =>
    props.hide &&
    `
    transform: translateX(76%);
  `}
  &:hover ${CloseWrapper} {
    opacity: 1;
  }
`;

const Bubble = styled('div')`
  background-color: rgb(48, 85, 234);
  height: 60px;
  cursor: pointer;
  display: flex;
  -webkit-box-pack: center;
  justify-content: center;
  -webkit-box-align: center;
  align-items: center;
  width: 60px;
  position: relative;
  box-shadow: rgba(14, 39, 140, 0.3) 0px 4px 10px 0px;
  user-select: none;
  opacity: 0.8;
  border-radius: 30px;
  padding: 8px;
  transition: background-color 0.2s ease 0s, opacity 0.2s ease 0s;
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
    };
  }

  toggleBubble = e => {
    e.preventDefault();
    e.stopPropagation();
    this.setState(state => ({
      hide: !state.hide,
    }));
  };

  openModal = () => {
    this.setState(state => ({
      hide: state.hide === false,
      open: state.hide === false,
    }));
  };

  closeModal = e => {
    e.stopPropagation();
    this.setState({
      open: false,
    });
  };

  render() {
    const { hide, open } = this.state;
    const { port } = this.props;

    return (
      <BubbleWrapper hide={hide} onClick={this.openModal}>
        <Bubble>
          <Logo />
        </Bubble>
        <Close onClick={this.toggleBubble} />
        <Modal visible={open} onMaskClick={this.closeModal}>
          <iframe
            style={{ width: '100%', minHeight: '80vh' }}
            // localhost maybe hard code
            src={`http://localhost:${port}/?mini`}
            frameBorder="0"
            title="iframe_umi_ui"
          />
        </Modal>
      </BubbleWrapper>
    );
  }
}

const doc = window.document;
const node = doc.createElement('div');
doc.body.appendChild(node);

export default ({ port }) => {
  ReactDOM.render(<App port={port} />, node);
};
