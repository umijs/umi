const { configureToMatchImageSnapshot } = require('jest-image-snapshot');

const customConfig = { threshold: 0.1 };
const toMatchImageSnapshot = configureToMatchImageSnapshot({
  customDiffConfig: customConfig,
  noColors: true,
});

jasmine.DEFAULT_TIMEOUT_INTERVAL = 200000; // eslint-disable-line

expect.extend({ toMatchImageSnapshot });
