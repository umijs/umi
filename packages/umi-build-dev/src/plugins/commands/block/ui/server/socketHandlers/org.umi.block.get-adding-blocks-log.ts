export default function({ blockService, success }) {
  success({
    data: blockService.getLog(),
    success: true,
  });
}
