import { UmiApiRequest, UmiApiResponse } from 'umi';

export default function (_req: UmiApiRequest, res: UmiApiResponse) {
  res.status(200).json({ hello: 'world' });
}
