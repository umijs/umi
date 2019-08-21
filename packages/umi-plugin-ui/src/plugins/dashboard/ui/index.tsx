import React from 'react';
import cls from 'classnames';
import { Card, Icon } from 'antd';
import styles from './ui.module.less';

export default () => (
  <div className={styles.container}>
    <div className={cls(styles.card, styles.welcome)}>
      <Card size="small" extra={<Icon type="close" />}>
        <h2>Hi, XXX</h2>
        <p>欢迎来到 Hello World 项目</p>
        <div>
          UmiUI 是蚂蚁金服全新一代 GUI 开发方式，通过 web
          交互的方式对项目进行开发、管理，达到提升研发效率的目的。
        </div>
      </Card>
    </div>
    <div className={styles.card}>
      <Card actions={[<div>前往任务页面</div>]}>
        <div className={styles.main}>
          <div className={cls(styles.icon, styles.build)} />
          <div className={styles.info}>
            <h4>构建</h4>
            <p>这是一段构建的描述信息</p>
          </div>
        </div>
      </Card>
    </div>
    <div className={styles.card}>
      <Card actions={[<div>前往任务页面</div>]}>
        <div className={styles.main}>
          <div className={cls(styles.icon, styles.dev)} />
          <div className={styles.info}>
            <h4>本地启动</h4>
            <p>这是一段本地启动的描述信息</p>
          </div>
        </div>
      </Card>
    </div>
    <div className={styles.card}>
      <Card>
        <div className={styles.future}>
          <div>
            <Icon type="smile" />
          </div>
          <p>敬请期待</p>
        </div>
      </Card>
    </div>
  </div>
);
