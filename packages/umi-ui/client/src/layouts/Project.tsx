import React from 'react';
import { formatMessage } from 'umi-plugin-locale';

interface ProjectProps {}

class Project extends React.PureComponent {
  render() {
    return (
      <div>
        <h1>UmiJS 项目管理器</h1>
        <div>当前语言：{formatMessage({ id: 'hello' })}</div>
        <div>{this.props.children}</div>
      </div>
    );
  }
}

export default Project;
