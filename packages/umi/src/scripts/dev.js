import { fork } from 'umi-buildAndDev/lib/dev';

fork(require.resolve('./realDev.js'));
