import * as logger from '@umijs/utils/src/logger';
import { mkdtempSync, readdirSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import 'zx/globals';
import { PATHS } from './.internal/constants';
import { eachPkg, getPkgs } from './.internal/utils';

function getNpmTag(version: string) {
  if (
    version.includes('-alpha.') ||
    version.includes('-beta.') ||
    version.includes('-rc.')
  ) {
    return 'next';
  }
  if (version.includes('-canary.')) return 'canary';
  return 'latest';
}

async function isPublished(name: string, version: string) {
  try {
    const publishedVersion = (
      await $`npm view ${`${name}@${version}`} version --registry https://registry.npmjs.org/`
    ).stdout.trim();
    return publishedVersion === version;
  } catch {
    return false;
  }
}

async function publishPackage(opts: {
  name: string;
  dir: string;
  version: string;
  tag: string;
  dryRun: boolean;
}) {
  if (await isPublished(opts.name, opts.version)) {
    logger.info(`skip ${opts.name}@${opts.version}, already published`);
    return;
  }

  const packDir = mkdtempSync(join(tmpdir(), 'umi-release-'));
  const publishDir = mkdtempSync(join(tmpdir(), 'umi-release-publish-'));
  try {
    await $`cd ${opts.dir} && pnpm pack --pack-destination ${packDir}`;
    const tarballs = readdirSync(packDir).filter((file) =>
      file.endsWith('.tgz'),
    );
    if (tarballs.length !== 1) {
      throw new Error(`Expected one tarball for ${opts.name}, got ${tarballs}`);
    }
    const tarball = join(packDir, tarballs[0]);
    await $`tar -xzf ${tarball} --strip-components=1 -C ${publishDir}`;
    if (opts.dryRun) {
      logger.info(
        `[dry-run] cd ${publishDir} && npm publish --tag ${opts.tag}`,
      );
      return;
    }
    await $`cd ${publishDir} && npm publish --tag ${opts.tag} --access public --provenance`;
    logger.info(`+ ${opts.name}`);
  } finally {
    rmSync(packDir, { recursive: true, force: true });
    rmSync(publishDir, { recursive: true, force: true });
  }
}

(async () => {
  const version = require(PATHS.LERNA_CONFIG).version;
  const tag = getNpmTag(version);
  const dryRun =
    argv['dry-run'] || argv.dryRun || process.argv.includes('--dry-run');
  const pkgs = getPkgs();
  const orderedPkgs = [
    ...pkgs.filter((pkg) => !['umi', 'max'].includes(pkg)),
    'umi',
    'max',
  ];
  const publishInfos: { name: string; dir: string; version: string }[] = [];
  eachPkg(
    orderedPkgs,
    ({ dir, pkgJson }) => {
      publishInfos.push({
        name: pkgJson.name,
        dir,
        version: pkgJson.version,
      });
    },
    { base: PATHS.PACKAGES },
  );

  logger.event(`publish packages with npm tag ${tag}`);
  for (const publishInfo of publishInfos) {
    await publishPackage({
      ...publishInfo,
      tag,
      dryRun,
    });
  }
})();
