import * as React from 'react';
import { Steps } from 'antd';
import { FormInstance } from 'antd/lib/form';
import { IUi } from 'umi-types';
import StepItem from './StepItem';

const { useState } = React;
const { Step } = Steps;

const StepForm: React.SFC<IUi.IStepFormProps> = props => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const forms: FormInstance[] = [];

  const { children, onFinish, className } = props;
  const count = React.Children.count(children);

  const handleCurrentStep = (step: number) => {
    if (step >= 0 && step <= count - 1) {
      setCurrentStep(step);
    }
  };

  const getFormsValues = () => {
    return forms
      .map(form => form.getFieldsValue())
      .reduce(
        (curr, acc) => ({
          ...curr,
          ...acc,
        }),
        {},
      );
  };

  const saveFormRef = (i: number) => (ins: any) => {
    forms[i] = ins;
  };

  const handleFinish = () => {
    if (currentStep === count - 1) {
      const values = getFormsValues();
      onFinish(values);
    }
  };
  return (
    <div>
      <Steps current={currentStep} style={{ marginBottom: 16 }} className={className}>
        {React.Children.map(children, (element: any, i) => {
          const { type } = element;
          if (!(type && type.__STEP_FORM_ITEM)) {
            console.warn('StepForm Only accepts StepForm.StepItem');
          }
          return <Step key={i.toString()} {...element.props} />;
        })}
      </Steps>
      {React.Children.map(children, (child, j) =>
        React.cloneElement(child, {
          count,
          currentStep,
          handleCurrentStep,
          handleFinish,
          active: currentStep === j,
          index: j,
          saveFormRef: saveFormRef(j),
        }),
      )}
    </div>
  );
};

(StepForm as any).StepItem = StepItem;

export default StepForm;
