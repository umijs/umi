
async function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = async (api) => {
  await delay(300);

  api.register({
    key: 'count',
    fn() { return 'foo' },
  });
};
