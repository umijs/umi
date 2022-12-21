import { Service } from 'umi/dist/service/service';
import { workerData } from 'worker_threads';
import type { IWorkerData } from './depBuildWorker';

const { args } = workerData as IWorkerData;

export async function getDevConfig() {
  const service = new Service({
    presets: [require.resolve('./workerPreset')],
  });

  const opts: any = await service.run({
    name: 'dev-config',
    args,
  });

  return opts;
}
