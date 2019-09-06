import installCreator from './installCreator';

xtest('normal', async () => {
  const creator = await installCreator({});
  console.log(creator);
});
