type UmiService = new (opts?: any) => {
  run(opts: { name: string; args?: any }): Promise<any>;
};

const { Service } = require('umi') as { Service: UmiService };

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
