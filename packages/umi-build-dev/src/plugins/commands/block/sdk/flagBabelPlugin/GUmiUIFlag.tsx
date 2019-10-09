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
      <svg
        width="1em"
        height="1em"
        fill="currentColor"
        viewBox="0 0 1024 1024"
        style={{
          display: 'inline-block',
          verticalAlign: 'middle',
          marginRight: '8px',
        }}
      >
        <path
          d="M482 152h60c5.333 0 8 2.667 8 8v704c0 5.333-2.667 8-8 8h-60c-5.333 0-8-2.667-8-8V160c0-5.333 2.667-8 8-8zM176 474h672c5.333 0 8 2.667 8 8v60c0 5.333-2.667 8-8 8H176c-5.333 0-8-2.667-8-8v-60c0-5.333 2.667-8 8-8z"
          fill="#329bff"
          fillRule="nonzero"
        />
      </svg>
      <span
        style={{
          display: 'inline-block',
          verticalAlign: 'middle',
        }}
      >
        Add to here
      </span>
    </div>
  );
};
