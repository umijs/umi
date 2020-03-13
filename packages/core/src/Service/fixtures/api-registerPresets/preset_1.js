
export default (api) => {
  api.registerPresets([
    { id: 'preset_2', key: 'preset2', apply: () => () => {} },
    require.resolve('./preset_3'),
  ]);
}
