import { queryUserListPermissionCheck } from '@/services/demo/UserController';
import { PageContainer } from '@ant-design/pro-components';
import { Access, useAccess } from '@umijs/max';
import { Button, Typography } from 'antd';
import { useEffect, useState } from 'react';

const AccessPage: React.FC = () => {
  const access = useAccess();
  const [hasQueryPermission, setHasQueryPermission] = useState(false);

  useEffect(() => {
    (async () => {
      const { success } = await queryUserListPermissionCheck();
      setHasQueryPermission(success ?? false);
    })();
  }, []);

  return (
    <PageContainer
      ghost
      header={{
        title: '权限示例',
      }}
    >
      <Typography.Paragraph>
        <Access accessible={access.canSeeAdmin}>
          <Button className="btn-admin">只有 Admin 可以看到这个按钮</Button>
        </Access>
      </Typography.Paragraph>

      <Typography.Paragraph>
        <Access accessible={hasQueryPermission}>
          <Button className="btn-options">
            只有通过 OPTIONS 请求进行动态权限校验成功的可以看到这个按钮
          </Button>
        </Access>
      </Typography.Paragraph>
    </PageContainer>
  );
};

export default AccessPage;
