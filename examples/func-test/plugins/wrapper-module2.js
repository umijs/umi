export default () => {
  console.log('wrapper-module2 running');
  return new Promise(resolve => {
    console.log('wrapper-module2 resolved');
    setTimeout(resolve, 500);
  });
};
