export default function() {
  return {
    name: 'hd',
    onChange() {
      this.restart(/* why */ 'Config hd Changed');
    },
  };
}
