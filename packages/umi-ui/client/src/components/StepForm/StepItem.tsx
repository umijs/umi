import * as React from 'react';

export interface IStepItemForm {
  currentStep: number;
  handleFinish: () => void;
  goNext: () => void;
  goPrev: () => void;
  index: number;
  active: boolean;
  [key: string]: any;
}

interface StepItemProps {
  children: React.ReactElement<Partial<IStepItemForm>>;
  [key: string]: any;
}

const StepItem: React.SFC<StepItemProps> = props => {
  const {
    count,
    handleCurrentStep,
    children,
    saveFormRef,
    index,
    currentStep,
    active,
    handleFinish,
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
    style: {
      display: index === currentStep ? 'block' : 'none',
    },
    ref: saveFormRef,
    handleFinish,
  });
};

(StepItem as any).__STEP_FORM_ITEM = true;

export default StepItem;
