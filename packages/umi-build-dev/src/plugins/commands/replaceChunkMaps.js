import { join } from 'path';
import { readFileSync, existsSync, writeFileSync } from 'fs';

export const getAssetsManifest = service => {
  const { paths, config } = service;
  const { fileName = 'asset-manifest.json' } = config.manifest;
  const { absOutputPath } = paths;
  const manifestPath = join(absOutputPath, fileName);
  if (existsSync(manifestPath)) {
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));
    return manifest;
  }
  return {};
};

export const getServerContent = umiServerPath => {
  if (existsSync(umiServerPath)) {
    const content = readFileSync(umiServerPath, 'utf-8');
    return content;
  }
  return '';
};

export default service => {
  const { paths } = service;
  const { absOutputPath } = paths;
  const manifest = getAssetsManifest(service);

  const umiServerPath = join(absOutputPath, 'umi.server.js');
  const umiServer = getServerContent(umiServerPath);

  const result = umiServer
    .replace(/__UMI_SERVER__\.js/g, manifest['umi.js'].split('/').pop())
    .replace(/__UMI_SERVER__\.css/g, manifest['umi.css'].split('/').pop());

  writeFileSync(umiServerPath, result, 'utf-8');
};
