import { join, relative } from 'path';
import assert from 'assert';

export default (api, option) => {
  const { paths } = api;

  api.onOptionChange(newOption => {
    option = newOption;
    api.rebuildHTML();
  });

  api.modifyHTMLContext((memo, { route }) => {
    if (option) {
      return {
        ...memo,
        title: route._title,
      };
    }
    return memo;
  });

  api.modifyRoutes(memo => {
    return modifyRoutes(memo, option);
  });

  api.onPatchRoute(({ route }) => {
    if (option) {
      // only open this plugin when option exist
      route.Routes = [
        ...(route.Routes || []),
        relative(paths.cwd, join(__dirname, './TitleWrapper.js')),
      ];
    }
  });
};

function modifyRoutes(memo, option) {
  if (option) {
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
    setDefaultTitleToRoutes({
      routes: memo,
      defaultTitle,
      format,
      separator,
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
    if (route.routes) {
      setDefaultTitleToRoutes({
        routes: route.routes,
        defaultTitle: route._title,
        // title exist, set new parentTitle for children routes
        parentTitle: route.title || parentTitle,
        format,
        separator,
      });
    }
  });
}

// for unit test
export { modifyRoutes };
