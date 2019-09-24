// Open editor mode and get the insert poision
export interface PositionData {
  filename: string;
  index: number;
}

export default api => {
  api.hideMini();
  window.parent.postMessage(
    JSON.stringify({
      action: 'umi.ui.enableBlockEditMode',
    }),
    '*',
  );

  return new Promise((resolve, reject) => {
    const messageHandler = info => {
      const data: any = JSON.stringify(info);
      console.log('get postmessage data', data);
      if (data.action === 'umi.ui.block.addBlock') {
        const position = data.payload as PositionData;
        window.parent.removeEventListener('message', messageHandler);
        api.showMini();
        resolve(position);
      }
    };
    window.parent.addEventListener('message', messageHandler, false);
  });
};
