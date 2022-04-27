export default function getLinkFromTitle(title: string) {
  return (
    title
      .toLowerCase()
      .trim()
      // not remove html tags
      // .replace(/<[!\/a-z].*?>/gi, '')
      // remove unwanted chars
      .replace(
        /[\u2000-\u206F\u2E00-\u2E7F\\'!！"#$%&()（）*+,，.。/:：;；<=>?？@[\]^`{|}~]/g,
        '',
      )
      .replace(/\s/g, '-')
  );
}
