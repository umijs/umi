import { resolve } from 'path';
import { forkADevServer } from 'umi-buildAndDev/lib/dev';

const devScriptPath = resolve(__dirname, './realDev.js');
forkADevServer(devScriptPath);
