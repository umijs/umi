const React = require('react');

const CompLibrary = require('../../core/CompLibrary.js');
const MarkdownBlock = CompLibrary.MarkdownBlock; /* Used to read markdown */
const Container = CompLibrary.Container;
const GridBlock = CompLibrary.GridBlock;

const siteConfig = require(process.cwd() + '/siteConfig.js');

function imgUrl(img) {
  return siteConfig.baseUrl + 'img/' + img;
}

function docUrl(doc, language) {
  return siteConfig.baseUrl + 'docs/' + (language ? language + '/' : '') + doc;
}

function pageUrl(page, language) {
  return siteConfig.baseUrl + (language ? language + '/' : '') + page;
}

class Button extends React.Component {
  render() {
    return (
      <div className="pluginWrapper buttonWrapper">
        <a className="button" href={this.props.href} target={this.props.target}>
          {this.props.children}
        </a>
      </div>
    );
  }
}

Button.defaultProps = {
  target: '_self',
};

const SplashContainer = props => (
  <div className="homeContainer">
    <div className="homeSplashFade">
      <div className="wrapper homeWrapper">{props.children}</div>
    </div>
  </div>
);

const Logo = props => (
  <div className="projectLogo">
    <img src={props.img_src} />
  </div>
);

const ProjectTitle = props => (
  <h2 className="projectTitle">
    { props.language === 'en' ? siteConfig.title : '五米' }
    <small>{siteConfig.tagline}</small>
  </h2>
);

const PromoSection = props => (
  <div className="section promoSection">
    <div className="promoRow">
      <div className="pluginRowBlock">{props.children}</div>
    </div>
  </div>
);

class HomeSplash extends React.Component {
  render() {
    let language = this.props.language || '';
    return (
      <SplashContainer>
        <Logo img_src={imgUrl('rice.svg')} />
        <div className="inner">
          <ProjectTitle language={language} />
          <PromoSection>
            <Button href={docUrl('getting-started.html', language)}>
              GET STARTED
            </Button>
            <Button href="https://github.com/umijs/umi">GITHUB</Button>
          </PromoSection>
          <div
            style={{
              height: 20,
            }}
          >
            <a
              className="github-button"
              href="https://github.com/umijs/umi"
              data-icon="octicon-star"
              data-count-href="/umijs/umi/stargazers"
              data-show-count={true}
              data-count-aria-label="# stargazers on GitHub"
              aria-label="Star this project on GitHub"
            >
              Star
            </a>
          </div>
        </div>
      </SplashContainer>
    );
  }
}

const Block = props => (
  <Container
    padding={['bottom', 'top']}
    id={props.id}
    background={props.background}
  >
    <GridBlock align="center" contents={props.children} layout={props.layout} />
  </Container>
);

const Features = props => (
  <Block layout="fourColumn">
    {props.language === 'en'
      ? [
          {
            content:
              "Built-in PWA, page-level on-demand loading, Webpack's tree-shake and scope hoist, intelligent extraction of common modules, and more. And, your application will continue to improve performance as umi improves.",
            image: imgUrl('speed.svg'),
            imageAlign: 'top',
            title: 'High Performance',
          },
          {
            content:
              'You do not need to install dozens of dependencies such as react, antd, antd-mobile, webpack, babel, eslint, jest, etc., and only need one umi dependency. You do not even have to configure babel-plugin-import for antd.',
            image: imgUrl('out-of-box.svg'),
            imageAlign: 'top',
            title: 'Out Of The Box',
          },
          {
            content:
              'By statically wrapping the way, seamlessly switch between single page and multi page mode, so if you want to deploy to the server and containers (such as Alipay, Taobao, etc.), a code can be.',
            image: imgUrl('user.svg'),
            imageAlign: 'top',
            title: 'Multiple Platform',
          },
        ]
      : [
          {
            content:
              '默认内置 PWA、页面级的按需加载、Webpack 的 tree-shake 和 scope hoist、公共模块的智能提取，等等。并且，你相同的代码会随着 umi 的改进而不断提升性能。',
            image: imgUrl('speed.svg'),
            imageAlign: 'top',
            title: '高性能',
          },
          {
            content:
              '您无需安装 react、antd、antd-mobile、webpack、babel、eslint、jest 等数十个依赖，只需一个 umi 依赖。甚至无需为 antd 配置 babel-plugin-import 。',
            image: imgUrl('out-of-box.svg'),
            imageAlign: 'top',
            title: '开箱即用',
          },
          {
            content:
              '通过静态化打包的方式，无缝切换单页和多页模式，所以你如果要同步部署到服务器和容器（比如支付宝、淘宝等），一份代码即可。',
            image: imgUrl('user.svg'),
            imageAlign: 'top',
            title: '多端',
          },
        ]}
  </Block>
);

const FeatureCallout = props => {
  return (
    <div
      className="productShowcaseSection paddingBottom"
      style={{ textAlign: 'center' }}
    >
      <h2>Feature Callout</h2>
      <MarkdownBlock>These are features of this project</MarkdownBlock>
    </div>
  );
};

const LearnHow = props => (
  <Block background="light">
    {[
      {
        content: 'Talk about learning how to use this',
        image: imgUrl('rice.svg'),
        imageAlign: 'right',
        title: 'Learn How',
      },
    ]}
  </Block>
);

const TryOut = props => (
  <Block id="try">
    {[
      {
        content: 'Talk about trying this out',
        image: imgUrl('rice.svg'),
        imageAlign: 'left',
        title: 'Try it Out',
      },
    ]}
  </Block>
);

const Description = props => (
  <Block background="dark">
    {[
      {
        content: 'This is another description of how this project is useful',
        image: imgUrl('rice.svg'),
        imageAlign: 'right',
        title: 'Description',
      },
    ]}
  </Block>
);

const Showcase = props => {
  if ((siteConfig.users || []).length === 0) {
    return null;
  }
  const showcase = siteConfig.users
    .filter(user => {
      return user.pinned;
    })
    .map((user, i) => {
      return (
        <a href={user.infoLink} key={i}>
          <img src={user.image} title={user.caption} />
        </a>
      );
    });

  return (
    <div className="productShowcaseSection paddingBottom">
      <h2>{"Who's Using This?"}</h2>
      <p>Umi is used by all these companies...</p>
      <div className="logos">{showcase}</div>
      <div className="more-users">
        <a className="button" href={pageUrl('users.html', props.language)}>
          More {siteConfig.title} Users
        </a>
      </div>
    </div>
  );
};

class Index extends React.Component {
  render() {
    let language = this.props.language || '';

    return (
      <div>
        <HomeSplash language={language} />
        <div className="mainContainer">
          <Features language={language} />
          {/*<FeatureCallout language={language} />*/}
          {/*<LearnHow />*/}
          {/*<TryOut />*/}
          <Description />
          <Showcase language={language} />
        </div>
      </div>
    );
  }
}

module.exports = Index;
