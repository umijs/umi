import { UmiApiRequest, UmiApiResponse } from 'umi';

export default function (req: UmiApiRequest, res: UmiApiResponse) {
  res.status(200).json(req.params);
}
