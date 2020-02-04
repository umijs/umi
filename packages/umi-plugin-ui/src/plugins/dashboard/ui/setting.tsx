import * as React from 'react';
import cls from 'classnames';
import { Drawer, List, Switch, Typography } from 'antd';
import Context from './context';
import { renderAvatar, MESSAGES } from './index';
import styles from './setting.module.less';

const { Paragraph } = Typography;

const Setting: React.FC<{}> = (props, ref) => {
  const { api, dbPath, cards, setCardSettings } = React.useContext(Context);
  const { visible, closeDrawer, openDrawer, className, ...restConfig } = ref.current;

  const handleOnChange = async (key, checked) => {
    const result = await api.callRemote({
      type: 'org.umi.dashboard.card.list.change',
      payload: {
        dbPath,
        key,
        enable: !!checked,
      },
    });
    api.event.emit(MESSAGES.CHANGE_CARDS, result);
    setCardSettings(result);
  };

  const drawerCls = cls(className, styles.drawer);

  return (
    <Drawer
      className={drawerCls}
      visible={visible}
      onClose={closeDrawer}
      title={api.intl({ id: 'org.umi.ui.dashboard.settings.title' })}
      {...restConfig}
    >
      <List
        dataSource={cards || []}
        loading={!cards}
        className={styles.list}
        bordered={false}
        split={false}
        renderItem={item => (
          <List.Item
            key={item.key}
            className={styles.item}
            extra={
              <Switch
                style={{ marginLeft: 8 }}
                size="small"
                onChange={checked => handleOnChange(item.key, checked)}
                defaultChecked={!!item.enable}
              />
            }
          >
            <List.Item.Meta
              avatar={renderAvatar(item, api.mini)}
              title={item.title}
              description={<Paragraph ellipsis>{item.description}</Paragraph>}
            />
          </List.Item>
        )}
      />
    </Drawer>
  );
};

export default React.forwardRef(Setting);
