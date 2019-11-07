import { IUiApi } from 'umi-types';

let callRemote;
let listenRemote;
let notify;
let intl;
function initApiToGloal(api: IUiApi) {
  callRemote = api.callRemote; // eslint-disable-line
  listenRemote = api.listenRemote;
  notify = api.notify;
  intl = api.intl;
}

export { callRemote, listenRemote, notify, intl, initApiToGloal };
