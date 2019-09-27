// Open editor mode and get the insert poision
export interface PositionData {
  filename: string;
  index: number;
}

export default (api): Promise<PositionData> => {
  api.hideMini();
  window.parent.postMessage(
    JSON.stringify({
      action: 'umi.ui.enableBlockEditMode',
    }),
    '*',
  );

  return new Promise((resolve, reject) => {
    const messageHandler = e => {
      console.log(`[Block] Received message`, e.data);
      try {
        const { action, payload } = JSON.parse(e.data);
        if (action === 'umi.ui.block.addBlock') {
          const position = payload as PositionData;
          window.removeEventListener('message', messageHandler);
          api.showMini();
          resolve(position);
          window.parent.postMessage(
            JSON.stringify({
              action: 'umi.ui.disableBlockEditMode',
            }),
            '*',
          );
        }
      } catch (e) {
        console.error(`[Block] parse message error`, e);
      }
    };
    window.addEventListener('message', messageHandler);
  });
};
