import { PageContainer } from '@ant-design/pro-layout';
import { Alert, Card, Typography } from 'antd';
import React from 'react';

const CodePreview: React.FC = ({ children }) => (
  <pre className={''}>
    <code>
      <Typography.Text copyable>{children}</Typography.Text>
    </code>
  </pre>
);

export default function WelcomePage() {
  return (
    <div>
      <PageContainer>
        <Card>
          <Alert
            message={'a'}
            type="success"
            showIcon
            banner
            style={{
              margin: -12,
              marginBottom: 24,
            }}
          />
          <Typography.Text strong>
            Advanced Form
            <a
              href="https://procomponents.ant.design/components/table"
              rel="noopener noreferrer"
              target="__blank"
            >
              Welcome
            </a>
          </Typography.Text>
          <CodePreview>yarn add @ant-design/pro-table</CodePreview>
          <Typography.Text
            strong
            style={{
              marginBottom: 12,
            }}
          >
            Advanced layout
            <a
              href="https://procomponents.ant.design/components/layout"
              rel="noopener noreferrer"
              target="__blank"
            >
              Welcome
            </a>
          </Typography.Text>
          <CodePreview>yarn add @ant-design/pro-layout</CodePreview>
        </Card>
      </PageContainer>
    </div>
  );
}
