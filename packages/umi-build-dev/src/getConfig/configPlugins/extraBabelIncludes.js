export default function() {
  return {
    name: 'extraBabelIncludes',
    onChange() {
      this.restart(/* why */ 'Config extraBabelIncludes Changed');
    },
  };
}
