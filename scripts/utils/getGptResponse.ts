import { Configuration, OpenAIApi } from 'openai';
import { httpsOverHttp } from 'tunnel';

/**
 * @description 获取 ChatGpt 数据
 * @param prompt 提示
 * @returns
 */
export async function getGptResponse(prompt: string) {
  const OPENAI_TOKEN_FILE = '.openai_token';

  const token = fs
    .readFileSync(path.join(__dirname, '../../', OPENAI_TOKEN_FILE), 'utf-8')
    .trim();

  console.log(777);
  console.log(token);

  const tunnel = httpsOverHttp({
    proxy: {
      host: '127.0.0.1',
      port: 13659,
    },
  });
  console.log(tunnel);

  const configuration = new Configuration({
    apiKey: token,
    baseOptions: {
      httpsAgent: tunnel,
      proxy: false,
    },
  });

  const openai = new OpenAIApi(configuration);

  try {
    const response = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
    });
    return response?.data?.choices?.[0]?.message?.content?.trim();
  } catch (e) {
    console.log('Error getting GPT completion: ', e);
    // throw e;
  }
}
