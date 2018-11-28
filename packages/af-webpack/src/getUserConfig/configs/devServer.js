export default function() {
  return {
    name: 'devServer',
    onChange() {
      api.service.restart(/* why */ 'Config devServer Changed');
    },
  };
}
