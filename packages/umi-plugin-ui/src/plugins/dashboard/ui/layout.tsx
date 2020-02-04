import React from 'react';
import p from 'immer';
import Context from './context';

const Layout = props => {
  const { api, children } = props;
  // 用户 cards 开关状态
  const [cardSettings, setCardSettings] = React.useState<any[]>([]);
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
        setCardSettings(list || []);
      } catch (e) {
        console.error('getDashboardSettings error', e);
      } finally {
        setLoading(false);
      }
    };
    getDashboardSettings();
  }, []);
  const cards = (api.getDashboard() || []).map(card => {
    const { key } = card;
    const cardSetting = cardSettings.find(item => item.key === key);
    const enable = cardSetting ? !!cardSetting.enable : true;
    return {
      ...card,
      enable,
    };
  });
  // 根据开启顺序，排列展示顺序
  const dashboardCards = p(cards, draft => {
    draft.sort((next, prev) => {
      const nextIndex = cardSettings.findIndex(cardSetting => cardSetting.key === next.key);
      const prevIndex = cardSettings.findIndex(cardSetting => cardSetting.key === prev.key);
      return nextIndex - prevIndex;
    });
  });

  const contextValue = {
    api,
    dbPath,
    cards,
    dashboardCards,
    loading,
    setCardSettings,
  };
  return <Context.Provider value={contextValue}>{children}</Context.Provider>;
};

export default Layout;
