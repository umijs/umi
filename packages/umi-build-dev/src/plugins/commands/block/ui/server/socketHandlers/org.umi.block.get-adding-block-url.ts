export default function({ blockService, success }) {
  success({
    data: blockService.getBlockUrl(),
    success: true,
  });
}
