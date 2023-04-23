import type { UmiApiRequest, UmiApiResponse } from 'umi';

export default function (
  req: UmiApiRequest,
  _res: UmiApiResponse,
  next: () => void,
) {
  console.info(`[API Route - loggerMiddleware] ${req.method} ${req.url}`);
  next();
}
