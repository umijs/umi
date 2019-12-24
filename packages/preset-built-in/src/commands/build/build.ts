import { IApi } from '@umijs/types';

export default function(api: IApi) {
  api.registerCommand({
    name: 'build',
    fn() {
      console.log('build');
    },
  });
}
