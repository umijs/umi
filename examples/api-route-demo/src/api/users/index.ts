import { UmiApiRequest, UmiApiResponse } from 'umi';

export default function (req: UmiApiRequest, res: UmiApiResponse) {
  const name = req.query.name;
  res.status(200).json({ message: 'Hello, ' + name });
}
