export default function({ blockService, success }) {
  const routers = blockService.depthRouterConfig();
  success({
    data: routers,
    success: true,
  });
}
