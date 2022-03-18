import { dirname } from 'path';
import { IApi } from 'umi';
import { Mustache, winPath } from 'umi/plugin-utils';

export default (api: IApi) => {
  api.describe({
    key: 'request',
    config: {
      schema: (joi) => {
        return joi.object();
      },
    },
    enableBy: api.EnableBy.config,
  });

  api.addRuntimePluginKey(() => ['request']);

  const requestTpl = `
import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
} from '{{{axiosPath}}}';
import useUmiRequest, { UseRequestProvider } from '{{{umiRequestPath}}}';
import { message, notification } from '{{{antdPkg}}}';
import { ApplyPluginsType } from 'umi';
import { getPluginManager } from '../core/plugin';

import {
  BaseOptions,
  BasePaginatedOptions,
  BaseResult,
  CombineService,
  LoadMoreFormatReturn,
  LoadMoreOptions,
  LoadMoreOptionsWithFormat,
  LoadMoreParams,
  LoadMoreResult,
  OptionsWithFormat,
  PaginatedFormatReturn,
  PaginatedOptionsWithFormat,
  PaginatedParams,
  PaginatedResult,
} from '{{{umiRequestPath}}}/es/types';

type ResultWithData< T = any > = { data?: T; [key: string]: any };

function useRequest<
  R = any,
  P extends any[] = any,
  U = any,
  UU extends U = any,
>(
  service: CombineService<R, P>,
  options: OptionsWithFormat<R, P, U, UU>,
): BaseResult<U, P>;
function useRequest<R extends ResultWithData = any, P extends any[] = any>(
  service: CombineService<R, P>,
  options?: BaseOptions<R['data'], P>,
): BaseResult<R['data'], P>;
function useRequest<R extends LoadMoreFormatReturn = any, RR = any>(
  service: CombineService<RR, LoadMoreParams<R>>,
  options: LoadMoreOptionsWithFormat<R, RR>,
): LoadMoreResult<R>;
function useRequest<
  R extends ResultWithData<LoadMoreFormatReturn | any> = any,
  RR extends R = any,
>(
  service: CombineService<R, LoadMoreParams<R['data']>>,
  options: LoadMoreOptions<RR['data']>,
): LoadMoreResult<R['data']>;

function useRequest<R = any, Item = any, U extends Item = any>(
  service: CombineService<R, PaginatedParams>,
  options: PaginatedOptionsWithFormat<R, Item, U>,
): PaginatedResult<Item>;
function useRequest<Item = any, U extends Item = any>(
  service: CombineService<
    ResultWithData<PaginatedFormatReturn<Item>>,
    PaginatedParams
  >,
  options: BasePaginatedOptions<U>,
): PaginatedResult<Item>;
function useRequest(service: any, options: any = {}) {
  return useUmiRequest(service, {
    formatResult: result => result?.data,
    requestMethod: (requestOptions: any) => {
      if (typeof requestOptions === 'string') {
        return request(requestOptions);
      }
      if (typeof requestOptions === 'object') {
        const { url, ...rest } = requestOptions;
        return request(url, rest);
      }
      throw new Error('request options error');
    },
    ...options,
  });
}

export interface RequestConfig extends AxiosRequestConfig {
  errorConfig?: {
    errorPage?: string;
    adaptor?: IAdaptor; // adaptor 用以用户将不满足接口的后端数据修改成 errorInfo
    errorHandler?: IErrorHandler;
    defaultNoneResponseErrorMessage?: string;
    defaultRequestErrorMessage?: string;
  };
  formatResultAdaptor?: IFormatResultAdaptor;
}

export enum ErrorShowType {
  SILENT = 0,
  WARN_MESSAGE = 1,
  ERROR_MESSAGE = 2,
  NOTIFICATION = 3,
  REDIRECT = 9,
}

export interface IErrorInfo {
  success: boolean;
  data?: any;
  errorCode?: string;
  errorMessage?: string;
  showType?: ErrorShowType;
  traceId?: string;
  host?: string;
  [key: string]: any;
}
// resData 其实就是 response.data, response 则是 axios 的响应对象
interface IAdaptor {
  (resData: any, response: AxiosResponse): IErrorInfo;
}

export interface RequestError extends Error {
  data?: any;
  info?: IErrorInfo;
}

interface IRequest {
  (
    url: string,
    opts: AxiosRequestConfig & { skipErrorHandler?: boolean },
  ): Promise<AxiosResponse<any, any>>;
}

interface IErrorHandler {
  (error: RequestError, opts: AxiosRequestConfig & { skipErrorHandler?: boolean }, config: RequestConfig): void;
}

interface IFormatResultAdaptor {
  (res: AxiosResponse): any;
}

const defaultErrorHandler: IErrorHandler = (error, opts, config) => {
  if (opts?.skipErrorHandler) throw error;
  const { errorConfig } = config;
  if (error.response) {
    // 请求成功发出且服务器也响应了状态码，但状态代码超出了 2xx 的范围 或者 成功响应，success字段为false 由我们抛出的错误
    let errorInfo: IErrorInfo | undefined;
    // 不是我们的错误
    if(error.name === 'ResponseError'){
      const adaptor: IAdaptor =
      errorConfig?.adaptor || ((errorData) => errorData);
      errorInfo = adaptor(error.response.data, error.response);
      error.info = errorInfo;
      error.data = error.response.data;
    }
    errorInfo = error.info;
    if (errorInfo) {
      const { errorMessage, errorCode } = errorInfo;
      switch (errorInfo.showType) {
        case ErrorShowType.SILENT:
          // do nothong
          break;
        case ErrorShowType.WARN_MESSAGE:
          message.warn(errorMessage);
          break;
        case ErrorShowType.ERROR_MESSAGE:
          message.error(errorMessage);
          break;
        case ErrorShowType.NOTIFICATION:
          notification.open({ description: errorMessage, message: errorCode });
          break;
        case ErrorShowType.REDIRECT:
          // TODO: redirect
          break;
        default:
          message.error(errorMessage);
      }
    }
  } else if (error.request) {
    // 请求已经成功发起，但没有收到响应
    // \`error.request\` 在浏览器中是 XMLHttpRequest 的实例，
    // 而在node.js中是 http.ClientRequest 的实例
    message.error(
      errorConfig?.defaultNoneResponseErrorMessage ||
        'None response! Please retry.',
    );
  } else {
    // 发送请求时出了点问题
    message.error(
      errorConfig?.defaultRequestErrorMessage || 'Request error, please retry.',
    );
  }
  throw error;
};

let requestInstance: AxiosInstance;
let config: RequestConfig;
const getConfig = (): RequestConfig => {
  if (config) return config;
  config = getPluginManager().applyPlugins({
    key: 'request',
    type: ApplyPluginsType.modify,
    initialValue: {},
  });
  return config;
};
const getRequestInstance = (): AxiosInstance => {
  if (requestInstance) return requestInstance;
  const config = getConfig();
  requestInstance = axios.create(config);

  // 当响应的数据 success 是 false 的时候，抛出 error 以供 errorHandler 处理。
  requestInstance.interceptors.response.use((response)=>{
    const {data} = response;
    const adaptor = config?.errorConfig?.adaptor || ((resData) => resData);
    const errorInfo = adaptor(data,response);
    if(errorInfo.success === false){
      const error: RequestError = new Error(errorInfo.errorMessage);
      error.name = 'BizError';
      error.data = data;
      error.info = errorInfo;
      error.response = response;
      throw error;
    }
    return response;
  })
  return requestInstance;
};

const request: IRequest = (url, opts) => {
  const requestInstance = getRequestInstance();
  const config = getConfig();
  return new Promise((resolve, reject) => {
    requestInstance
      .request({ ...opts, url })
      .then((res) => {
        const formatResultAdaptor =
          config?.formatResultAdaptor || ((res) => res.data);
        resolve(formatResultAdaptor(res));
      })
      .catch((error) => {
        try {
          const handler =
            config.errorConfig?.errorHandler || defaultErrorHandler;
          handler(error, opts, config);
        } catch (e) {
          reject(e);
        }
      });
  });
};

export {
  useRequest,
  UseRequestProvider,
  request,
  getRequestInstance,
};

export type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
};

`;

  api.onGenerateFiles(() => {
    const umiRequestPath = winPath(
      dirname(require.resolve('@ahooksjs/use-request/package.json')),
    );
    const axiosPath = winPath(dirname(require.resolve('axios/package.json')));
    const antdPkg = winPath(
      // use path from antd plugin first
      api.appData.antd?.pkgPath ||
        dirname(require.resolve('antd/package.json')),
    );
    api.writeTmpFile({
      path: 'request.ts',
      content: Mustache.render(requestTpl, {
        umiRequestPath,
        axiosPath,
        antdPkg,
      }),
    });
    api.writeTmpFile({
      path: 'index.ts',
      content: `
export {
  useRequest,
  UseRequestProvider,
  request,
} from './request';
`,
    });
  });
};
