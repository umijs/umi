import React from 'react';
import { connect, useIntl, getLocale, setLocale } from 'umi';
import { Button } from 'antd';

const Home = (props) => {
  const { title } = props;
  console.log('renderd', title);
  const changeLangs = () => {

    const lang = getLocale()
    const change = lang === 'zh-CN' ? 'en-US' : 'zh-CN'
    //     // 刷新页面
    // setLocale('zh-TW', true);
    // // 不刷新页面
    setLocale(change, false);
  }
  const intl = useIntl();
  return (
    <div>
      <h1>{title}</h1>
      <h2>{intl.formatMessage(
        {
          id: 'umi',
        }
      )}</h2>
      <Button onClick={changeLangs}>切换语言</Button>
    </div>
  )
}
Home.getInitialProps = (async ({ store, isServer, history, match, route }) => {
  // console.log(ctx);
  if (!isServer) { return }
  await store.dispatch({ type: 'test/test' })
  const { test } = store.getState()
  return { test }
})

export default connect((({ test }) => ({ title: test.title })))(Home)
