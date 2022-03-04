import { UmiApiRequest, UmiApiResponse } from 'umi';

// This is an example middleware of new API route feature in Umi 4.
export default function (req: UmiApiRequest, res: UmiApiResponse, next: any) {
  if (!req.headers.authorization) {
    res.status(401).json({
      error: 'Unauthorized. Please set the Authorization header.',
      message:
        'This error is thrown by AuthMiddleware (registered by Umi Plugin)',
    });
    return;
  }

  const type = req.headers.authorization.split(' ')[0];

  if (type !== 'Bearer') {
    res.status(401).json({
      error: 'Unauthorized. Unsupported authorization type.',
      message:
        'This error is thrown by AuthMiddleware (registered by Umi Plugin)',
    });
    return;
  }

  const token = req.headers.authorization.split(' ')[1];

  // Verify the token
  if (token !== 'token') {
    res.status(401).json({
      error: 'Unauthorized. Invalid token. The valid token is "token"',
      message:
        'This error is thrown by AuthMiddleware (registered by Umi Plugin)',
    });
    return;
  }

  next();
}
