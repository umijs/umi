export default function(api, opts) {
  console.log('opts', opts);
  api.register('generateFiles', () => {
    console.log('generate files in plugin2');
  });
}
