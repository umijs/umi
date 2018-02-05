export default function(api) {
  return {
    name: 'disableServiceWorker',
    onChange() {
      api.service.restart(/* why */ 'Config disableServiceWorker Changed');
    },
  };
}
