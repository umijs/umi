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
  // FIXME: 先临时解自定义 serverLoader 请求路径的问题，后续改造 serverLoader 时再提取成类似 runtimeServerLoader 的配置项
  const url = `${withEndSlash(
    (window as any).umiServerLoaderPath || basename,
  )}__serverLoader?${query}`;
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
