import Media from 'react-media';

export default () => (
  <>
    <GUmiUIFlag filename="/tmp/origin.js" index="0" />
    <Media query="(max-width: 599px)">
      {isMobile => <BasicLayout {...props} isMobile={isMobile} />}
    </Media>
    <GUmiUIFlag filename="/tmp/origin.js" index="1" />
  </>
)
