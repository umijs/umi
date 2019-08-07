import { callRemote, listenRemote } from '@/socket';

export async function getHistory() {
  return callRemote({
    type: '@@log/getHistory',
  });
}

export async function listenMessage(params) {
  return listenRemote({
    type: '@@log/message',
    ...params,
  });
}
