import { Service } from 'umi/dist/service/service';

export async function getDevConfig() {
  const service = new Service({
    presets: [require.resolve('./workerPreset')],
  });

  const opts: any = await service.run({
    name: 'dev-config',
    args: [],
  });

  return opts;
}
