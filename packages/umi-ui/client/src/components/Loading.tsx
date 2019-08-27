import React from 'react';
import nprogress from 'nprogress';
import './Loading.less';

const { useEffect } = React;

nprogress.configure({
  showSpinner: false,
  minimum: 0.3,
});

const PageLoading: React.SFC<{}> = () => {
  useEffect(() => {
    nprogress.start();
    return () => {
      nprogress.done();
    };
  });
  return null;
};

export default PageLoading;
