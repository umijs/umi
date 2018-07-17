import isPlainObject from 'is-plain-object';

function toObject(o) {
  if (!isPlainObject(o)) {
    return {};
  } else {
    return o;
  }
}

export default function(api, options) {
  // mobile
  if (options.hd) require('./plugins/mobile/hd').default(api, options.hd);
  if (options.fastClick)
    require('./plugins/mobile/fastclick').default(api, options.fastClick);

  // performance
  if (options.library)
    require('./plugins/library').default(api, options.library);
  if (options.dynamicImport)
    require('./plugins/dynamicImport').default(api, options.dynamicImport);
  if (options.dll) require('umi-plugin-dll').default(api, options.dll);
  if (options.hardSource)
    require('./plugins/hardSource').default(api, options.hardSource);
  if (options.pwa) require('./plugins/pwa').default(api, options.pwa);

  // misc
  if (options.dva)
    require('umi-plugin-dva').default(api, {
      ...toObject(options.dva),
      dynamicImport: options.dynamicImport,
    });
  if (options.polyfills)
    require('./plugins/polyfills').default(api, options.polyfills);

  // antd + antd-mobile
  require('./plugins/antd').default(api);
}
