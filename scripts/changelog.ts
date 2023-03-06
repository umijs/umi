import 'zx/globals';
import { getReleaseNotes } from './utils/getReleaseNotes';

(async () => {
  const { releaseNotes } = await getReleaseNotes('4.0.54');
  console.log(releaseNotes);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
