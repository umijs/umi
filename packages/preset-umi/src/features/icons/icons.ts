import path from 'path';
import { IApi } from '../../types';
import { buildForIconExtract } from './buildForIconExtract';
import { logger } from '@umijs/utils';
import { generateIconName, generateSVGR } from './generateSVGR';

export default (api: IApi) => {
  api.describe({
    config: {
      schema(Joi) {
        return Joi.object({
          // don't support tnpm
          autoInstall: Joi.object(),
          defaultComponentConfig: Joi.object(),
          // e.g. alias: { home: 'fa:home' }
          alias: Joi.object(),
        });
      },
    },
    enableBy: api.EnableBy.config,
  });

  api.register({
    key: 'onGenerateFiles',
    async fn({ isFirstTime }: { isFirstTime: boolean }) {
      if (!isFirstTime) return;
      const entryFile = path.join(api.paths.absTmpPath, 'umi.ts');
      const icons = await buildForIconExtract({
        entryPoints: [entryFile],
        // TODO: unwatch when process exit
        watch: api.name === 'dev' && {
          onRebuildSuccess() {
            generate().catch((e) => {
              logger.error(e);
            });
          },
        },
        config: {
          alias: api.config.alias,
        },
      });
      // TODO: add debounce
      const generate = async () => {
        logger.info(`[icons] generate icons.tsx`);
        const code: string[] = [];
        for (const iconStr of icons) {
          const [collect, icon] = iconStr.split(':');
          const iconName = generateIconName({ collect, icon });
          const svgr = await generateSVGR({
            collect,
            icon,
            iconifyOptions: { autoInstall: api.config.icons.autoInstall },
          });
          if (svgr) {
            code.push(svgr!);
            code.push(`export { ${iconName} };`);
          } else {
            if (api.env === 'development') {
              logger.error(`[icons] Icon ${iconStr} not found`);
            } else {
              throw new Error(`[icons] Icon ${iconStr} not found`);
            }
          }
        }
        api.writeTmpFile({
          path: 'icons.tsx',
          content: code.join('\n') || `export const __no_icons = true;`,
        });
      };
      generate().catch((e) => {
        logger.error(e);
      });
    },
    stage: Infinity,
  });

  api.onGenerateFiles(() => {
    api.writeTmpFile({
      path: 'index.tsx',
      content: `
import React from 'react';
import * as iconsMap from './icons';

export const Icon = React.forwardRef((props: {
  icon: string;
  className?: string;
  viewBox?: string;
  width?: string;
  height?: string;
  style?: any;
}, ref) => {
  const { icon, ...extraProps } = props;
  const iconName = normalizeIconName(icon);
  const Component = iconsMap[iconName];
  if (!Component) {
    // TODO: give a error icon when dev, to help developer find the error
    return null;
  }
  return (
    <span role="img" ref={ref}><Component {...extraProps} /></span>
  );
});

function camelCase(str: string) {
  return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
}

function normalizeIconName(name: string) {
  return camelCase(name.replace(':', '-'));
}
      `,
    });
  });
};
