import { IUiApi } from 'umi-types';
import ConfigManager from './ui/index';

export default (api: IUiApi) => {
  api.addPanel({
    title: '配置管理',
    path: '/configuration',
    icon: 'environment',
    component: () => <ConfigManager api={api} />,
  });
};
