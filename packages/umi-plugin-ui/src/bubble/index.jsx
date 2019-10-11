import React from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';
import isMobile from 'is-mobile';
import { callRemote, init as initSocket } from './socket';
import { getLocale } from './utils';
import messages from './bubble-locale';
import Bubble from './Bubble';
import Modal from './Modal';
import Loading from './Loading';
import Error from './Error';
import ErrorBoundary from './ErrorBoundary';

const winPath = input => {
  if (!input) {
    return '';
  }
  const isExtendedLengthPath = /^\\\\\?\\/.test(input);

  if (isExtendedLengthPath) {
    return input;
  }

  return input.replace(/\\/g, '/');
};

const LoadingWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  text-align: center;
  color: #fff;
  height: 100%;
  font-size: 14px;
`;

class App extends React.Component {
  constructor(props) {
    super(props);
    const locale = getLocale();
    this.state = {
      open: undefined,
      connected: false,
      uiLoaded: false,
      loading: false,
      currentProject: props.currentProject,
      locale,
      edit: false,
      editText: {},
    };
    window.addEventListener('message', this.handleMessage, false);
  }

  handleLocale = locale => {
    this.setState({
      locale,
    });
  };

  componentDidUpdate() {
    const nextLocale = getLocale();
    if (this.state.locale !== nextLocale) {
      this.handleLocale(nextLocale);
    }
  }

  componentWillUnmount() {
    window.removeEventListener('message', this.handleMessage, false);
  }

  getMiniUrl = () => {
    const { port } = this.props;
    const { currentProject } = this.state;
    return `http://127.0.0.1:${port}/?mini&${
      currentProject && currentProject.key ? `&key=${currentProject.key}` : ''
    }`;
  };

  handleMessage = event => {
    try {
      const { action, payload = {} } = JSON.parse(event.data);
      switch (action) {
        // 编辑态改变文字
        case 'umi.ui.changeEdit': {
          this.setState({
            edit: true,
            editText: payload,
          });
          break;
        }
        // 显示 mini
        case 'umi.ui.showMini': {
          this.setState({
            open: true,
            edit: false,
            editText: {},
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
        // 切换loading
        case 'umi.ui.toggleIconLoading': {
          this.setState(({ loading }) => ({
            loading: !loading,
          }));
          break;
        }
        default:
        // no thing
      }
    } catch (_) {
      // no thing
    }
    return false;
  };

  async componentDidMount() {
    const { port, path } = this.props;
    try {
      await initSocket(`http://localhost:${port}/umiui`, {
        onError: () => {
          this.setState({
            connected: false,
          });
        },
        onMessage: ({ type, payload }) => {
          // 区分不同项目
          if (!payload || winPath(payload.projectPath) !== winPath(path)) return;

          switch (type) {
            case 'org.umi.ui.bubble.showLoading':
              this.setState({
                loading: true,
              });
              break;
            case 'org.umi.ui.bubble.hideLoading':
              this.setState({
                loading: false,
              });
              break;
            default:
              break;
          }
        },
      });
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

  initUIService = async () => {
    const { currentProject, path } = this.props;
    // console.log('currentProject', currentProject);
    if (this.state.connected) {
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
    }
  };

  closeModal = e => {
    e.stopPropagation();
    this.setState({
      open: false,
    });
  };

  onIframeLoad = () => {
    this.setState({
      uiLoaded: true,
    });
  };

  toggleMiniOpen = async open => {
    if (open) {
      this.setState({
        open,
      });
      return;
    }
    // or use toggle
    if (typeof this.state.open === 'undefined') {
      await this.initUIService();
    }
    this.setState(prevState => ({
      open: !prevState.open,
    }));
  };

  resetEdit = () => {
    this.setState({
      edit: false,
      editText: {},
    });
  };

  render() {
    const { open, connected, uiLoaded, loading, locale, edit, editText } = this.state;
    const { isBigfish = false } = this.props;
    const miniUrl = this.getMiniUrl();
    // get locale when first render
    // switch in the project can't be listened, the lifecycle can't be trigger
    // TODO: use Context but need to compatible with other React version
    const message = messages[locale] || messages['zh-CN'];

    return (
      <Bubble
        isBigfish={isBigfish}
        // TODO: loading when currentProject not loaded
        toggleMiniOpen={this.toggleMiniOpen}
        resetEdit={this.resetEdit}
        open={open}
        loading={loading}
        message={message}
        edit={edit}
        editText={editText}
        locale={locale}
      >
        {open !== undefined && (
          <Modal visible={open}>
            {!uiLoaded && (
              <LoadingWrapper>
                <Loading />
                <p style={{ marginTop: 8 }}>{message.loading}</p>
              </LoadingWrapper>
            )}
            {!connected ? (
              <Error message={message} isBigfish={isBigfish} />
            ) : (
              <iframe
                id="umi-ui-bubble"
                onLoad={this.onIframeLoad}
                style={{ width: '100%', height: '100%' }}
                // localhost maybe hard code
                src={miniUrl}
                frameBorder="0"
                scrolling="no"
                seamless="seamless"
                title="iframe_umi_ui"
              />
            )}
          </Modal>
        )}
      </Bubble>
    );
  }
}

const doc = window.document;
const node = doc.createElement('div');
doc.body.appendChild(node);

export default props => {
  if (!isMobile(navigator.userAgent)) {
    ReactDOM.render(
      <ErrorBoundary>
        <App {...props} />
      </ErrorBoundary>,
      node,
    );
  }
};
