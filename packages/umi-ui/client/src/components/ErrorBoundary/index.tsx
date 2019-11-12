import * as React from 'react';
import get from 'lodash/get';
import { Result, Typography } from 'antd';
import cls from 'classnames';
import { CloseCircle } from '@ant-design/icons';
import { formatMessage } from 'umi-plugin-react/locale';
import styles from './index.less';

const { Paragraph } = Typography;

interface IError {
  componentStack?: string;
  error?: string;
  [key: string]: any;
}

interface IState {
  hasError?: boolean;
  error?: string;
  info?: {
    componentStack?: string;
  };
}

export interface IProps {
  className?: string;
  /** 是否开启，默认 true */
  enable?: boolean;
  /** 发生错误后的回调（可做一些错误日志上报，打点等） */
  onError?: (error: Error, info: any) => void;
  /** 发生错误后展示的组件，接受 error */
  ErrorComponent?: (error: IError) => React.ReactElement<any>;
}

const defaultFallbackComponent = ({ componentStack, error, className }) => (
  <Result
    className={cls(styles.result, className)}
    status="error"
    title={formatMessage({ id: 'org.umi.ui.global.error.title' })}
    subTitle={error.toString()}
  >
    <Paragraph className={styles.stack}>
      <CloseCircle /> {formatMessage({ id: 'org.umi.ui.global.error.stack' })}：
      <pre>{componentStack}</pre>
    </Paragraph>
  </Result>
);

class UmiErrorBoundary extends React.Component<IProps, IState> {
  static defaultProps = {
    ErrorComponent: defaultFallbackComponent,
    onError: null,
    enable: true,
  };
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: '',
      info: null,
    };
  }
  componentDidCatch(error, info) {
    const frameworkName = window.g_service.basicUI.name || 'Umi';
    this.setState({
      error,
      info,
    });
    const { onError } = this.props;
    if (onError && typeof onError === 'function') {
      onError(error, info);
    }
    if (get(window, 'Tracert.logError')) {
      const err = new Error(
        error.message ? `${frameworkName}: ${JSON.stringify(error.message)}` : '',
      );
      const umiVersion = get(window, 'g_umi.version', '');
      const bigfishVersion = get(window, 'g_bigfish.version', '');
      const logParams = {
        // framework use umi ui
        d1: frameworkName,
        // framework version
        d2: window.g_bigfish
          ? `bigfish: ${bigfishVersion}, umi: ${umiVersion}`
          : `umi: ${umiVersion}`,
      };
      window.Tracert.logError(err, logParams);
    }
  }
  render() {
    const { children, ErrorComponent, enable, ...restProps } = this.props;
    const { hasError, error, info } = this.state;
    if (hasError && enable) {
      return (
        <ErrorComponent
          {...restProps}
          componentStack={info ? info.componentStack : ''}
          error={error}
        />
      );
    }
    return children;
  }
}

export default UmiErrorBoundary;
