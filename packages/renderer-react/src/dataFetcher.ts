export interface IServerLoaderRequest {
  url: string;
  options: RequestInit;
}

export function fetchServerLoader({
  id,
  url,
  basename,
  cb,
  pluginManager,
}: {
  id: string;
  url: string;
  basename?: string;
  cb: (data: any) => void;
  // Runtime plugin manager for the modifyServerLoaderRequest hook.
  // Optional: falls back to the default request when absent.
  pluginManager?: any;
}) {
  const query = new URLSearchParams({
    route: id,
    url,
  }).toString();
  // 在有basename的情况下__serverLoader的请求路径需要加上basename
  // FIXME: 先临时解自定义 serverLoader 请求路径的问题，后续改造 serverLoader 时再提取成类似 runtimeServerLoader 的配置项
  const defaultUrl = `${withEndSlash(
    (window as any).umiServerLoaderPath || basename,
  )}__serverLoader?${query}`;

  // Runtime hook to let consumers rewrite the direct serverLoader request
  // (e.g. add gateway headers/query when calling WebGW FaaS directly).
  // The framework stays agnostic of any gateway protocol.
  let req: IServerLoaderRequest = {
    url: defaultUrl,
    options: { credentials: 'include' },
  };
  if (pluginManager?.applyPlugins) {
    req = pluginManager.applyPlugins({
      key: 'modifyServerLoaderRequest',
      type: 'modify',
      initialValue: req,
      args: { id, basename },
    });
  }

  return fetch(req.url, req.options)
    .then((d) => d.json())
    .then((data) => {
      cb(data);
      return data;
    })
    .catch(console.error);
}

function withEndSlash(str: string = '') {
  return str.endsWith('/') ? str : `${str}/`;
}
