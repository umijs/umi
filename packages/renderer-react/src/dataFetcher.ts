export function fetchServerLoader({
  id,
  basename,
  cb,
}: {
  id: string;
  basename?: string;
  cb: (data: any) => void;
}) {
  const query = new URLSearchParams({
    route: id,
    url: window.location.href,
  }).toString();
  // 在有basename的情况下__serverLoader的请求路径需要加上basename
  const url = `${withEndSlash(basename)}__serverLoader?${query}`;
  fetch(url, {
    credentials: 'include',
  })
    .then((d) => d.json())
    .then(cb)
    .catch(console.error);
}

function withEndSlash(str: string = '') {
  return str.endsWith('/') ? str : `${str}/`;
}
