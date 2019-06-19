import { join, basename } from 'path';
import { readFileSync, existsSync, writeFileSync } from 'fs';

export const getAssetsManifest = service => {
  const { paths, config } = service;
  const { fileName = 'asset-manifest.json' } = config.manifest;
  const { absOutputPath } = paths;
  // fileName: '../../manifest.json'
  const manifestPath = join(absOutputPath, basename(fileName));
  if (!existsSync(manifestPath)) {
    const errMsg = `Umi SSR error: manifest file ${manifestPath} not found`;
    throw new Error(errMsg);
  }
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));
  return manifest;
};

export const getServerContent = umiServerPath => {
  if (existsSync(umiServerPath)) {
    const content = readFileSync(umiServerPath, 'utf-8');
    return content;
  }
  return '';
};

export default service => {
  const { paths, config } = service;
  const { absOutputPath } = paths;
  const { basePath = '' } = config.manifest;
  const manifest = getAssetsManifest(service);

  const umiServerPath = join(absOutputPath, 'umi.server.js');
  const umiServer = getServerContent(umiServerPath);
  const result = umiServer
    .replace(/__UMI_SERVER__\.js/g, manifest[`${basePath}umi.js`].split('/').pop())
    .replace(
      /__UMI_SERVER__\.css/g,
      // umi.css may not exist when using dynamic Routing
      manifest[`${basePath}umi.css`] ? manifest[`${basePath}umi.css`].split('/').pop() : '',
    );

  writeFileSync(umiServerPath, result, 'utf-8');
};
