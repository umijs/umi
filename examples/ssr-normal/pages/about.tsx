import React from 'react';

function About(props) {
  const { aboutData } = props;
  return <div>Hello {aboutData?.hello}</div>;
}

About.getInitialProps = async () => {
  return {
    aboutData: {
      hello: 'world',
    },
  };
};

export default About;
