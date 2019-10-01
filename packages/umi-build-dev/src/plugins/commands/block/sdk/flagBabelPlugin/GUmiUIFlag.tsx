import React from 'react';

export default ({ filename, index }) => {
  function clickHandler() {
    const el = document.getElementById('umi-ui-bubble') as HTMLIFrameElement;
    if (el && el.contentWindow) {
      el.contentWindow.postMessage(
        JSON.stringify({
          action: 'umi.ui.block.addBlock',
          payload: {
            filename,
            index,
          },
        }),
        '*',
      );
    }
  }

  return (
    <div
      onClick={clickHandler}
      style={{
        background: 'rgba(24,144,255,0.15)',
        border: '1px dashed #1890ff',
        margin: '10px 0',
        height: '60px',
        textAlign: 'center',
        color: '#329bff',
        fontSize: '14px',
        lineHeight: '60px',
        cursor: 'pointer',
        transition: 'all .3s',
        overflow: 'hidden',
        fontFamily:
          'Chinese Quote,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,PingFang SC,Hiragino Sans GB,Microsoft YaHei,Helvetica Neue,Helvetica,Arial,sans-serif',
      }}
      className="g_umiuiBlockAddEditMode"
    >
      + 添加到这里（{filename} 的第 {index} 个位置）
    </div>
  );
};
