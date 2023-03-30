import { useEffect } from 'react';
import { socket } from 'umi';

export default function Page() {
  useEffect(() => {
    return socket.listen(({ type, payload }) => {
      switch (type) {
        case 'callback':
          alert(payload?.data);
          break;
        default:
          break;
      }
    });
  }, []);
  return (
    <div>
      <h1>Overview</h1>
      <button
        onClick={() => {
          socket.send({
            type: 'call',
            payload: { type: 'callback', data: Math.random() },
          });
        }}
      >
        send socket!
      </button>
    </div>
  );
}
