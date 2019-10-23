export default function({ blockService, success }) {
  success({
    data: blockService.depthRouteComponentConfig(),
    success: true,
  });
}
