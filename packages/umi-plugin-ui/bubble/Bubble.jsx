import React from 'react';
import styled from 'styled-components';
import Dragger from './Dragger';
import Close from './Close';

const BubbleWrapper = styled('div')`
  background-color: rgb(48, 85, 234);
  height: 48px;
  width: 48px;
  pointer-events: none;
  cursor: pointer;
  display: flex;
  justify-content: center;
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

const Logo = styled('img')`
  width: 100%;
  user-select: none;
`;

class Bubble extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hide: false,
    };
  }

  hideBubble = () => {
    this.setState({
      hide: true,
    });
  };

  showBubble = () => {
    const { toggleMiniOpen } = this.props;
    if (this.state.hide) {
      // isHide
      this.setState({
        hide: false,
      });
    } else {
      // not hide, show iframe
      toggleMiniOpen();
    }
  };

  render() {
    const { isBigfish, open } = this.props;
    const { hide } = this.state;

    const img = isBigfish
      ? 'https://gw.alipayobjects.com/zos/antfincdn/Sgm%24iyiAT2/bigfish.svg'
      : 'https://gw.alipayobjects.com/zos/antfincdn/2MEHoVcklV/umi.svg';

    return (
      <Dragger open={open} hide={hide}>
        <div onClick={this.showBubble}>
          <BubbleWrapper>
            <Logo src={img} />
          </BubbleWrapper>

          <Close onClick={this.hideBubble} />
        </div>
      </Dragger>
    );
  }
}

export default Bubble;
