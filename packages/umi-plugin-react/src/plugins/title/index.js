import { readFileSync, writeFileSync } from 'fs';
import { join, relative } from 'path';
import assert from 'assert';
import Mustache from 'mustache';

export default (api, option) => {
  const { paths, config } = api;

  // write titleWrapper at while launching
  writeTitleWrapper(paths, option.useLocale, option);

  api.onOptionChange(newOption => {
    option = newOption;

    // write titleWrapper whenever title option changed
    writeTitleWrapper(paths, option.useLocale, option);
    api.rebuildHTML();
  });

  api.modifyHTMLContext((memo, { route }) => {
    if (option) {
      const { defaultTitle } = parseOption(option);
      return {
        ...memo,
        title: config.exportStatic ? route._title : defaultTitle,
      };
    }
    return memo;
  });

  api.modifyRoutes(memo => {
    return modifyRoutes(memo, option);
  });

  api.onPatchRoute(({ route }) => {
    if (option && (!route.routes || !route.routes.length) && route.title) {
      // only open this plugin when option exist
      route.Routes = [
        ...(route.Routes || []),
        relative(paths.cwd, join(__dirname, 'TitleWrapper.jsx')),
      ];
    }
  });
};

function writeTitleWrapper(paths, useLocale, option) {
  const wrapperPath = join(__dirname, './TitleWrapper.jsx');
  const wrapperTpl = readFileSync(
    join(__dirname, './template/TitleWrapper.js.tpl'),
    'utf-8',
  );
  const wrapperContent = Mustache.render(wrapperTpl, {
    useLocale,
    option,
  });
  writeFileSync(wrapperPath, wrapperContent, 'utf-8');
}

function parseOption(option) {
  // fill title with parent value or default value
  let defaultTitle = option;
  let format = '{parent}{separator}{current}';
  let separator = ' - ';
  if (typeof option === 'object') {
    defaultTitle = option.defaultTitle;
    assert(defaultTitle, 'defaultTitle in title option is required.');
    format = option.format || format;
    separator = option.separator || separator;
  }
  return {
    defaultTitle,
    format,
    separator,
  };
}

function modifyRoutes(memo, option) {
  if (option) {
    const { defaultTitle, format, separator } = parseOption(option);
    setDefaultTitleToRoutes({
      routes: memo,
      defaultTitle,
      format,
      separator,
      globalDefaultTitle: defaultTitle,
    });
  }
  return memo;
}

function setDefaultTitleToRoutes({
  routes,
  defaultTitle,
  parentTitle,
  format,
  separator,
  globalDefaultTitle,
}) {
  routes.forEach(route => {
    if (route.title) {
      route._title = format
        .replace(/\{current\}/g, route.title)
        .replace(/\{parent\}/g, parentTitle || '')
        .replace(/\{separator\}/g, parentTitle ? separator : '');
    } else {
      // title no exist, use the defaultTitle
      route._title = defaultTitle;
    }
    route._title_default = globalDefaultTitle;
    if (route.routes) {
      setDefaultTitleToRoutes({
        routes: route.routes,
        defaultTitle: route._title,
        // title exist, set new parentTitle for children routes
        parentTitle: route.title || parentTitle,
        format,
        separator,
        globalDefaultTitle,
      });
    }
  });
}

// for unit test
export { modifyRoutes };
