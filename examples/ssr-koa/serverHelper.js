/*
 * @Description:
 * @Author: xiaobei
 * @Date: 2020-07-12 10:10:25
 * @LastEditTime: 2020-07-12 10:12:30
 */

const parseCookie = (ctx) => {
  let cookies = ctx.get('cookie')
  if (!cookies) {
    return []
  }
  cookies = cookies.split(';')
  const res = {}
  for (const item of cookies) {
    const kv = item.split('=')
    if (kv && kv.length > 0) {
      res[kv[0].trim()] = decodeURIComponent(kv[1]);
    }
  }
  return res;
}

const parseNavLang = (ctx) => {
  // 服务端无法获取navigator.language，所以只能通过Accept-Language来判断浏览器语言。
  let navigatorLang;
  const clientLang = ctx.get('Accept-Language');
  if (clientLang.startsWith('zh')) {
    navigatorLang = 'zh-CN';
  } else if (clientLang.startsWith('en')) {
    navigatorLang = 'en-US';
  }
  return navigatorLang
}










module.exports = {
  parseCookie,
  parseNavLang
}
