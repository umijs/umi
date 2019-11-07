import React from 'react';
import { PageHeader } from 'antd';
import { formatMessage } from 'umi-plugin-react/locale';
import { PROJECT_STATUS, IProjectStatus } from '@/enums';
import events, { MESSAGES } from '@/message';
import Layout from './Layout';
import Context from './Context';
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

  handleCurrentChange = (current: IProjectStatus, currentData?: object) => {
    this.setCurrent(current, currentData);
  };

  componentDidMount() {
    events.on(MESSAGES.CHANGE_PROJECT_CURRENT, this.handleCurrentChange);
  }

  componentWillUnmount() {
    events.off(MESSAGES.CHANGE_PROJECT_CURRENT, this.handleCurrentChange);
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
      <Layout type="list" title={formatMessage({ id: 'org.umi.ui.global.project.title' })}>
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
                {this.props.children}
              </div>
            </ProjectContext.Provider>
          )}
        </Context.Consumer>
      </Layout>
    );
  }
}

export default Project;
