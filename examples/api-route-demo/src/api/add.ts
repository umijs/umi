import { UmiApiRequest, UmiApiResponse } from 'umi';

// An API route to add two numbers
export default function (req: UmiApiRequest, res: UmiApiResponse) {
  const { a, b } = req.query;

  if (!a || !b) {
    return res
      .status(400)
      .json({ error: 'Example usage: https://xxx.host.com/api/add?a=1&b=2' });
  }

  if (isNaN(+a) || isNaN(+b)) {
    return res
      .status(400)
      .json({ error: 'a or b in query string is not a number' });
  }

  res.status(200).json({ ans: +a + +b });
}
