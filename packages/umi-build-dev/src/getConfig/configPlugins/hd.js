export default function(api) {
  return {
    name: 'hd',
    onChange() {
      api.service.restart(/* why */ 'Config hd Changed');
    },
  };
}
