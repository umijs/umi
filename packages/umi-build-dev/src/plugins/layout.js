import { join } from 'path';
import { existsSync } from 'fs';

export default function(api) {
  const { paths } = api.service;
  const { winPath } = api.utils;

  api.register('modifyRouterFile', ({ memo }) => {
    const layoutPath = join(paths.absSrcPath, 'layouts/index.js');
    if (existsSync(layoutPath)) {
      return memo
        .replace(
          '<%= codeForPlugin %>',
          `
import Layout from '${winPath(layoutPath)}';
<%= codeForPlugin %>
        `.trim(),
        )
        .replace(
          '<%= routeComponents %>',
          `
<Layout><%= routeComponents %></Layout>
        `.trim(),
        );
    } else {
      return memo;
    }
  });

  api.register('modifyPageWatchers', ({ memo }) => {
    return [...memo, join(paths.absSrcPath, 'layouts/index.js')];
  });
}
