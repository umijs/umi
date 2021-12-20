import { dirname } from 'path';
import { IApi } from 'umi';
import { resolveProjectDep } from './utils/resolveProjectDep';
import { withTmpPath } from './utils/withTmpPath';

export default (api: IApi) => {
  api.describe({
    key: 'layout',
    config: {
      schema(joi) {
        return joi.object();
      },
      onChange: api.ConfigChangeType.regenerateTmpFiles,
    },
    enableBy: api.EnableBy.config,
  });

  const pkgPath =
    resolveProjectDep({
      pkg: api.pkg,
      cwd: api.cwd,
      dep: '@ant-design/pro-layout',
    }) || dirname(require.resolve('@ant-design/pro-layout/package.json'));

  api.modifyAppData((memo) => {
    const version = require(`${pkgPath}/package.json`).version;
    memo.pluginLayout = {
      pkgPath,
      version,
    };
    return memo;
  });

  api.modifyConfig((memo) => {
    // import from @ant-design/pro-layout
    memo.alias['@ant-design/pro-layout'] = pkgPath;
    return memo;
  });

  api.onGenerateFiles(() => {
    // Layout.tsx
    api.writeTmpFile({
      path: 'Layout.tsx',
      content: `
import { Link, useLocation, useNavigate, Outlet, useAppData, useRouteContext } from 'umi';
// import { useModel } from '@@/plugin-model';
import ProLayout, {
  PageLoading,
} from '@ant-design/pro-layout';
import './Layout.less';
import Logo from './Logo';
import { getRightRenderContent } from './rightRender';

export default () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { clientRoutes, pluginManager } = useAppData();
  const userConfig = ${JSON.stringify(api.config.layout, null, 2)};
  const runtimeConfig = pluginManager.applyPlugins({
    key: 'layout',
    type: 'modify',
    initialValue: {},
  });
  return (
    <ProLayout
      route={clientRoutes[0]}
      location={location}
      title={userConfig.name || 'plugin-layout'}
      navTheme="dark"
      siderWidth={256}
      onMenuHeaderClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        navigate('/');
      }}
      menu={{ locale: userConfig.locale }}
      logo={Logo}
      menuItemRender={(menuItemProps, defaultDom) => {
        if (menuItemProps.isUrl || menuItemProps.children) {
          return defaultDom;
        }
        if (menuItemProps.path && location.pathname !== menuItemProps.path) {
          return (
            <Link to={menuItemProps.path} target={menuItemProps.target}>
              {defaultDom}
            </Link>
          );
        }
        return defaultDom;
      }}
      disableContentMargin
      fixSiderbar
      fixedHeader
      {...runtimeConfig}
      rightContentRender={
        runtimeConfig.rightContentRender !== false &&
        ((layoutProps) => {
          const dom = getRightRenderContent({
            runtimeConfig,
            loading: false,
            initialState: {},
            setInitialState: () => {},
          });
          if (runtimeConfig.rightContentRender) {
            return runtimeConfig.rightContentRender(layoutProps, dom, {
              // BREAK CHANGE userConfig > runtimeConfig
              userConfig,
              runtimeConfig,
              loading: false,
              initialState: {},
              setInitialState: () => {},
            });
          }
          return dom;
        })
      }
    >
      <Outlet />
    </ProLayout>
  );
}
      `,
    });

    api.writeTmpFile({
      path: 'rightRender.tsx',
      content: `
import React from 'react';
import { Avatar, Dropdown, Menu, Spin } from 'antd';
import { LogoutOutlined } from '@ant-design/icons';

export function getRightRenderContent (opts: {
   runtimeConfig: any,
   loading: boolean,
   initialState: any,
   setInitialState: any,
 }) {
  if (opts.runtimeConfig.rightRender) {
    return opts.runtimeConfig.rightRender(
      initialState,
      setInitialState,
      opts.runtimeConfig,
    );
  }

  const menu = (
    <Menu className="umi-plugin-layout-menu">
      <Menu.Item
        key="logout"
        onClick={() =>
          opts.runtimeConfig.logout && opts.runtimeConfig?.logout(opts.initialState)
        }
      >
        <LogoutOutlined />
        退出登录
      </Menu.Item>
    </Menu>
  );

  const avatar = (
    <span className="umi-plugin-layout-action">
        <Avatar
          size="small"
          className="umi-plugin-layout-avatar"
          src={
            opts.initialState?.avatar ||
            'https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png'
          }
          alt="avatar"
        />
        <span className="umi-plugin-layout-name">{opts.initialState?.name}</span>
      </span>
  );

  if (opts.loading) {
    return (
      <div className="umi-plugin-layout-right">
        <Spin size="small" style={{ marginLeft: 8, marginRight: 8 }} />
      </div>
    );
  }

  return (
    <div className="umi-plugin-layout-right anticon">
      {opts.runtimeConfig.logout ? (
        <Dropdown overlay={menu} overlayClassName="umi-plugin-layout-container">
          {avatar}
        </Dropdown>
      ) : (
        avatar
      )}
    </div>
  );
  // TODO: <SelectLang />
}
      `,
    });

    // Layout.less
    api.writeTmpFile({
      path: 'Layout.less',
      content: `
@import '~antd/es/style/themes/default.less';
@pro-header-hover-bg: rgba(0, 0, 0, 0.025);
@media screen and (max-width: @screen-xs) {
  // 在小屏幕的时候可以有更好的体验
  .umi-plugin-layout-container {
    width: 100% !important;
  }
  .umi-plugin-layout-container > * {
    border-radius: 0 !important;
  }
}
.umi-plugin-layout-menu {
  .anticon {
    margin-right: 8px;
  }
  .ant-dropdown-menu-item {
    min-width: 160px;
  }
}
.umi-plugin-layout-right {
  display: flex;
  float: right;
  height: 100%;
  margin-left: auto;
  overflow: hidden;
  .umi-plugin-layout-action {
    display: flex;
    align-items: center;
    height: 100%;
    padding: 0 12px;
    cursor: pointer;
    transition: all 0.3s;
    > i {
      color: @text-color;
      vertical-align: middle;
    }
    &:hover {
      background: @pro-header-hover-bg;
    }
    &:global(.opened) {
      background: @pro-header-hover-bg;
    }
  }
  .umi-plugin-layout-search {
    padding: 0 12px;
    &:hover {
      background: transparent;
    }
  }
}
.umi-plugin-layout-name {
  margin-left: 8px;
}
      `,
    });

    api.writeTmpFile({
      path: 'Logo.tsx',
      content: `
import React from 'react';

const LogoIcon: React.FC = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="32"
      height="32"
      viewBox="0 0 200 200"
    >
      <defs>
        <linearGradient
          id="linearGradient-1"
          x1="62.102%"
          x2="108.197%"
          y1="0%"
          y2="37.864%"
        >
          <stop offset="0%" stopColor="#4285EB"></stop>
          <stop offset="100%" stopColor="#2EC7FF"></stop>
        </linearGradient>
        <linearGradient
          id="linearGradient-2"
          x1="69.644%"
          x2="54.043%"
          y1="0%"
          y2="108.457%"
        >
          <stop offset="0%" stopColor="#29CDFF"></stop>
          <stop offset="37.86%" stopColor="#148EFF"></stop>
          <stop offset="100%" stopColor="#0A60FF"></stop>
        </linearGradient>
        <linearGradient
          id="linearGradient-3"
          x1="69.691%"
          x2="16.723%"
          y1="-12.974%"
          y2="117.391%"
        >
          <stop offset="0%" stopColor="#FA816E"></stop>
          <stop offset="41.473%" stopColor="#F74A5C"></stop>
          <stop offset="100%" stopColor="#F51D2C"></stop>
        </linearGradient>
        <linearGradient
          id="linearGradient-4"
          x1="68.128%"
          x2="30.44%"
          y1="-35.691%"
          y2="114.943%"
        >
          <stop offset="0%" stopColor="#FA8E7D"></stop>
          <stop offset="51.264%" stopColor="#F74A5C"></stop>
          <stop offset="100%" stopColor="#F51D2C"></stop>
        </linearGradient>
      </defs>
      <g fill="none" fillRule="evenodd" stroke="none" strokeWidth="1">
        <g transform="translate(-20 -20)">
          <g transform="translate(20 20)">
            <g>
              <g fillRule="nonzero">
                <g>
                  <path
                    fill="url(#linearGradient-1)"
                    d="M91.588 4.177L4.18 91.513a11.981 11.981 0 000 16.974l87.408 87.336a12.005 12.005 0 0016.989 0l36.648-36.618c4.209-4.205 4.209-11.023 0-15.228-4.208-4.205-11.031-4.205-15.24 0l-27.783 27.76c-1.17 1.169-2.945 1.169-4.114 0l-69.802-69.744c-1.17-1.169-1.17-2.942 0-4.11l69.802-69.745c1.17-1.169 2.944-1.169 4.114 0l27.783 27.76c4.209 4.205 11.032 4.205 15.24 0 4.209-4.205 4.209-11.022 0-15.227L108.581 4.056c-4.719-4.594-12.312-4.557-16.993.12z"
                  ></path>
                  <path
                    fill="url(#linearGradient-2)"
                    d="M91.588 4.177L4.18 91.513a11.981 11.981 0 000 16.974l87.408 87.336a12.005 12.005 0 0016.989 0l36.648-36.618c4.209-4.205 4.209-11.023 0-15.228-4.208-4.205-11.031-4.205-15.24 0l-27.783 27.76c-1.17 1.169-2.945 1.169-4.114 0l-69.802-69.744c-1.17-1.169-1.17-2.942 0-4.11l69.802-69.745c2.912-2.51 7.664-7.596 14.642-8.786 5.186-.883 10.855 1.062 17.009 5.837L108.58 4.056c-4.719-4.594-12.312-4.557-16.993.12z"
                  ></path>
                </g>
                <path
                  fill="url(#linearGradient-3)"
                  d="M153.686 135.855c4.208 4.205 11.031 4.205 15.24 0l27.034-27.012c4.7-4.696 4.7-12.28 0-16.974l-27.27-27.15c-4.218-4.2-11.043-4.195-15.254.013-4.209 4.205-4.209 11.022 0 15.227l18.418 18.403c1.17 1.169 1.17 2.943 0 4.111l-18.168 18.154c-4.209 4.205-4.209 11.023 0 15.228z"
                ></path>
              </g>
              <ellipse
                cx="100.519"
                cy="100.437"
                fill="url(#linearGradient-4)"
                rx="23.6"
                ry="23.581"
              ></ellipse>
            </g>
          </g>
        </g>
      </g>
    </svg>
  );
};

export default LogoIcon;
      `,
    });
  });

  api.addLayouts(() => {
    return [
      {
        id: 'ant-design-pro-layout',
        file: withTmpPath({ api, path: 'Layout.tsx' }),
      },
    ];
  });

  api.addRuntimePluginKey(() => ['layout']);
};
