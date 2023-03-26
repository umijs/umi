import { axios, chalk, logger } from '@umijs/utils';
// @ts-ignore
import HttpsProxyAgent from '../compiled/https-proxy-agent';
// @ts-ignore
import { SocksProxyAgent } from '../compiled/socks-proxy-agent';

// for system proxy
const httpProxyUri = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;
const socksProxyUri = process.env.ALL_PROXY;

let axiosProxy: ReturnType<typeof axios.create> | null = null;

if (socksProxyUri) {
  axiosProxy = axios.create({
    proxy: false,
    httpsAgent: new SocksProxyAgent(socksProxyUri),
  });
} else if (httpProxyUri) {
  axiosProxy = axios.create({
    proxy: false,
    httpsAgent: new HttpsProxyAgent(httpProxyUri),
  });
}

interface IMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface IChatGPTResponse {
  error?: {
    type: string;
    code: string;
    message: string;
  };
  created: number;
  choices: {
    index: number;
    message: IMessage;
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

const requestParamsBase = {
  model: 'gpt-3.5-turbo',
  temperature: 0.5,
  top_p: 0.8,
  presence_penalty: 1.0,
  max_tokens: 500,
};

function getApiUrl(proxyUrl?: string) {
  if (proxyUrl) {
    proxyUrl = proxyUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');
  }
  return `https://${proxyUrl || 'api.openai.com'}/v1/chat/completions`;
}

export async function sendMessage(opts: {
  messages: IMessage[];
  token: string;
  proxyUrl?: string;
  controller?: AbortController;
  timeout?: number;
}) {
  const apiUrl = getApiUrl(opts.proxyUrl);
  const axiosInstance = axiosProxy || axios;

  let res: any = null;
  try {
    res = await axiosInstance.post<IChatGPTResponse>(
      apiUrl,
      {
        ...requestParamsBase,
        messages: opts.messages,
        stream: false,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${opts.token}`,
        },
        validateStatus: () => true,
        signal: opts.controller?.signal,
        timeout: opts.timeout || 20000,
      },
    );
  } catch (e: any) {
    if (opts.controller?.signal.aborted === true) {
      // 用户手动取消了请求
    } else {
      if (e.message.includes('timeout')) {
        logger.fatal(e.message);
        logger.warn('Request is too slow or cannot be requested');
        logger.warn(
          `Recommended to use a proxy host by passing ${chalk.yellow(
            '--proxy-url',
          )}`,
        );
      }
      throw new Error('Network Error');
    }
  }
  if (res.data.error) {
    throw new Error(res.data.error.message);
  }
  return res;
}
