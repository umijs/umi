import React from 'react';
import { Sentry, SentryRunTime } from 'umi';
import { ResponseError } from 'umi-request';

export const request = {
  prefix: '',
  method: 'post',
  errorHandler: (error: ResponseError) => {
    // 集中处理错误
    console.log(error);
    // throw error;
    Sentry.captureException(error);
  },
};

export const sentry = {
  showDialog: true,
  fallback: ({ error, componentStack, resetError }) =>
    (
      <React.Fragment>
        <div>You have encountered an error</div>
        {/* <div>{error.toString()}</div> */}
        <div>{componentStack}</div>
        <button
          onClick={() => {
            resetError();
          }}
        >
          Click here to reset!
        </button>
      </React.Fragment>
    ) as React.ReactNode,
  onError: (e) => {
    console.error(e);
  },
  beforeCapture: (scope) => {
    scope.setTag('location', 'first');
    scope.setTag('anotherTag', 'anotherValue');
  },
} as SentryRunTime;
