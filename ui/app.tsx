import { PluginContainer } from '@/components/PluginContainer';
import { IAppData } from '@/hooks/useAppData';
import { globalCSS } from '@/utils/globalCSS';
import { createGlobalStyle, MicroApp } from 'umi';

export const styledComponents = {
  GlobalStyle: createGlobalStyle`
${globalCSS}

:root {
  --empty-text-color: #999;

  &.dark {
    --bg-color: #151515;
    --bg-hover-color: #333;
    --bg-active-color: #117cf3;
    --bg-active-text-color: #fff;
    --highlight-color: #117cf3;
    --text-color: #9a9a9a;
    --accent-color: #ffffff;
    --subtle-color: #303234;
    --border-color: #9a9a9a;
    --second-text-color: #ddd;
    --card-bg-color: #27212d;
  }

  --bg-color: #fff;
  --bg-hover-color: #f4f4f4;
  --bg-active-color: #e6f4ff;
  --bg-active-text-color: #117cf3;
  --highlight-color: #117cf3;
  --text-color: #333;
  --accent-color: #000;
  --subtle-color: #e8e8e8;
  --border-color: #ddd;
  --second-text-color: #666;
  --card-bg-color: #f8f8f8;
}

html, body, #root {
  height: 100%;
}

body {
  background: var(--bg-color);
  color: var(--text-color);
}

#root-master, .qiankun-micro-app-container, #__qiankun_microapp_wrapper_for_qiankun__ {
  height: 100%;
}

a {
  color: var(--text-color);
  text-decoration: none;
}
  `,
};

export const reactQuery = {
  queryClient: {
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
      },
    },
  },
};

export async function patchClientRoutes({ routes }) {
  const { modules = [] } =
    (
      await fetch('/__umi/api/app-data').then(
        (res) => res.json() as Promise<IAppData>,
      )
    )?.ui || {};
  const uiMenusAdded = modules.map((module) => module.menus || []).flat();

  routes[0].routes?.unshift(
    ...uiMenusAdded.map((menu) => {
      const { renderType } = menu;

      if (renderType === 'qiankun') {
        return {
          path: `${menu.path}/*`,
          // 防止 fixed 定位影响到外部布局
          element: (
            <div style={{ transform: 'scale(1)', height: '100%' }}>
              <MicroApp
                name={menu.name}
                base={`/__umi_ui/entry/${menu.path}`}
              />
            </div>
          ),
        };
      }

      return {
        path: `${menu.path}/*`,
        element: <PluginContainer url={menu.url} name={menu.name} />,
      };
    }),
  );
}

export async function qiankun() {
  const umiInfo = await fetch('/__umi/api/app-data').then(
    (res) => res.json() as Promise<IAppData>,
  );

  const modules = umiInfo?.ui?.modules || [];

  // 提供给子应用 umi 的信息和自定义属性
  const uiMenusQiankunAdded = modules
    .map((module) => module.menus || [])
    .flat()
    .filter((module) => module.renderType === 'qiankun')
    .map(({ name, meta, url }) => ({
      name,
      entry: url,
      props: {
        ...meta,
        umiInfo,
      },
    }));

  return {
    apps: uiMenusQiankunAdded,
  };
}
