import FilesGenerator from '../../FilesGenerator';

export default (service, opts = {}) => {
  const { RoutesManager } = opts;
  return new FilesGenerator({
    service,
    RoutesManager,
    modifyPageWatcher(pageWatchers) {
      return service.applyPlugins('addPageWatcher', {
        initialValue: pageWatchers,
      });
    },
  });
};
