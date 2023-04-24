import { PluginContainer } from '@/components/PluginContainer';
import { globalCSS } from '@/utils/globalCSS';
import { createGlobalStyle } from 'umi';

export const styledComponents = {
  GlobalStyle: createGlobalStyle`
${globalCSS}

:root {
  --bg-color: #151515;
  --bg-hover-color: #1c1c1d;
  --highlight-color: #117cf3;
  --text-color: #9a9a9a;
  --accent-color: #ffffff;
  --subtle-color: #303234;
}

html, body, #root {
  height: 100%;
}

body {
  background: var(--bg-color);
  color: var(--text-color);
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
  const {
    ui: { uiMenusAdded = [] },
  } = (await fetch('/__umi/api/app-data').then((res) => res.json())) || {
    ui: {},
  };

  routes[0].routes?.unshift(
    ...uiMenusAdded.map((menu: any) => ({
      path: menu.path,
      element: <PluginContainer url={menu.url} name={menu.name} />,
    })),
  );
}
