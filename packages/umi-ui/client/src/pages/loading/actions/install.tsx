import * as React from 'react';
import cls from 'classnames';
import { IHandler } from './index';

export interface InstallProps extends IHandler {
  payload: {
    npmClient?: boolean;
    projectPath: string;
  };
}

const Install: React.SFC<InstallProps> = props => {
  const { type, payload, path } = props;
  const { npmClient, projectPath } = payload;

  return <div>Hello</div>;
};

export default Install;
