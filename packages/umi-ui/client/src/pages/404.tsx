import * as React from 'react';
import { Result, Button } from 'antd';

import styles from './404.less';

const NotFound: React.SFC<{}> = props => (
  <Result
    status="404"
    title="404"
    subTitle="Sorry, the page you visited does not exist."
    extra={
      <Button
        type="primary"
        onClick={() => {
          window.location.href = '/';
        }}
      >
        Back
      </Button>
    }
  />
);

export default NotFound;
