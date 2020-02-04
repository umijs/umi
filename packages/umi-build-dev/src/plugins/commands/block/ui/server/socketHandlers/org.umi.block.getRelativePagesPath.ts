/**
 *  C:\GitHub\ant-design-pro\src\pages\Welcome\index.tsx
 * --->
 *   Welcome\index.tsx
 *  用与将路径变化为相对路径
 *  */

export default function({ payload, api, success }) {
  const { path: targetPath } = payload as {
    path: string;
  };

  success({
    data: api
      .winPath(targetPath)
      .replace(api.winPath(api.cwd), '')
      .replace(api.winPath(api.paths.pagesPath), '')
      .replace(/\//g, '/')
      .replace(/\/\//g, '/'),
    success: true,
  });
}
