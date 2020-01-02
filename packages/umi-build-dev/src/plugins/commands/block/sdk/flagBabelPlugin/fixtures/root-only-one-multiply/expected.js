import Media from 'react-media';

export default () => (
  <>
    <GUmiUIFlag filename="/tmp/origin.js" index="0" />
    <Media query="(max-width: 599px)">
      {isMobile =>
        <div {...props} isMobile={isMobile}>
          <div>hello</div>
        </div>
      }
    </Media>
    <GUmiUIFlag filename="/tmp/origin.js" index="1" />
  </>
)
