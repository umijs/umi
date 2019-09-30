import { formatMessage } from 'umi-plugin-react/locale';
import { getLocale } from '@/utils/index';
import zhCN from '@/locales/zh-CN';
import enUS from '@/locales/en-US';

/**
 * 主要用于 Loading 页面展示时需要的国际化，这部分是在 oldRender 之前
 * 未加载 umi-plugin-locale，所以要手动处理
 *
 */
export default (messages: { id: string }, value: object = {}) => {
  const localeMessages = getLocale() === 'zh-CN' ? zhCN : enUS;
  return formatMessage(messages, value) || localeMessages[messages.id];
};
