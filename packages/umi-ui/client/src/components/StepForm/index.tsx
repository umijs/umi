import InternalStepForm from './StepForm';
import StepItem from './StepItem';

type InternalStepFormProps = typeof InternalStepForm;

interface StepForm extends InternalStepFormProps {
  StepItem: typeof StepItem;
}

const StepForm: StepForm = InternalStepForm as StepForm;

export default StepForm;
