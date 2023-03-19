import type { IApi } from 'umi';

export default (api: IApi) => {
  api.describe({
    enableBy: api.EnableBy.register,
  });

  api.modifyTelemetryStorage(() => {
    // config the storage umi telemetry will use
    // storage interface has only one async methord save, impletment it by your self.
    return {
      async save(event: any) {
        // simulating  sending to remote
        console.log(`sending to remote: ${JSON.stringify(event)}`);
      },
    };
  });

  api.onBuildComplete(async () => {
    const isRecordSuccess = await api.telemetry.recordAsync({
      name: 'buildComplete',
      payload: {
        data: 'you want to report',
        d2: 123,
      },
    });
    if (!isRecordSuccess) {
      // do something when record failed
    }
  });

  api.onDevCompileDone(() => {
    // sync recrod api, if it fail will be queued and try again
    api.telemetry.record({
      name: 'devCompileDone',
      payload: {
        data: 'you want to report',
        d2: 123,
      },
    });
  });
};
