export default function(api, options = {}, react = {}) {
  require('umi-plugin-dva').default(api, {
    ...options,
    loadingComponent: react.loadingComponent,
  });
}
