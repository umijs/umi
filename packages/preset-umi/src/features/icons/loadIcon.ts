import { searchForIcon } from '@iconify/utils/lib/loader/modern';
import { IconifyLoaderOptions } from '@iconify/utils/lib/loader/types';
import { fsExtra, logger, resolve } from '@umijs/utils';
import assert from 'assert';
import path from 'path';

interface IOpts {
  cwd: string;
  autoInstall?: (pkg: string) => Promise<void>;
  iconifyLoaderOptions: IconifyLoaderOptions;
}

export async function loadIcon(collection: string, icon: string, opts: IOpts) {
  const iconsPath = `@iconify-json/${collection}/icons.json`;
  function getIconPath() {
    let iconPath: string | undefined;
    try {
      iconPath = resolve.sync(iconsPath, {
        basedir: opts.cwd,
        paths: [path.join(__dirname, '../../../node_modules')],
      });
    } catch (e) {}
    return iconPath;
  }

  if (!getIconPath()) {
    if (opts.autoInstall) {
      await opts.autoInstall(`@iconify-json/${collection}`);
    } else {
      throw new Error(
        `@iconify-json/${collection} is not found, and autoInstall is not specified.`,
      );
    }
  }

  const iconPath = getIconPath();
  assert(iconPath, `@iconify-json/${collection} is not found.`);
  const iconSet = fsExtra.readJSONSync(iconPath);
  const ids = [
    icon,
    icon.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase(),
    icon.replace(/([a-z])(\d+)/g, '$1-$2'),
  ];
  const result = await searchForIcon(
    iconSet,
    collection,
    ids,
    opts.iconifyLoaderOptions,
  );
  if (!result) {
    logger.error(
      `[icon] Icon ${icon} is not found in collection ${collection}.`,
    );
  }
  return result;
}
