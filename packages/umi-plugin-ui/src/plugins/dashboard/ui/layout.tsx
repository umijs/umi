import React from 'react';
import Context from './context';

const Layout = props => {
  const { api, children } = props;
  // 用户 cards 开关状态
  const [cardSettings, setCardSettings] = React.useState<object>({});
  const [loading, setLoading] = React.useState(true);
  const [dbPath, setDbPath] = React.useState('');
  React.useLayoutEffect(() => {
    const getDashboardSettings = async () => {
      try {
        const path = await api.getSharedDataDir();
        const list = await api.callRemote({
          type: 'org.umi.dashboard.card.list',
          payload: {
            dbPath: path,
          },
        });
        setDbPath(path);
        setCardSettings(list);
      } catch (e) {
        console.error('eeee', e);
      } finally {
        setLoading(false);
      }
    };
    getDashboardSettings();
  }, []);
  const cards = api.getDashboard() || [];

  const dashboardCards = cards.map(card => ({
    ...card,
    enable: api._.get(cardSettings[`${card.key}`], 'enable', true),
  }));
  const contextValue = {
    api,
    dbPath,
    dashboardCards,
    loading,
    setCardSettings,
  };
  return <Context.Provider value={contextValue}>{children}</Context.Provider>;
};

export default Layout;
