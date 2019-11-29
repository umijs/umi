import * as React from 'react';
import { Button } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import Context from './context';
import SettingDrawer from './setting';
import useDrawer from './hooks/useDrawer';

const ConfigAction: React.FC<{}> = props => {
  const { api } = React.useContext(Context);
  const { _analyze } = api;
  const drawerRef = useDrawer({
    width: 308,
    bodyStyle: {
      padding: '12px 24px',
    },
  });
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
      <Button size={api.mini ? 'small' : 'default'} onClick={handleSetting}>
        <SettingOutlined />
      </Button>
      <SettingDrawer ref={drawerRef} />
    </>
  );
};

export default ConfigAction;
