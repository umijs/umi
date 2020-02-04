import Media from 'react-media';

export default () => (
  <Media query="(max-width: 599px)">
    {isMobile => <div>{isMobile ? 'mobile' : 'pc'}</div>}
  </Media>
)
