import React, { useContext } from 'react';
import { IUiApi } from 'umi-types';
import BasicConfig from './components/BasicConfig';
import Context from './Context';
import styles from './index.module.less';

interface IConfigManager {
  api: IUiApi;
}

function getSections(api: IUiApi) {
  const sections = [
    {
      key: 'project',
      title: api.intl('org.umi.ui.configuration.project.config.title'),
      icon: (
        <img
          src="https://img.alicdn.com/tfs/TB1aqdSeEY1gK0jSZFMXXaWcVXa-64-64.png"
          width={32}
          height={32}
        />
      ),
      description: api.intl('org.umi.ui.configuration.project.config.desc'),
      component: () => <BasicConfig api={api} />,
    },
  ];
  return sections;
}

const ConfigManager: React.SFC<IConfigManager> = ({ api }) => {
  const { TwoColumnPanel, getContext, debug } = api;
  const { theme } = useContext(getContext());
  return (
    <Context.Provider
      value={{
        api,
        debug: debug.extend('configuration'),
        theme,
      }}
    >
      <TwoColumnPanel
        disableRightOverflow
        className={styles.configuration}
        sections={getSections(api)}
      />
    </Context.Provider>
  );
};

export default ConfigManager;
