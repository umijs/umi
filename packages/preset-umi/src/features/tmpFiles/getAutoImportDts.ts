export function getAutoImportDts(importSource: string) {
  if (importSource !== 'umi') return null;

  // Keep the public entry in the TS project when the auto-import provider
  // stops scanning package.json dependencies for performance reasons.
  return `import '${importSource}';`;
}
