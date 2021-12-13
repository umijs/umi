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
import { Link, useLocation, useNavigate, Outlet, useRouteContext } from 'umi';
// import { useModel } from '@@/plugin-model';
import ProLayout, {
  PageLoading,
} from '@ant-design/pro-layout';
import './Layout.less';

export default () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { route } = useRouteContext();
  return (
    <ProLayout
      route={route}
      location={location}
      title={'test'/*TODO*/}
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
    >
      <Outlet />
    </ProLayout>
  );
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
  :global(.anticon) {
    margin-right: 8px;
  }
  :global(.ant-dropdown-menu-item) {
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
