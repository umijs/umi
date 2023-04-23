import { compile } from './compiler';

export default async function (content: string) {
  // @ts-ignore
  const filename = this.resourcePath;
  // @ts-ignore
  const callback = this.async();
  try {
    const { result } = await compile({
      content,
      fileName: filename,
    });
    return callback(null, result);
  } catch (e: any) {
    const err = e;
    e.message = `${filename}: ${e.message}`;
    throw err;
  }
}
