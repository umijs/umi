import type { IAppData } from '@/hooks/useAppData';
import { getRegisterTime } from '@/utils/getPluginRegisterTime';
import { Input, List, Switch, Tag } from 'antd';
import { FC, useMemo, useState } from 'react';
import { Icon, styled } from 'umi';

interface IProps {
  plugins: IAppData['plugins'];
}

const SwitchContainer = styled.div`
  .switch-container {
    margin-bottom: 1rem;
    display: flex;
    align-items: center;

    .ant-switch {
      margin-right: 0.5rem;
      background: var(--text-color);

      &-checked {
        background: var(--highlight-color);
      }
    }
  }
`;

const SearchContainer = styled.div`
  background: var(--bg-color);

  .ant-input-affix-wrapper {
    background: var(--bg-color);
    border-color: var(--text-color);
  }

  .ant-input {
    background: var(--bg-color);
    color: var(--text-color);
  }

  .search-icon {
    margin-right: 0.5rem;
    color: var(--text-color);
  }
`;

const ListContainer = styled.div`
  margin-top: 2rem;
  max-height: ${window.innerHeight - 176}px;
  overflow-y: auto;

  .ant-list-item {
    color: var(--text-color);
    border-color: var(--text-color);
  }

  .ant-list-item {
    padding-left: 1rem;

    &:last-child {
      border-block-end: 1px solid var(--text-color);
    }
  }

  .item-content {
    &-title {
      font-weight: 600;
      color: #fff;

      &-name {
        margin-right: 1rem;
      }
    }

    &-path {
      margin-top: 0.5rem;
    }
  }
`;

const innerPluginList = [
  '@umijs/core',
  '@umijs/preset-umi',
  'virtual:',
  '@umijs/plugin-run',
  '@umijs/did-you-know',
];

export const PluginList: FC<IProps> = ({ plugins }) => {
  const [showUmiPlugin, setShowUmiPlugin] = useState(false);
  const [ipt, setIpt] = useState('');

  const pluginList = useMemo(() => {
    const keys = Object.keys(plugins);
    // 筛选搜索字段、是否内部插件、计算插件耗时
    return keys
      .filter((k) => {
        return k.indexOf(ipt) > -1;
      })
      .filter((k) => {
        if (showUmiPlugin) {
          return true;
        }
        return innerPluginList.every((str) => !k.startsWith(str));
      })
      .map((k) => {
        const plugin = plugins[k];
        const totalTime = getRegisterTime(plugin);
        return {
          name: k,
          totalTime,
          ...plugin,
        };
      })
      .sort((p1, p2) => p2.totalTime - p1.totalTime);
  }, [plugins, showUmiPlugin, ipt]);

  return (
    <div>
      <SwitchContainer>
        <div className="switch-container">
          <Switch onChange={setShowUmiPlugin} />
          show inner plugins
        </div>
      </SwitchContainer>
      <SearchContainer>
        <Input
          size="large"
          value={ipt}
          onChange={(e) => setIpt(e.target.value)}
          prefix={
            <Icon
              width="24"
              height="24"
              icon="ant-design:search-outlined"
              className="search-icon"
            />
          }
        />
      </SearchContainer>
      <ListContainer>
        <List
          itemLayout="horizontal"
          dataSource={pluginList}
          renderItem={(item) => (
            <List.Item>
              <div className="item-content">
                <div className="item-content-title">
                  <span className="item-content-title-name">{item.name}</span>
                  <Tag color="blue">{item.key}</Tag>
                  {item.totalTime ? (
                    <Tag color="red">{item.totalTime}ms</Tag>
                  ) : null}
                </div>
                {item.path ? (
                  <div className="item-content-path">{item.path}</div>
                ) : null}
              </div>
            </List.Item>
          )}
        />
      </ListContainer>
    </div>
  );
};
