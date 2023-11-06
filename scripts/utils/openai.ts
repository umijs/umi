import { Configuration, OpenAIApi } from 'openai';
import { httpsOverHttp } from 'tunnel';

// 调用 ChatGpt 需配置代理，请根据本地代理信息正确填写
// 代理 IP
const PROXY_HOST = '';
// 代理端口
const PROXY_PORT = '';

export async function getGptResponse(prompt: string) {
  const OPENAI_TOKEN_FILE = '.openai_token';

  const token = fs
    .readFileSync(path.join(__dirname, '../../', OPENAI_TOKEN_FILE), 'utf-8')
    .trim();

  // 设置代理服务器
  const tunnel = httpsOverHttp({
    proxy: {
      host: PROXY_HOST,
      port: Number(PROXY_PORT),
    },
  });

  // 设置 OpenAi Api key
  const configuration = new Configuration({
    apiKey: token,
    baseOptions: {
      httpsAgent: tunnel,
      proxy: false,
    },
  });

  // 调用 OpenAi Api
  const openai = new OpenAIApi(configuration);
  try {
    const response = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
    });
    return response?.data?.choices?.[0]?.message?.content?.trim();
  } catch (e) {
    console.error('请检查代理 IP 及端口是否配置正确');
    throw e;
  }
}
