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

const App = ({ port }) => {
  const ref = React.useRef();
  const [hide, setHide] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  const toggleBubble = e => {
    e.preventDefault();
    e.stopPropagation();
    setHide(s => !s);
  };

  const openModal = () => {
    if (hide) {
      setHide(false);
    } else {
      // open modal
      setOpen(true);
    }
  };

  const closeModal = e => {
    e.stopPropagation();
    setOpen(false);
  };

  return (
    <BubbleWrapper hide={hide} ref={ref} onClick={openModal}>
      <Bubble>
        <Logo />
      </Bubble>
      <Close onClick={toggleBubble} />
      <Modal visible={open} onMaskClick={closeModal}>
        <iframe
          style={{ width: '100%', minHeight: '80vh' }}
          src={`http://localhost:${port}`}
          frameBorder="0"
          title="iframe_umi_ui"
        />
      </Modal>
    </BubbleWrapper>
  );
};

const doc = window.document;
const node = doc.createElement('div');
doc.body.appendChild(node);

export default function({ port }) {
  console.log('umi ui port', port);
  ReactDOM.render(<App port={port} />, node);
}
