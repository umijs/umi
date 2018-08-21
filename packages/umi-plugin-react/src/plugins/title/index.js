import { join, relative } from 'path';

export default (api, option) => {
  const { paths } = api;

  api.onOptionChange(newOption => {
    option = newOption;
    api.rebuildHTML();
  });

  api.modifyHTMLContext(memo => {
    if (option) {
      return {
        ...memo,
        title: option,
      };
    }
    return memo;
  });

  api.onPatchRoute(({ route }) => {
    if (option) {
      // only open this plugin when option exist
      // use option as the default title
      route.title = route.title || option;
      route.Routes = [
        ...(route.Routes || []),
        relative(paths.cwd, join(__dirname, './TitleWrapper.js')),
      ];
    }
  });
};
