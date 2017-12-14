export default function() {
  return {
    name: 'alias',
    onChange() {
      this.restart(/* why */ 'Config alias Changed');
    },
  };
}
