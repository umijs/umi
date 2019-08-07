import React from 'react';
import { PageHeader } from 'antd';
import { PROJECT_STATUS, IProjectStatus } from '@/enums';
import Layout from './Layout';
import Context from './Context';
import Logs from './Logs';
import ProjectContext from './ProjectContext';
import scrollTop from '@/utils/scrollTop';
import styles from './Project.less';

interface IProjectProps {}

interface IProjectState {
  /** current step in project */
  current: IProjectStatus;
  /** step data */
  currentData?: object;
}

class Project extends React.PureComponent<IProjectProps, IProjectState> {
  constructor(props: IProjectProps) {
    super(props);
    this.state = {
      current: PROJECT_STATUS.list,
    };
  }
  setCurrent = (current: IProjectStatus, currentData?: object) => {
    this.setState({
      current,
      currentData,
    });
    // scrollTop
    scrollTop();
  };
  handleBackClick = () => {
    const { current } = this.state;
    if (current !== 'list') {
      this.setCurrent('list');
    }
  };
  render() {
    const { current, currentData } = this.state;
    return (
      <Layout>
        <Context.Consumer>
          {context => (
            <ProjectContext.Provider
              value={{
                ...context,
                current,
                currentData,
                setCurrent: this.setCurrent,
              }}
            >
              <div className={styles['project-l']}>
                {current !== 'list' && (
                  <PageHeader
                    title={context.formatMessage({
                      id: `org.umi.ui.global.project.${
                        current === 'progress' ? 'create' : current
                      }.title`,
                    })}
                    onBack={() => {
                      this.setCurrent('list');
                    }}
                    className={styles['project-l-header']}
                  />
                )}
                <div>{this.props.children}</div>
                <div className="logs">
                  <h2>日志</h2>
                  <Logs />
                </div>
              </div>
            </ProjectContext.Provider>
          )}
        </Context.Consumer>
      </Layout>
    );
  }
}

export default Project;
