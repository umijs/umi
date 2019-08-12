import React, { Fragment } from 'react';
import { Spin, Button } from 'antd';
import styles from './index.less';
import Fail from './fail';

interface ILoadingProps {
  data?: object;
  message?: string;
  error?: {
    message: string;
  };
}

interface ILoadingState {
  isError?: boolean;
  actionLoading?: boolean;
}

export default class Loading extends React.Component<ILoadingProps, ILoadingState> {
  constructor(props: ILoadingProps) {
    super(props);
    this.state = {
      isError: !!this.props.error,
    };
  }

  handleInstallDeps = () => {
    this.setState({
      actionLoading: true,
    });
    setTimeout(() => {
      // TODO
      this.setState({
        actionLoading: false,
      });
    }, 3000);
  };

  render() {
    const { error } = this.props;
    const { isError, actionLoading } = this.state;

    const actionsDeps = (
      <Button onClick={this.handleInstallDeps} loading={actionLoading} type="primary">
        {actionLoading ? '依赖安装中...' : '安装依赖'}
      </Button>
    );

    return (
      <div className={styles.loading}>
        {isError ? (
          <Fail title="打开项目失败" description={error.message || ''} actions={actionsDeps} />
        ) : (
          <Fragment>
            <div className={styles['loading-spin']}>
              <Spin size="large" />
              <p>正在打开项目</p>
            </div>
          </Fragment>
        )}
      </div>
    );
  }
}
