import { IApi } from 'umi';

export default (api: IApi) => {
  api.onCheckPkgJSON(({ current }) => {
    const hasUmi =
      current.dependencies?.['umi'] || current.devDependencies?.['umi'];
    console.log('hasUmi', hasUmi);
    if (hasUmi) {
      throw new Error(
        `You are using @umijs/max, please remove umi from your dependencies in package.json.`,
      );
    }
  });
};
