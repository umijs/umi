export default function(source, map) {
  const { resourcePath } = this;
  const debugLoader = process.env.DEBUG_LOADER;
  if (debugLoader && resourcePath.indexOf(debugLoader) > -1) {
    console.log('');
    console.log('');
    console.log('-------------------------------');
    console.log(resourcePath);
    console.log('===');
    console.log(source);
    console.log('-------------------------------');
    console.log('');
    console.log('');
  }
  this.callback(null, source, map);
}
