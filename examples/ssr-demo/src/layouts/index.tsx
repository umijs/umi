import { createCache, extractStyle, StyleProvider } from '@ant-design/cssinjs';
import { useState } from 'react';
import { Outlet, useServerInsertedHTML } from 'umi';

export default function Layout() {
  const [cssCache] = useState(() => createCache());

  useServerInsertedHTML(() => {
    const style = extractStyle(cssCache, { plain: true });
    return (
      <style
        id="antd-cssinjs"
        dangerouslySetInnerHTML={{ __html: style }}
      ></style>
    );
  });

  return (
    <StyleProvider cache={cssCache}>
      <Outlet />
    </StyleProvider>
  );
}
