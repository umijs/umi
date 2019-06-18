import got from 'got';
import getExternalData from './getExternalData';
import error from './error';

// 在线校验
async function onlineCheck(configs) {
  let urls = [];
  (configs || []).forEach(({ scripts, styles }) => {
    urls = urls
      .concat(scripts)
      .concat(styles)
      .filter(url => {
        return /^https?:\/\//.test(url);
      });
  });
  if (!urls.length) {
    return;
  }

  const options = {
    method: 'HEAD',
    retry: 3, // any
  } as any;

  await Promise.all(
    urls.map(async url => {
      if (!url) {
        return;
      }

      const res = await got(url, options);
      if (res.status !== 200) {
        error(`${url} is not online!`);
      }
    }),
  );
}

export { error, getExternalData, onlineCheck };
