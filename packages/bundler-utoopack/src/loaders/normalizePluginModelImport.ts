export default function normalizePluginModelImportLoader(
  this: { getOptions?: () => { pluginModelPath?: string } },
  source: string,
) {
  const { pluginModelPath } = this.getOptions?.() || {};

  if (!pluginModelPath) {
    return source;
  }

  return source.replace(
    /from\s+['"]@@\/plugin-model['"]/g,
    `from '${pluginModelPath}'`,
  );
}
