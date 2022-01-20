import { compile } from './compiler';

export default async function (content: string) {
  // @ts-ignore
  const callback = this.async();
  const { result } = await compile({
    content,
  });
  return callback(null, result);
}
