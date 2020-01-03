import Media from 'react-media';

export default () => (
  <Media query="(max-width: 599px)">
    {isMobile =>
      <div {...props} isMobile={isMobile}>
        <div>hello</div>
      </div>
    }
  </Media>
)
