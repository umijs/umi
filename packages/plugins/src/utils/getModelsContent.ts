import path from 'path';

export function getModelsContent(opts: { models: string[]; cwd: string }) {
  const models = opts.models.map((model) => {
    const namespace = path.basename(model, path.extname(model));
    return `'${namespace}': () => import('${model}'),`;
  });
  return `
export const models = {\n${models.join('\n')}\n};
export function preloadModels() {}
  `;
}
