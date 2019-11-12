import { AddBlockParams } from '../../../data';

export default async function({ blockService, success, payload }) {
  const { url } = payload as AddBlockParams;
  await blockService.run({ ...payload });
  success({
    data: {
      message: `🎊 ${url} block is adding`,
    },
    success: true,
  });
}
