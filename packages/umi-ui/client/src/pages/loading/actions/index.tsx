import React from 'react';
import { Button } from 'antd';
import { handleBack } from '@/utils';
import intl from '@/utils/intl';
import DepsInstall from '@/components/DepsInstall';
import OpenFile from './openFile';

export interface IHandler {
  type: string;
  path: string;
}

export default {
  '@@actions/reInstallDependencies': props => (
    <DepsInstall
      installType="reinstall"
      loadingChild={intl({ id: 'org.umi.ui.loading.deps.installing' })}
      {...props}
    />
  ),
  '@@actions/installDependencies': props => (
    <DepsInstall
      installType="install"
      loadingChild={intl({ id: 'org.umi.ui.loading.deps.installing' })}
      {...props}
    />
  ),
  BACK_TO_HOME: props => (
    <Button onClick={() => handleBack()} type={props.type}>
      {props.children}
    </Button>
  ),
  '@@actions/openConfigFile': OpenFile,
  '@@actions/openProjectInEditor': OpenFile,
  '@@project/openInEditor': OpenFile,
};
