export default async function({ blockService, success, payload }) {
  success({
    data: blockService.retry({ ...payload }),
    success: true,
  });
}
