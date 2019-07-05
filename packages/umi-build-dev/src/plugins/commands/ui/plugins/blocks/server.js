export default function(api) {
  function getBlocks() {
    return [
      'AccountCenter',
      'AccountSettings',
      'DashboardAnalysis',
      'DashboardMonitor',
      'DashboardWorkplace',
      // 'EditorFlow',
      // 'EditorKoni',
      // 'EditorMind',
      'Exception403',
      'Exception404',
      'Exception500',
      'FormAdvancedForm',
      'FormBasicForm',
      'FormStepForm',
      'ListBasicList',
      'ListCardList',
      'ListSearch',
      'ListSearchApplications',
      'ListSearchArticles',
      'ListSearchProjects',
      'ListTableList',
      'ProfileAdvanced',
      'ProfileBasic',
      'ResultFail',
      'ResultSuccess',
      'UserLogin',
      'UserRegister',
      'UserRegisterResult',
    ];
  }

  api.onUISocket(({ action: { type, payload }, send, log }) => {
    switch (type) {
      case 'blocks/fetch':
        send({
          type: `${type}/success`,
          payload: getBlocks(),
        });
        break;
      case 'blocks/add':
        log('Adding...');
        const { name, path } = payload;
        api.service
          .runCommand('block', {
            _: ['add', name, '--path', path],
          })
          .then(() => {
            log('Done');
            send({
              type: `${type}/success`,
            });
          })
          .catch(e => {
            log('Failed');
          });
        break;
      case 'blocks/runCommand':
        console.log('run command: block', payload);
        api.service
          .runCommand('block', {
            _: payload,
          })
          .then(() => {
            console.log('blocks done');
            send('blocks/save', getConfig());
          });
        break;
      default:
        send({
          type: `${type}/failure`,
          payload: `unhandled type: ${type}`,
        });
        break;
    }
  });
}
