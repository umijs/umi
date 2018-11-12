export default {
  state: {},
  subscriptions: {
    sockjs({ dispatch }) {
      const sock = new window.SockJS('/umiui');

      function send(type, payload) {
        sock.send(JSON.stringify({ type, payload }));
      }

      sock.onopen = () => {
        send('haha');
        send('a', { foo: 'bar' });
      };
      sock.onmessage = e => {
        console.log('message', e.data);
      };
      sock.onclose = () => {
        console.log('close');
      };
    },
  },
};
