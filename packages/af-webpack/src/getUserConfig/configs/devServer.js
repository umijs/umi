export default function() {
  return {
    name: 'devServer',
    onChange() {
      // eslint-disable-next-line no-undef
      api.service.restart(/* why */ 'Config devServer Changed');
    },
  };
}
