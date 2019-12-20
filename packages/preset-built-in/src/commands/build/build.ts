export default function(api: any) {
  api.registerCommand({
    name: 'build',
    fn() {
      console.log('build');
    },
  });
}
