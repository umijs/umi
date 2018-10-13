export default () => {
  console.log('wrapper-module running');
  return new Promise(resolve => {
    console.log('wrapper-module resolved');
    setTimeout(resolve, 500);
  });
};
