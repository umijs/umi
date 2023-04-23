import _middlewares from "{{{ apiRootDirPath }}}/_middlewares";
import handler from "{{{ handlerPath }}}";
import { UmiApiRequest, UmiApiResponse } from "{{{ adapterPath }}}";

const apiRoutes = {{{ apiRoutes }}};

export default async (req, res) => {

  const umiReq = new UmiApiRequest(req, apiRoutes);
  await umiReq.readBody();
  const umiRes = new UmiApiResponse(res);
  await new Promise((resolve) => _middlewares(umiReq, umiRes, resolve));
  await handler(umiReq, umiRes);

}
