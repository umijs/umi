import clearGitCache from '../../../clearGitCache';

export default function({ payload, api, success }) {
  const info = clearGitCache(payload, api);
  success({
    data: info,
    success: true,
  });
}
