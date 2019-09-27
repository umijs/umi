// Open editor mode and get the insert poision
export interface PositionData {
  filename: string;
  index: number;
}

export default (api): Promise<PositionData> => {
  window.parent.postMessage(
    JSON.stringify({
      action: 'umi.ui.checkValidEditSection',
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
        } else if (action === 'umi.ui.checkValidEditSection.success') {
          if (payload.haveValid) {
            api.hideMini();
            window.parent.postMessage(
              JSON.stringify({
                action: 'umi.ui.enableBlockEditMode',
              }),
              '*',
            );
          } else {
            reject(new Error('Can not find insert position'));
          }
        }
      } catch (e) {
        console.error(`[Block] parse message error`, e);
      }
    };
    window.addEventListener('message', messageHandler);
  });
};
