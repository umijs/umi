import { spawnSync } from './.internal/utils';

const CYPRESS_CYPRESS_RECORD_KEY = process.env
  .CYPRESS_CYPRESS_RECORD_KEY as string;

if (CYPRESS_CYPRESS_RECORD_KEY) {
  spawnSync('npx cypress run --record', {});
} else {
  spawnSync('npx cypress run', {});
}
