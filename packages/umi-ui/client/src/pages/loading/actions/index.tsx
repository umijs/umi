import React from 'react';
import DepsInstall from '@/components/DepsInstall';

export interface IHandler {
  type: string;
  path: string;
}

export default {
  '@@actions/reInstallDependencies': props => (
    <DepsInstall installType="reinstall" type="primary" {...props}>
      重装依赖
    </DepsInstall>
  ),
  '@@actions/installDependencies': props => (
    <DepsInstall installType="install" type="primary" {...props}>
      安装依赖
    </DepsInstall>
  ),
};
