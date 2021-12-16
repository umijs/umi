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
import { Link, useLocation, useNavigate, Outlet, useAppContext, useRouteContext } from 'umi';
// import { useModel } from '@@/plugin-model';
import ProLayout, {
  PageLoading,
} from '@ant-design/pro-layout';
import './Layout.less';
import { getRightRenderContent } from './rightRender';

export default () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { clientRoutes } = useAppContext();
  return (
    <ProLayout
      route={clientRoutes[0]}
      location={location}
      title={'Ant Design Pro'/*TODO*/}
      navTheme="dark"
      siderWidth={256}
      onMenuHeaderClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        navigate('/');
      }}
      menu={{}/*TODO*/}
      formatMessage={null/*TODO*/}
      logo={null/*TODO*/}
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
      rightContentRender={
        (layoutProps) => {
          // TODO: support runtime rightRender
          return getRightRenderContent({
            runtimeLayout: {
              logout() {},
            },
            loading: false,
            initialState: {},
            setInitialState: () => {},
          });
        }
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
   runtimeLayout: any,
   loading: boolean,
   initialState: any,
   setInitialState: any,
 }) {
  const menu = (
    <Menu className="umi-plugin-layout-menu">
      <Menu.Item
        key="logout"
        onClick={() =>
          opts.runtimeLayout.logout && opts.runtimeLayout?.logout(opts.initialState)
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
      {opts.runtimeLayout.logout ? (
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
  });

  api.addLayouts(() => {
    return [
      {
        id: 'ant-design-pro-layout',
        file: withTmpPath({ api, path: 'Layout.tsx' }),
      },
    ];
  });
};
