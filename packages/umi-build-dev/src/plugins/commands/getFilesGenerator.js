import FilesGenerator from '../../FilesGenerator';

export default (service, opts = {}) => {
  const { RoutesManager, mountElementId } = opts;
  return new FilesGenerator({
    service,
    RoutesManager,
    mountElementId,
    modifyPageWatcher(pageWatchers) {
      return service.applyPlugins('addPageWatcher', {
        initialValue: pageWatchers,
      });
    },
  });
};
