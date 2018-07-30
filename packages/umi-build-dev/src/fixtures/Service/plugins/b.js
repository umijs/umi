
export default (api) => {
  api.onOptionChange(() => {
    console.log('b-with-onOptionChange option changed');
  });
}
