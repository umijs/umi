import path from 'path';
import { IApi } from '../../types';
import { build } from './build';
import { logger } from '@umijs/utils';
import { generateIconName, generateSvgr } from './svgr';

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

  api.onCheckConfig(() => {
    if (
      api.config.icons.autoInstall &&
      (api.appData.npmClient === 'tnpm' || api.appData.npmClient === 'cnpm')
    ) {
      throw new Error(
        `[icons] autoInstall option don't support ${api.appData.npmClient}`,
      );
    }
  });

  api.register({
    key: 'onGenerateFiles',
    async fn({ isFirstTime }: { isFirstTime: boolean }) {
      if (!isFirstTime) return;
      const entryFile = path.join(api.paths.absTmpPath, 'umi.ts');
      const iconsSet: Set<string> = new Set();
      const icons = await build({
        entryPoints: [entryFile],
        // TODO: unwatch when process exit
        watch: api.name === 'dev' && {
          onRebuildSuccess() {
            generate().catch((e) => {
              logger.error(e);
            });
          },
        },
        icons: iconsSet,
        config: {
          alias: api.config.alias,
        },
        options: {
          alias: api.config.icons.alias,
        },
      });
      // TODO: add debounce
      const generate = async () => {
        logger.info(`[icons] generate icons.tsx`);
        const code: string[] = [];
        for (const iconStr of icons) {
          const [collect, icon] = iconStr.split(':');
          const iconName = generateIconName({ collect, icon });
          const svgr = await generateSvgr({
            collect,
            icon,
            iconifyOptions: { autoInstall: api.config.icons.autoInstall },
            localIconDir: path.join(api.paths.absSrcPath, 'icons'),
          });
          if (svgr) {
            code.push(svgr!);
            code.push(`export { ${iconName} };`);
          } else {
            if (api.env === 'development') {
              iconsSet.delete(iconStr);
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
import './index.css';

const alias = ${JSON.stringify(api.config.icons.alias || {})};
type AliasKeys = keyof typeof alias;

export const Icon = React.forwardRef((props: {
  icon: AliasKeys | string;
  hover: AliasKeys | string;
  className?: string;
  viewBox?: string;
  width?: string;
  height?: string;
  style?: any;
  spin?: boolean;
  rotate?: number | string;
  flip?: 'vertical' | 'horizontal' | 'horizontal,vertical' | 'vertical,horizontal';
}, ref) => {
  const { icon, hover, style, className, rotate, flip, ...extraProps } = props;
  const iconName = normalizeIconName(alias[icon] || icon);
  const Component = iconsMap[iconName];
  if (!Component) {
    // TODO: give a error icon when dev, to help developer find the error
    return null;
  }
  const HoverComponent = hover ? iconsMap[normalizeIconName(alias[hover] || hover)] : null;
  const cls = props.spin ? 'umiIconLoadingCircle' : undefined;
  const svgStyle = {};
  const transform: string[] = [];
  if (rotate) {
    const rotateDeg = normalizeRotate(rotate);
    transform.push(\`rotate(\${rotateDeg}deg)\`);
  }
  if (flip) {
    const flipMap = flip.split(',').reduce((memo, item) => {
      memo[item] = 1;
      return memo;
    }, {});
    if (flipMap.vertical) {
      transform.push(\`rotateY(180deg)\`);
    }
    if (flipMap.horizontal) {
      transform.push(\`rotateX(180deg)\`);
    }
  }
  if (transform.length) {
    const transformStr = transform.join('');
    svgStyle.msTransform = transformStr;
    svgStyle.transform = transformStr;
  }
  return (
    <span role="img" ref={ref} className={HoverComponent ? 'umiIconDoNotUseThis ' : '' + className} style={style}>
      <Component {...extraProps} className={cls} style={svgStyle} />
      {
        HoverComponent ? <HoverComponent {...extraProps} className={'umiIconDoNotUseThisHover ' + cls} style={svgStyle} /> : null
      }
    </span>
  );
});

function normalizeRotate(rotate: number | string) {
  if (typeof rotate === 'number') {
    return rotate * 90;
  }
  if (typeof rotate === 'string') {
    if (rotate.endsWith('deg')) {
      return parseInt(rotate, 10);
    }
    if (rotate.endsWith('%')) {
      return parseInt(rotate, 10) / 100 * 360;
    }
    return 0;
  }
}

function camelCase(str: string) {
  return str.replace(/-([a-z]|[1-9])/g, (g) => g[1].toUpperCase());
}

function normalizeIconName(name: string) {
  return camelCase(name.replace(':', '-'));
}
      `,
    });
    api.writeTmpFile({
      path: 'index.css',
      content: `
.umiIconDoNotUseThisHover {
  display: none;
}
.umiIconDoNotUseThis:hover svg {
  display: none;
}
.umiIconDoNotUseThis:hover .umiIconDoNotUseThisHover {
  display: inline-block;
}
.umiIconLoadingCircle {
  display: inline-block;
  -webkit-animation: loadingCircle 1s infinite linear;
  animation: umiIconLoadingCircle 1s linear infinite;
}

@-webkit-keyframes umiIconLoadingCircle {
  100% {
    -webkit-transform: rotate(360deg);
    transform: rotate(360deg);
  }
}
@keyframes umiIconLoadingCircle {
  100% {
    -webkit-transform: rotate(360deg);
    transform: rotate(360deg);
  }
}
      `,
    });
  });
};
