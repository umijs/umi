export default function(api, options) {
  if (options.includes('ie9')) {
    require('umi-plugin-polyfill').default(api);
  }
}
