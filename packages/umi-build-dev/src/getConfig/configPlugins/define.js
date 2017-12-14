export default function() {
  return {
    name: 'define',
    onChange() {
      this.restart(/* why */ 'Config define Changed');
    },
  };
}
