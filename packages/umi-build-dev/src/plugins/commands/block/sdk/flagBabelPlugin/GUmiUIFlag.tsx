export default function({ filename, index }) {
  function clickHandler() {
    const el = document.getElementById('umi-ui-bubble');
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
        background: '#c7e4ff',
        border: '1px dashed #329bff',
        margin: '10px 0',
        height: '60px',
        textAlign: 'center',
        color: '#329bff',
        fontSize: '14px',
        lineHeight: '60px',
        cursor: 'pointer',
        overflow: 'hidden',
        fontFamily:
          'Chinese Quote,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,PingFang SC,Hiragino Sans GB,Microsoft YaHei,Helvetica Neue,Helvetica,Arial,sans-serif',
      }}
      className="g_umiuiBlockAddEditMode"
    >
      + 添加到这里（{filename} 的第 {index} 个位置）
    </div>
  );
}
