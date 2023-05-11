import { innerPluginList } from '@/contants';
import type { IAppData } from '@/hooks/useAppData';
import { getRegisterTime } from '@/utils/getPluginRegisterTime';
import { Input, List, Popover, Switch, Tag } from 'antd';
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
      background: var(--border-color);

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
    border-color: var(--border-color);
  }

  .ant-input {
    background: var(--bg-color);
    color: var(--text-color);
  }

  .search-icon {
    margin-right: 0.5rem;
    color: var(--second-text-color);
  }
`;

const ListContainer = styled.div`
  margin-top: 2rem;
  max-height: ${window.innerHeight - 176}px;
  overflow-y: auto;

  .ant-list-item {
    color: var(--text-color);
    border-color: var(--border-color);
  }

  .ant-list-item {
    padding-left: 1rem;

    &:last-child {
      border-block-end: 1px solid var(--border-color);
    }
  }

  .ant-empty-description {
    color: var(--empty-text-color);
  }

  .item-content {
    &-title {
      font-weight: 600;
      color: var(--text-color);

      &-name {
        margin-right: 1rem;
      }
    }

    &-path {
      margin-top: 0.5rem;
    }
  }
`;

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
        const { totalTime, detail } = getRegisterTime(plugin);
        const detailTxt = Object.keys(detail).map((k) => (
          <div key={k}>
            {k}: {detail[k]}ms
          </div>
        ));
        return {
          name: k,
          totalTime,
          detailTxt,
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
                    <Tag color="red">
                      <Popover content={item.detailTxt}>
                        <div
                          style={{
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                          }}
                        >
                          {item.totalTime}ms
                          <Icon
                            width="14"
                            height="14"
                            icon="ant-design:info-circle-outlined"
                            style={{
                              marginLeft: '.25rem',
                            }}
                          />
                        </div>
                      </Popover>
                    </Tag>
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
