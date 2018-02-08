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
    {props.language === 'en' ? siteConfig.title : '五米'}
    <small>
      {props.language === 'en'
        ? siteConfig.tagline
        : '极快的类 Next.js 的 React 应用框架。'}
    </small>
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
              {language === 'en' ? 'GET STARTED' : '快速入门'}
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
              'PWA, code splitting, tree-shake, scope-hoist, smart extraction of common files, Critical CSS, preload, hash build, preact and more, and your same code will continue to improve as umi improves.',
            image: imgUrl('speed.svg'),
            imageAlign: 'top',
            title: 'High Performance',
          },
          {
            content:
              'You just need only one dependent umi to start the development, without having to install react, preact, react-router, eslint, babel, jest and so on.',
            image: imgUrl('out-of-box.svg'),
            imageAlign: 'top',
            title: 'Out Of The Box',
          },
          {
            content:
              'Support both single page and multiple pages, deploy to the cdn, APP Containers, yunfengdie and other environments with one copy of code.',
            image: imgUrl('user.svg'),
            imageAlign: 'top',
            title: 'Multiple Platform',
          },
        ]
      : [
          {
            content:
              'PWA、按需加载、tree-shake、scope-hoist、智能提取公共文件、Critical CSS、preload、hash build、preact 等等，并且，你相同的代码会随着 umi 的改进而不断提升性能。',
            image: imgUrl('speed.svg'),
            imageAlign: 'top',
            title: '高性能',
          },
          {
            content:
              '你只需一个依赖 umi 就可启动开发，而无需安装 react、preact、react-router、eslint、babel、jest 等。',
            image: imgUrl('out-of-box.svg'),
            imageAlign: 'top',
            title: '开箱即用',
          },
          {
            content:
              '一键切换单页和多页，一份代码同时部署到 cdn、容器、云凤蝶等环境，详见部署文档。',
            image: imgUrl('user.svg'),
            imageAlign: 'top',
            title: '多端',
          },
          {
            content:
              'umi 的整个生命周期都是插件化的，甚至就是由大量插件组成，比如 http mock、service worker、layout、高清方案等，都是一个个的插件。',
            image: imgUrl('plugin.svg'),
            imageAlign: 'top',
            title: '扩展性',
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
  <Container padding={['bottom', 'top']} background="light">
    <GridBlock
      align="left"
      contents={[
        props.language === 'en'
          ? {
              content:
                'Based on the experience of create-react-app, and do more, such as compile on-demand, dev server disconnection reconnect ...',
              image: imgUrl('terminal.png'),
              imageAlign: 'right',
              title: 'Development experience',
            }
          : {
              content:
                '基于 create-react-app 实现更多体验上的优化，比如按需编译（不管有项目多大启动时间都不超过 10s）、dev server 断线重连、配置的校验、自动生效以及提示到行等。',
              image: imgUrl('terminal.png'),
              imageAlign: 'right',
              title: '开发体验',
            },
      ]}
    />
  </Container>
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
          <Description language={language} />
          <Showcase language={language} />
        </div>
      </div>
    );
  }
}

module.exports = Index;
