import {
  App,
  Button,
  MappingAlgorithm,
  Space,
  Switch,
  theme,
  version,
} from 'antd';
import type { ConfigProviderProps } from 'antd/es/config-provider';
import { useState } from 'react';
import {
  getLocale,
  setLocale,
  useAntdConfig,
  useAntdConfigSetter,
  useIntl,
} from 'umi';
const { useToken, darkAlgorithm, defaultAlgorithm, compactAlgorithm } = theme;

const checkHasAlgorithm = (
  antdConfig: ConfigProviderProps,
  algorithm: MappingAlgorithm,
) => {
  const nowAlgorithm = Array.isArray(antdConfig?.theme?.algorithm)
    ? antdConfig?.theme?.algorithm
    : [antdConfig?.theme?.algorithm];
  return nowAlgorithm?.includes(algorithm);
};

export default function Page() {
  const setAntdConfig = useAntdConfigSetter();
  const antdConfig = useAntdConfig();
  const [isZh, setIsZh] = useState(true);
  // 若要使用 useApp hook，须先在 antd 插件中配置 appConfig
  const { message, modal } = App.useApp();
  const locale = getLocale();
  const { token } = useToken();

  const showModal = () => {
    modal.confirm({
      title: 'Hai',
      content: '注意 Modal 内的按钮样式应该和页面中的按钮样式一致',
      maskClosable: true,
    });
  };
  const intl = useIntl();
  const msg = intl.formatMessage({
    id: 'HELLO',
  });
  const sayHai = () => {
    // .umirc.ts 中配置了 appConfig.message.maxCount = 3
    // app.txt 中配置了 appConfig.message.duration = 5
    message.info('Hai');
  };
  const isDark = checkHasAlgorithm(antdConfig, darkAlgorithm);
  const isCompact = checkHasAlgorithm(antdConfig, compactAlgorithm);
  return (
    <div
      style={{
        backgroundColor: token.colorBgContainer,
        height: '100vh',
      }}
    >
      {Math.random()}
      <h1>with antd@{version}</h1>
      <Space>
        <Button onClick={sayHai}>Say Hai</Button>
        <Button type="primary" onClick={showModal}>
          Open Modal
        </Button>
        locale:{locale}
        <Button
          onClick={() => {
            setIsZh(!isZh);
            setLocale(isZh ? 'en-US' : 'zh-CN', false);
          }}
        >
          {msg}
        </Button>
      </Space>
      <Space>
        isDarkTheme
        <Switch
          checked={isDark}
          onChange={(data) => {
            setAntdConfig({
              theme: {
                algorithm: [
                  data ? darkAlgorithm : defaultAlgorithm,
                  isCompact && compactAlgorithm,
                ].filter(Boolean) as MappingAlgorithm[],
              },
            });
          }}
        ></Switch>
      </Space>
      <Space>
        isCompactTheme
        <Switch
          checked={isCompact}
          onChange={(data) => {
            setAntdConfig({
              theme: {
                algorithm: [
                  isDark ? darkAlgorithm : defaultAlgorithm,
                  data && compactAlgorithm,
                ].filter(Boolean) as MappingAlgorithm[],
              },
            });
          }}
        ></Switch>
      </Space>
    </div>
  );
}
