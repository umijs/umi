const cache = {};

export default async function({ blockService, success, payload, resources }) {
  const { resourceId } = payload as { resourceId: string };
  let data = cache[resourceId];
  if (!data || (payload as { force: boolean }).force) {
    data = await blockService.getBlockList(resourceId, resources);
    cache[resourceId] = data;
  }
  success({
    data,
    success: true,
  });
}
