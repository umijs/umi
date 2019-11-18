import * as React from 'react';
import { Button } from 'antd';
import { Setting as SettingIcon } from '@ant-design/icons';
import Context from './context';
import SettingDrawer from './setting';
import useDrawer from './hooks/useDrawer';

const ConfigAction: React.FC<{}> = props => {
  const { api } = React.useContext(Context);
  const { intl, mini, launchEditor, _analyze } = api;
  const { FormattedMessage } = intl;
  const drawerRef = useDrawer({
    width: 308,
    bodyStyle: {
      padding: '12px 24px',
    },
  });
  const handleLaunchEditor = () => {
    launchEditor({
      type: 'project',
    });
  };
  const handleSetting = () => {
    drawerRef.current.openDrawer();
    // open setting log
    const { gtag } = _analyze;
    gtag('event', 'click_actions', {
      event_category: 'dashboard',
      event_label: '配置',
    });
  };

  return (
    <>
      {!mini && (
        <Button onClick={handleLaunchEditor}>
          <FormattedMessage id="org.umi.ui.dashboard.launch.editor" />
        </Button>
      )}
      <Button size={api.mini ? 'small' : 'default'} onClick={handleSetting}>
        <SettingIcon />
      </Button>
      <SettingDrawer ref={drawerRef} />
    </>
  );
};

export default ConfigAction;
