import { IApi } from 'umi';

export default (api: IApi) => {
  api.onCheckPkgJSON(({ current }) => {
    const hasUmi =
      current.dependencies?.['umi'] || current.devDependencies?.['umi'];
    if (hasUmi) {
      throw new Error(
        `You are using ${api.appData.umi.importSource}, please remove umi from your dependencies in package.json.`,
      );
    }
  });
};
