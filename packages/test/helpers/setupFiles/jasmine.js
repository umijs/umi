const { OPEN_AUTO_E2E_FOR_UMI_TEST } = process.env;

if (OPEN_AUTO_E2E_FOR_UMI_TEST) {
  const { configureToMatchImageSnapshot } = require('jest-image-snapshot');
  const os = require('os');

  const customConfig = { threshold: 0.1 };
  const toMatchImageSnapshot = configureToMatchImageSnapshot({
    customDiffConfig: customConfig,
    customSnapshotIdentifier: ({ defaultIdentifier }) => {
      return `${defaultIdentifier}-${os.platform()}`;
    },
  });

  jasmine.DEFAULT_TIMEOUT_INTERVAL = 200000; // eslint-disable-line

  expect.extend({ toMatchImageSnapshot });
}
