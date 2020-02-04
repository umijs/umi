import React, { useContext } from 'react';
import { IUiApi } from 'umi-types';
import Context from './Context';
import styles from './index.module.less';

interface IConfigManager {
  api: IUiApi;
}

function getSections(api: IUiApi) {
  const { ConfigForm, getBasicUI = () => ({}) } = api;
  const basicUI = getBasicUI();
  const sections = [
    {
      key: 'project',
      title: 'org.umi.ui.configuration.project.config.title',
      icon: (
        <img
          src="https://img.alicdn.com/tfs/TB1aqdSeEY1gK0jSZFMXXaWcVXa-64-64.png"
          width={api.mini ? 24 : 32}
          height={api.mini ? 24 : 32}
        />
      ),
      description: () =>
        api.intl(
          {
            id: 'org.umi.ui.configuration.project.config.desc',
          },
          {
            library: basicUI.name || 'Umi',
          },
        ),
      component: () => (
        <ConfigForm
          title="org.umi.ui.configuration.project.config.title"
          list="org.umi.config.list"
          edit="org.umi.config.edit"
        />
      ),
    },
    ...api.service.configSections,
  ];
  return sections;
}

const ConfigManager: React.SFC<IConfigManager> = ({ api }) => {
  const { TwoColumnPanel, getContext, debug, intl } = api;
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
