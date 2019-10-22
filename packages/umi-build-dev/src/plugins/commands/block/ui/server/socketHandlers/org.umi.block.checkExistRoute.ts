import { AddBlockParams } from '../../../data';

export default function({ payload, blockService, success }) {
  const { path } = payload as AddBlockParams;
  success({
    exists: blockService.routeExists(path),
    success: true,
  });
}
