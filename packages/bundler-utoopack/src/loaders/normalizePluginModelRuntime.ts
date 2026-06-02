export default function normalizePluginModelRuntimeLoader(source: string) {
  return source.replace(
    /import\s+\{\s*Provider\s*\}\s+from\s+['"]\.\/?['"];?/,
    "import { Provider } from '@@/plugin-model';",
  );
}
