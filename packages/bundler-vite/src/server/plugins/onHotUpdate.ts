import type { HmrContext, Plugin } from '../../../compiled/vite';

export default function handleHotUpdate(
  listener: (modules: HmrContext['modules']) => Promise<void> | void,
): Plugin {
  return {
    name: 'vite-plugin-umi-on-hot-update',
    apply: 'serve',
    async handleHotUpdate(ctx: HmrContext) {
      await listener(ctx.modules);
    },
  };
}
