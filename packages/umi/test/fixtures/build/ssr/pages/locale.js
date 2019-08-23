import React from 'react';

const message = {
  'zh-CN': {
    bar: '这是测试'
  },
  'en-US': {
    bar: 'This is test'
  }
}

const Locale = (props) => {
  const { query } = props;
  const { locale = 'zh-CN' } = query;
  const msg = message[locale] || message['zh-CN'];

  return (
    <div className="wrapper">
      {msg['bar']}
    </div>
  )
}

Locale.getInitialProps = async ({ route, isServer, location }) => {
  const { query } = location;

  return {
    query,
  }
}

export default Locale;
