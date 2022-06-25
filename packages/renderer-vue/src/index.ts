// @ts-ignore
import { RouterOptions } from 'vue-router';

// @ts-ignore
export {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory,
  onBeforeRouteLeave,
  onBeforeRouteUpdate,
  RouterLink,
  RouterView,
  useLink,
  useRoute,
  useRouter,
// @ts-ignore
} from 'vue-router';

// @ts-ignore
export type { RouterHistory } from 'vue-router';

export { AppContextKey, renderClient } from './browser';

export type RouterConfig = Omit<RouterOptions, 'history' | 'routes'>;
