import React from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';
import Dragger from './Dragger';
import Hide from './Hide';
import logoDecorator from './Logo';
import IconLoading from './IconLoading';
import * as ENUM from './enum';
import Tooltip from './Tooltip';
import Close from './Close';

const EditText = styled.p`
  font-size: 12px;
  color: rgba(255,255,255,.85);
  line-height: 20px
  margin: 0;
  margin-left: 1px;
  text-align: center;
`;

const BubbleWrapper = styled('div')`
  background-color: ${props => (props.open ? '#30303D' : '#4c4c61')};
  height: 60px;
  width: 60px;
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
  transition: background-color 0.2s ease 0.1s, opacity 0.2s ease 0s, transform 0.2s ease 0.1s;
  &:hover {
    background-color: rgb(21, 59, 210);
    opacity: 1;
  }
`;

const CloseComponent = styled(Close)`
  position: absolute;
  top: 50%;
  user-select: none;
  color: #fff;
  transform: ${props =>
    props.open ? 'translateY(-50%)' : 'translateY(-50%) scale(0.4) rotate(-45deg);'};
  opacity: ${props => (props.open ? 1 : 0)};
  transition: all 0.3s linear;
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

  /**
   * 初始化dom
   */
  componentDidMount() {
    // eslint-disable-next-line
    this.nodeDom = ReactDOM.findDOMNode(this);
  }

  showBubble = e => {
    // 显示 bubble 时取消页面的编辑模式
    window.postMessage(
      JSON.stringify({
        action: 'umi.ui.disableBlockEditMode',
      }),
      '*',
    );
    const { toggleMiniOpen, resetEdit, edit } = this.props;
    if (edit) {
      resetEdit();
      return false;
    }
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
    } else if (e.target === this.nodeDom) {
      // not hide, show iframe
      toggleMiniOpen();
    }
  };

  // handleDrag = () => {
  //   if (this.props.open) {
  //     this.props.toggleMiniOpen(false);
  //   }
  // };

  render() {
    const { isBigfish, open, loading, children, message, locale, edit, editText } = this.props;
    const { hide } = this.state;

    const Logo = logoDecorator({ isBigfish });
    return (
      <Dragger
        open={open}
        hide={hide}
        onClick={this.showBubble}
        onOverlap={this.hideBubble}
        message={message}
        // onDrag={this.handleDrag}
        isBigfish={isBigfish}
        locale={locale}
      >
        {!edit && <Tooltip isBigfish={isBigfish} message={message} />}
        <BubbleWrapper open={open}>
          {loading && <IconLoading />}
          {edit ? (
            <EditText>{editText[locale] || editText['zh-CN'] || ''}</EditText>
          ) : (
            <>
              <Logo style={{ width: 28, height: 28 }} open={open} />
              <CloseComponent style={{ width: 20, height: 20 }} open={open} />
            </>
          )}
        </BubbleWrapper>

        {!edit && !open && <Hide onClick={this.hideBubble} />}
        {children}
      </Dragger>
    );
  }
}

export default Bubble;
