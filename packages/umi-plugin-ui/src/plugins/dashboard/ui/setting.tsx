import * as React from 'react';
import cls from 'classnames';
import { Drawer, List, Avatar, Switch } from 'antd';
import Context from './context';
import styles from './setting.less';

const { useEffect } = React;

const Setting: React.FC<{}> = (props, ref) => {
  const { api } = React.useContext(Context);
  const { visible, closeDrawer, openDrawer, ...restConfig } = ref.current;
  const [list, setList] = React.useState();

  useEffect(() => {
    const getSettings = async () => {
      const res = await api.callRemote({
        type: 'org.umi.dashboard.card.list',
      });
      setList(res || []);
    };
    getSettings();
  }, []);
  return (
    <Drawer visible={visible} onClose={closeDrawer} title="面板设置" {...restConfig}>
      <List
        dataSource={list || []}
        loading={!list}
        renderItem={item => (
          <List.Item
            className={styles.item}
            extra={<Switch size="small" defaultChecked={!!item.enable} />}
          >
            <List.Item.Meta
              avatar={
                <Avatar src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png" />
              }
              title={item.title}
              description={item.description}
            />
          </List.Item>
        )}
      />
    </Drawer>
  );
};

export default React.forwardRef(Setting);
