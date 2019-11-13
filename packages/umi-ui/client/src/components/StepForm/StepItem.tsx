import * as React from 'react';
import { IUi } from 'umi-types';

const StepItem: React.SFC<IUi.IStepItemProps> = props => {
  const {
    count,
    handleCurrentStep,
    children,
    saveFormRef,
    index,
    currentStep,
    active,
    handleFinish,
    forms,
  } = props;
  const goNext = () => {
    handleCurrentStep(currentStep + 1);
  };
  const goPrev = () => {
    handleCurrentStep(currentStep - 1);
  };

  return React.cloneElement(children, {
    count,
    currentStep,
    goNext,
    goPrev,
    index,
    active,
    forms,
    style: {
      display: index === currentStep ? 'block' : 'none',
    },
    ref: saveFormRef,
    handleFinish,
  });
};

(StepItem as any).__STEP_FORM_ITEM = true;

export default StepItem;
