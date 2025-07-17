import { build, serve } from '@utoo/pack';
import fs from 'fs';
import path from 'path';
import type webpack from '../compiled/webpack';

export function fakedWebpackFromUtoo(...args: Parameters<typeof build>) {
  return {
    run: async (cb: (err: any, stats: webpack.Stats) => void) => {
      await build(...args);
      const stats = JSON.parse(
        fs.readFileSync(path.join(args[0].output?.path!, 'stats.json'), 'utf8'),
      );
      stats.__proto__.hasErrors = () => false;
      stats.__proto__.toJson = () => stats;
      stats.__proto__.toString = () => {};
      stats.__proto__.compilation = {
        ...stats,
        assets: stats.assets.reduce(
          (acc: Record<string, any>, cur: any) =>
            Object.assign(acc, { [cur.name]: cur }),
          {} as Record<string, any>,
        ),
      };
      cb(null, stats);
    },
    close() {
      // TODOP
    },
    watch() {
      serve(...args);
      return {
        close() {},
      };
    },
  };
}
