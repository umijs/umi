import { spawnSync } from './.internal/utils';

const CYPRESS_RECORD_KEY = process.env.CYPRESS_RECORD_KEY as string;

spawnSync('npx cypress install', {});

if (CYPRESS_RECORD_KEY) {
  spawnSync(`npx cypress run --record --key ${CYPRESS_RECORD_KEY}`, {});
} else {
  spawnSync('npx cypress run', {});
}
