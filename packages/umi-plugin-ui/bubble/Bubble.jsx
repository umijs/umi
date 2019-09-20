import React from 'react';
import styled from 'styled-components';
import Dragger from './Dragger';
import Hide from './Hide';
import { UmiLogo, BigfishLogo } from './Logo';
import * as ENUM from './enum';
import Close from './Close';

const BubbleWrapper = styled('div')`
  background-color: ${props => (props.open ? '#30303D' : '#454550')};
  height: 28px;
  width: 28px;
  pointer-events: none;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  user-select: none;
  border-radius: 50%;
  box-shadow: 0 4px 8px 0 rgba(13, 26, 38, 0.2);
  padding: 16px;
  transition: background-color 0.2s ease 0s, opacity 0.2s ease 0s, transform 0.2s ease 0s;
  &:hover {
    background-color: rgb(21, 59, 210);
    opacity: 1;
  }
`;

const CloseComponent = styled(Close)`
  position: absolute;
  width: 20px;
  height: 20px;
  top: 50%;
  user-select: none;
  transform: ${props =>
    props.open ? 'translateY(-50%)' : 'translateY(-50%) scale(0.4) rotate(-45deg);'};
  opacity: ${props => (props.open ? 1 : 0)};
  transition: all 0.3s ease;
`;

class Bubble extends React.Component {
  constructor(props) {
    super(props);
    const hide = window.localStorage.getItem(ENUM.STORE_BUBBLE_HIDE) === 'true';

    this.state = {
      hide,
    };
  }

  hideBubble = () => {
    this.setState(
      {
        hide: true,
      },
      () => {
        window.localStorage.setItem(ENUM.STORE_BUBBLE_HIDE, 'true');
      },
    );
  };

  showBubble = () => {
    const { toggleMiniOpen } = this.props;
    if (this.state.hide) {
      // isHide
      this.setState(
        {
          hide: false,
        },
        () => {
          window.localStorage.removeItem(ENUM.STORE_BUBBLE_HIDE);
        },
      );
    } else {
      // not hide, show iframe
      toggleMiniOpen();
    }
  };

  render() {
    const { isBigfish, open, children } = this.props;
    const { hide } = this.state;

    const Logo = styled(isBigfish ? BigfishLogo : UmiLogo)`
      position: absolute;
      width: 28px;
      height: 28px;
      top: 50%;
      user-select: none;
      transform: ${props =>
        props.open ? 'translateY(-50%) scale(0.4) rotate(45deg)' : 'translateY(-50%)'};
      opacity: ${props => (props.open ? 0 : 1)};
      transition: all 0.3s ease;
    `;

    return (
      <Dragger open={open} hide={hide} onClick={this.showBubble}>
        <BubbleWrapper open={open}>
          <Logo open={open} />
          <CloseComponent open={open} />
        </BubbleWrapper>

        {!open && <Hide onClick={this.hideBubble} />}
        {children}
      </Dragger>
    );
  }
}

export default Bubble;
