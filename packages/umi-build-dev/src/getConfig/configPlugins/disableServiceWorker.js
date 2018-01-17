export default function() {
  return {
    name: 'disableServiceWorker',
    onChange() {
      this.restart(/* why */ 'Config disableServiceWorker Changed');
    },
  };
}
