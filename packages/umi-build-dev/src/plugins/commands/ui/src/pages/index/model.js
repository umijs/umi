window.send = function() {
  alert(`[Error] send not ready.`);
};

export default {
  state: {},
  subscriptions: {
    sockjs({ dispatch }) {
      const sock = new window.SockJS('/umiui');

      function send(type, payload) {
        sock.send(JSON.stringify({ type, payload }));
      }
      window.send = send;

      sock.onopen = () => {};
      sock.onmessage = e => {
        console.log('[RECEIVED FROM SERVER]', e.data);
        const { type, payload } = JSON.parse(e.data);
        dispatch({ type, payload });
      };
      sock.onclose = () => {
        console.log('close');
      };
    },
  },
};
