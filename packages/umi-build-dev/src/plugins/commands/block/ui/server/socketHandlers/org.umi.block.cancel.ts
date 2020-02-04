export default async function({ blockService, success }) {
  success({
    data: blockService.cancel(),
    success: true,
  });
}
