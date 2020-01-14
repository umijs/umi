import SockJS from 'sockjs-client';
import {
  handleErrors,
  handleHashChange,
  handleSuccess,
  handleWarnings,
} from './handlers';

const sock = new SockJS(`/dev-server`);
sock.onopen = () => {};
sock.onmessage = e => {
  const message = JSON.parse(e.data);
  switch (message.type) {
    case 'hash':
      handleHashChange(message.data);
      break;
    case 'still-ok':
    case 'ok':
      handleSuccess();
      break;
    case 'warnings':
      handleWarnings(message.data);
      break;
    case 'errors':
      handleErrors(message.data);
      break;
    default:
      break;
  }
};
sock.onclose = () => {};
