import { IApi } from 'umi';
import { sseMiddleware } from './sse-middleware';

export default (api: IApi) => {
  api.onBeforeMiddleware(({ app }) => {
    sseMiddleware(app);
  });
};
