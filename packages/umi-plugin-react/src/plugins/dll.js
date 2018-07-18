export default function(api) {
  const {
    config: { react = {} },
  } = api.service;

  if (react.dll) {
    require('umi-plugin-dll').default(api, react.dll);
  }
}
